import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { parse } from 'cookie';
import { sessionStore, sessionSecret } from './index.js';
import { storage } from './storage.js';
import { generateAiQuizData } from './ai-utils.js';
import { db } from './db.js';
import { users, duels, quizzes, questions as questionsTable, answers } from '../shared/schema.js';
import { eq, sql } from 'drizzle-orm';

interface DuelPlayer {
  userId: number;
  socket: WebSocket;
  username: string;
}

interface DuelRoom {
  id: number;
  challenger: DuelPlayer;
  receiver: DuelPlayer;
  status: 'negotiating' | 'ready' | 'in_progress' | 'finished';
  wager: number;
  quizId?: number;
  currentQuestionIndex: number;
  questions: any[];
  scores: { [userId: number]: number };
}

export class DuelServer {
  public static instance: DuelServer | null = null;
  private wss: WebSocketServer;
  private userSockets: Map<number, WebSocket> = new Map();
  private activeDuels: Map<number, DuelRoom> = new Map();
  private duelTimers: Map<number, NodeJS.Timeout> = new Map();

  constructor(server: Server) {
    DuelServer.instance = this;
    this.wss = new WebSocketServer({ server, path: '/ws/duels' });
    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🚀 Duel WebSocket Server initialized at /ws/duels');
  }

  private async handleConnection(socket: WebSocket, req: any) {
    const userId = await this.getUserIdFromRequest(req);
    if (!userId) {
      socket.close(1008, 'Unauthorized');
      return;
    }

    const user = await storage.getUser(userId);
    if (!user) {
      socket.close(1008, 'User not found');
      return;
    }

    this.userSockets.set(userId, socket);
    console.log(`🔌 User ${user.username} (ID: ${userId}) connected to Duels`);

    socket.on('message', (data) => this.handleMessage(userId, data));
    socket.on('close', () => {
      this.userSockets.delete(userId);
      console.log(`🔌 User ${userId} disconnected`);
    });
  }

  private async getUserIdFromRequest(req: any): Promise<number | null> {
    const cookies = parse(req.headers.cookie || '');
    const sid = cookies['connect.sid'];
    if (!sid) return null;

    // The sid from cookie is prefixed with 's:' and might be signed. 
    // We need the raw ID to look up in the store.
    const rawSid = sid.split('.')[0].slice(2);

    return new Promise((resolve) => {
      sessionStore.get(rawSid, (err, session) => {
        if (err || !session || !session.userId) {
          resolve(null);
        } else {
          resolve(session.userId);
        }
      });
    });
  }

  private async handleMessage(userId: number, data: any) {
    try {
      const message = JSON.parse(data.toString());
      const { type, payload } = message;

      switch (type) {
        case 'duel:challenge':
          await this.processChallenge(userId, payload);
          break;
        case 'duel:respond':
          await this.processResponse(userId, payload);
          break;
        case 'duel:submit_answer':
          await this.processAnswer(userId, payload);
          break;
        case 'chat:send':
          await this.processChatMessage(userId, payload);
          break;
        default:
          console.warn(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error('Error processing WS message:', error);
    }
  }

  private async processChallenge(challengerId: number, payload: { receiverId: number; wager: number; topic?: string }) {
    const { receiverId, wager, topic } = payload;
    const challenger = await storage.getUser(challengerId);
    const receiverSocket = this.userSockets.get(receiverId);

    if (!receiverSocket) {
        this.sendToUser(challengerId, { type: 'duel:error', payload: { message: 'El oponente no está en línea' } });
        return;
    }

    // Check credits
    if (challenger!.hintCredits < wager) {
        this.sendToUser(challengerId, { type: 'duel:error', payload: { message: 'No tienes suficientes créditos' } });
        return;
    }

    // Create duel in DB
    const [newDuel] = await db.insert(duels).values({
      challengerId,
      receiverId,
      status: 'inviting',
      wager,
    }).returning();

    this.sendToUser(receiverId, {
      type: 'duel:invited',
      payload: {
        duelId: newDuel.id,
        challengerName: challenger!.name,
        wager,
        topic: topic || 'Matemáticas Generales'
      }
    });
  }

  private async processResponse(userId: number, payload: { duelId: number; action: 'accept' | 'reject' | 'counter'; wager?: number }) {
    const { duelId, action, wager } = payload;
    const duelRecord = await db.query.duels.findFirst({ where: eq(duels.id, duelId) });

    if (!duelRecord) return;

    if (action === 'reject') {
      await db.update(duels).set({ status: 'cancelled' }).where(eq(duels.id, duelId));
      this.sendToUser(duelRecord.challengerId, { type: 'duel:rejected', payload: { duelId } });
    } else if (action === 'counter') {
      await db.update(duels).set({ wager: wager || duelRecord.wager }).where(eq(duels.id, duelId));
      this.sendToUser(duelRecord.challengerId, { type: 'duel:countered', payload: { duelId, wager } });
    } else if (action === 'accept') {
      await this.startDuel(duelId);
    }
  }

  private async startDuel(duelId: number) {
    const duelRecord = await db.query.duels.findFirst({ where: eq(duels.id, duelId) });
    if (!duelRecord) return;

    // Mark as ready/preparing
    await db.update(duels).set({ status: 'ready' }).where(eq(duels.id, duelId));

    this.broadcastToDuel(duelId, { type: 'duel:preparing', payload: { duelId } });

    try {
      // Generate AI Quiz
      const quizData = await generateAiQuizData({
        topicDescription: "Duelo de velocidad matemática",
        categoryName: "Duelo",
        difficulty: "medium",
        questionCount: 5
      });

      // Persist quiz
      const result = await db.transaction(async (tx) => {
        const [newQuiz] = await tx.insert(quizzes).values({
          title: quizData.title,
          description: quizData.description,
          categoryId: 1, // Default category
          totalQuestions: quizData.questions.length,
          timeLimit: 300,
          difficulty: 'medium',
          isPublic: false,
          isAiGenerated: true,
          createdByUserId: duelRecord.challengerId
        }).returning();

        const questionsWithIds = [];
        for (const q of quizData.questions) {
          const [createdQ] = await tx.insert(questionsTable).values({
            quizId: newQuiz.id,
            content: q.content,
            difficulty: 2,
            type: 'multiple_choice',
            points: 1,
            explanation: q.explanation
          }).returning();
          
          const createdAnswers = await tx.insert(answers).values(
            q.options.map((opt: any) => ({
              questionId: createdQ.id,
              content: opt.text,
              isCorrect: opt.isCorrect
            }))
          ).returning();

          questionsWithIds.push({ ...createdQ, options: createdAnswers });
        }

        await tx.update(duels).set({ quizId: newQuiz.id, status: 'in_progress' }).where(eq(duels.id, duelId));
        return { quizId: newQuiz.id, questions: questionsWithIds };
      });

      // Initialize Room
      const challenger = await storage.getUser(duelRecord.challengerId);
      const receiver = await storage.getUser(duelRecord.receiverId);

      const room: DuelRoom = {
        id: duelId,
        challenger: { userId: duelRecord.challengerId, socket: this.userSockets.get(duelRecord.challengerId)!, username: challenger!.name },
        receiver: { userId: duelRecord.receiverId, socket: this.userSockets.get(duelRecord.receiverId)!, username: receiver!.name },
        status: 'in_progress',
        wager: duelRecord.wager,
        quizId: result.quizId,
        currentQuestionIndex: 0,
        questions: result.questions,
        scores: { [duelRecord.challengerId]: 0, [duelRecord.receiverId]: 0 }
      };

      this.activeDuels.set(duelId, room);
      
      // Start!
      this.broadcastToDuel(duelId, { 
        type: 'duel:start', 
        payload: { 
            questionsCount: room.questions.length,
            opponentName: room.receiver.username,
            duelId: room.id
        } 
      });

      setTimeout(() => this.sendNextQuestion(duelId), 3000);

    } catch (error) {
      console.error('Failed to generate duel quiz:', error);
      this.broadcastToDuel(duelId, { type: 'duel:error', payload: { message: 'Error al generar el duelo. Intenta de nuevo.' } });
    }
  }

  private sendNextQuestion(duelId: number) {
    const room = this.activeDuels.get(duelId);
    if (!room || room.currentQuestionIndex >= room.questions.length) {
        this.finishDuel(duelId);
        return;
    }

    // Clear previous timer
    if (this.duelTimers.has(duelId)) {
        clearTimeout(this.duelTimers.get(duelId)!);
    }

    const question = room.questions[room.currentQuestionIndex];
    this.broadcastToDuel(duelId, {
      type: 'duel:question',
      payload: {
        index: room.currentQuestionIndex,
        content: question.content,
        options: question.options.map((o: any) => ({ id: o.id, content: o.content })),
        timeLimit: 20
      }
    });

    // Set timeout for this question
    const timer = setTimeout(() => {
        this.broadcastToDuel(duelId, { type: 'duel:round_timeout', payload: { index: room.currentQuestionIndex } });
        room.currentQuestionIndex++;
        setTimeout(() => this.sendNextQuestion(duelId), 3000);
    }, 20000);

    this.duelTimers.set(duelId, timer);
  }

  private async processAnswer(userId: number, payload: { duelId: number; questionIndex: number; answerId: number }) {
    const { duelId, questionIndex, answerId } = payload;
    const room = this.activeDuels.get(duelId);
    if (!room || room.currentQuestionIndex !== questionIndex) return;

    const question = room.questions[questionIndex];
    const answer = question.options.find((o: any) => o.id === answerId);

    if (answer?.isCorrect) {
        // Clear timer since someone answered correctly
        if (this.duelTimers.has(duelId)) {
            clearTimeout(this.duelTimers.get(duelId)!);
            this.duelTimers.delete(duelId);
        }

        room.scores[userId]++;
        this.broadcastToDuel(duelId, {
            type: 'duel:round_result',
            payload: {
                winnerId: userId,
                winnerName: userId === room.challenger.userId ? room.challenger.username : room.receiver.username,
                scores: room.scores
            }
        });

        // Delay before next question
        room.currentQuestionIndex++;
        setTimeout(() => this.sendNextQuestion(duelId), 3000);
    } else {
        // Just inform the user they were wrong
        this.sendToUser(userId, { type: 'duel:wrong_answer' });
    }
  }

  private async finishDuel(duelId: number) {
    if (this.duelTimers.has(duelId)) {
        clearTimeout(this.duelTimers.get(duelId)!);
        this.duelTimers.delete(duelId);
    }

    const room = this.activeDuels.get(duelId);
    if (!room) return;

    const s1 = room.scores[room.challenger.userId];
    const s2 = room.scores[room.receiver.userId];
    let winnerId = null;
    
    if (s1 > s2) winnerId = room.challenger.userId;
    else if (s2 > s1) winnerId = room.receiver.userId;

    // Transactional Credit Update
    await db.transaction(async (tx) => {
        if (winnerId) {
            const loserId = winnerId === room.challenger.userId ? room.receiver.userId : room.challenger.userId;
            
            // Loser pays
            await tx.execute(sql`UPDATE users SET hint_credits = hint_credits - ${room.wager} WHERE id = ${loserId}`);
            // Winner gets
            await tx.execute(sql`UPDATE users SET hint_credits = hint_credits + ${room.wager} WHERE id = ${winnerId}`);
        }

        await tx.update(duels).set({
            status: 'finished',
            scores: room.scores,
            winnerId
        }).where(eq(duels.id, duelId));
    });

    this.broadcastToDuel(duelId, {
        type: 'duel:end',
        payload: {
            scores: room.scores,
            winnerId
        }
    });

    this.activeDuels.delete(duelId);
  }

  private async processChatMessage(senderId: number, payload: { receiverId: number; content: string }) {
    const receiverId = Number(payload.receiverId);
    const content = payload.content;

    if (!content || !receiverId) {
      console.warn(`[Chat] Invalid payload from ${senderId}:`, payload);
      return;
    }

    try {
      const message = await storage.saveChatMessage(Number(senderId), receiverId, content);
      
      // Notify sender
      this.sendToUser(senderId, {
        type: 'chat:receive',
        payload: message
      });

      // Notify receiver if online
      this.sendToUser(receiverId, {
        type: 'chat:receive',
        payload: message
      });
    } catch (error) {
      console.error('[Chat] Error saving/sending message:', error);
    }
  }

  public broadcastToUser(userId: number, message: any) {
    this.sendToUser(userId, message);
  }

  private sendToUser(userId: number, message: any) {
    const socket = this.userSockets.get(userId);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  private broadcastToDuel(duelId: number, message: any) {
    const room = this.activeDuels.get(duelId);
    if (room) {
      this.sendToUser(room.challenger.userId, message);
      this.sendToUser(room.receiver.userId, message);
    } else {
        // Fallback for negotiation where room isn't in memory yet
        db.query.duels.findFirst({ where: eq(duels.id, duelId) }).then(duel => {
            if (duel) {
                this.sendToUser(duel.challengerId, message);
                this.sendToUser(duel.receiverId, message);
            }
        });
    }
  }
}
