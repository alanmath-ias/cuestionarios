import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { parse } from 'cookie';
import { sessionStore, sessionSecret } from './index.js';
import { storage } from './storage.js';
import { generateAiQuizData } from './ai-utils.js';
import { db } from './db.js';
import { users, duels, quizzes, questions as questionsTable, answers, friendships, messages } from '../shared/schema.js';
import { eq, sql, or, and, inArray } from 'drizzle-orm';

interface DuelPlayer {
  userId: number;
  socket?: WebSocket;
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
  topic?: string;
  failedUserIds: number[];
  questionStartTime: number;
  bonusCredits: { [userId: number]: number };
  history: any[];
  participantsGone: Set<number>;
  currentRoundAnswers: { userId: number; answerId: number }[];
  spectators: Set<WebSocket>;
  handicap?: {
    points?: { value: number; targetId: number };
    time?: { value: number; targetId: number };
  };
}

interface ManagedChallengePlayer {
  userId: number;
  socket?: WebSocket | null;
  username: string;
  status: 'pending' | 'ready' | 'abandoned' | 'finished';
  score: number;
  currentIndex: number; // Added for individual pacing
  pointsHandicap: number;
  timeHandicap: number;
}

interface ManagedChallengeRoom {
  id: number;
  adminId: number;
  adminSocket?: WebSocket | null;
  players: Map<number, ManagedChallengePlayer>;
  status: 'pending' | 'ready' | 'in_progress' | 'finished';
  wager: number;
  creditsMode: 'redistribute' | 'system_pay';
  prizeConfig: any;
  quizId?: number;
  currentQuestionIndex: number;
  questions: any[];
  questionStartTime: number;
  history: any[];
  topic?: string;
  failedUserIds: number[];
  currentRoundAnswers: { userId: number; answerId: number }[];
  bonusCredits: { [userId: number]: number };
  questionsCount: number;
  timerId?: NodeJS.Timeout;
}

export class DuelServer {
  public static instance: DuelServer | null = null;
  private wss: WebSocketServer;
  private userSockets = new Map<number, Set<WebSocket>>();
  private activeDuels = new Map<number, DuelRoom>();
  private activeManagedChallenges = new Map<number, ManagedChallengeRoom>();
  private adminSockets = new Set<WebSocket>();
  private duelTimers = new Map<number, NodeJS.Timeout>();

  constructor(server: Server) {
    DuelServer.instance = this;
    this.wss = new WebSocketServer({ server, path: '/ws/duels' });
    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();
    
    // Periodic cleanup of stale duels (every 2 minutes)
    setInterval(() => this.cleanupStaleDuels(), 120000);
    
    console.log('🚀 Duel WebSocket Server initialized at /ws/duels');
  }

  private cleanupStaleDuels() {
      const now = Date.now();
      for (const [duelId, room] of this.activeDuels.entries()) {
          const isChallengerActive = this.isUserOnline(room.challenger.userId);
          const isReceiverActive = this.isUserOnline(room.receiver.userId);

          // If both are gone for more than 5 minutes or duel is stuck in progress without any action
          if (!isChallengerActive && !isReceiverActive) {
              console.log(`🧹 [CLEANUP] Removing stale duel ${duelId}`);
              this.activeDuels.delete(duelId);
              this.broadcastDuelListToAdmins();
          }
      }
  }

  private startHeartbeat() {
    setInterval(() => {
      this.userSockets.forEach((sockets, userId) => {
        sockets.forEach(ws => {
          if ((ws as any).isAlive === false) {
            console.log(`💀 [HEARTBEAT] Dead socket detected: user ${userId}. Terminating.`);
            sockets.delete(ws);
            return ws.terminate();
          }

          (ws as any).isAlive = false;
          ws.ping();
          // Send application-level ping
          ws.send(JSON.stringify({ type: 'ping' }));
        });
        if (sockets.size === 0) this.userSockets.delete(userId);
      });
    }, 15000);
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

    // Manage multi-socket set
    let sockets = this.userSockets.get(userId);
    if (!sockets) {
      sockets = new Set<WebSocket>();
      this.userSockets.set(userId, sockets);
    }
    sockets.add(socket);

    (socket as any).isAlive = true;
    socket.on('pong', () => { (socket as any).isAlive = true; });

    if (user.role === 'admin') {
        this.adminSockets.add(socket);
        console.log(`🛡️ [ADMIN] Admin ${user.username} connected. Total admin sockets: ${this.adminSockets.size}`);
        this.broadcastDuelListToAdmins();
    }
    console.log(`🔌 [SOCKET] User ${user.username} (ID: ${userId}) connected. Total sockets: ${this.userSockets.size}`);

    // Notify friends that this user is online
    this.broadcastStatus(userId, true);

    // RECOVERY: Check if user has an active IN-PROGRESS duel and sync state immediately
    for (const room of this.activeDuels.values()) {
        const isChallenger = room.challenger.userId === userId;
        const isReceiver = room.receiver.userId === userId;
        
        if ((isChallenger || isReceiver) && room.status === 'in_progress') {
            console.log(`🔄 [SYNC] User ${userId} reconnected to duel ${room.id}.`);
            if (isChallenger) room.challenger.socket = socket;
            else room.receiver.socket = socket;
            
            this.sendSyncState(userId, room);
            break;
        }
    }

    // RECOVERY: Check for active managed challenges
    for (const room of this.activeManagedChallenges.values()) {
        const player = room.players.get(userId);
        if (player) {
            console.log(`🔄 [SYNC-MANAGED] User ${userId} reconnected to managed challenge ${room.id} (${room.status}).`);
            player.socket = socket;
            await this.sendManagedSyncState(userId, room);
            // We usually don't break because a user might be in multiple maps? 
            // But they can only play one Managed challenge at a time.
            break; 
        }
        if (room.adminId === userId) {
            console.log(`🔄 [SYNC-ADMIN] Admin ${userId} reconnected to monitor room ${room.id}.`);
            room.adminSocket = socket;
            await this.sendManagedSyncState(userId, room);
            break;
        }
    }

    socket.on('message', (data: string) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(userId, message, socket);
      } catch (e) {
        console.error('[WS] Parse error:', e);
      }
    });

    socket.on('close', () => {
      console.log(`🔌 [SOCKET] User ${user.username} (ID: ${userId}) disconnected`);
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket);
        if (sockets.size === 0) {
            this.userSockets.delete(userId);
            // Only broadcast offline if NO sockets remain
            this.broadcastStatus(userId, false);
        }
      }
      this.adminSockets.delete(socket);
    });
  }

  public isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId);
  }

  private async broadcastStatus(userId: number, online: boolean) {
    try {
      const friendIds = await storage.getFriendIds(userId);
      console.log(`📢 [BROADCAST] User ${userId} is now ${online ? 'ONLINE' : 'OFFLINE'}. Notifying friend IDs: [${friendIds.join(', ')}]`);
      const message = { type: 'social:status_update', payload: { userId, online } };
      friendIds.forEach(id => {
        const friendOnline = this.isUserOnline(id);
        if (friendOnline) {
          console.log(`   👉 Sending update to friend ${id}`);
        }
        this.sendToUser(id, message);
      });
    } catch (error) {
      console.error(`❌ [BROADCAST ERROR] for user ${userId}:`, error);
    }
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

  private async handleMessage(userId: number, message: any, socket: WebSocket) {
    const { type, payload } = message;

    try {
      switch (type) {
      case 'duel:challenge':
        await this.handleChallenge(userId, payload);
        break;
      case 'admin:spectate':
        await this.handleAdminSpectate(userId, payload, socket);
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
        case 'chat:edit':
          await this.processChatEdit(userId, payload);
          break;
        case 'chat:delete':
          await this.processChatDelete(userId, payload);
          break;
        case 'duel:leave_results':
          await this.handleLeaveResults(userId, payload);
          break;
        case 'duel:abandon':
        await this.handleAbandonDuel(userId, payload, socket);
        break;
        case 'managed:create':
          await this.handleManagedCreate(userId, payload);
          break;
        case 'managed:respond':
          await this.handleManagedRespond(userId, payload);
          break;
        case 'managed:start':
          await this.handleManagedStart(userId, payload);
          break;
        case 'managed:spectate':
          await this.handleManagedSpectate(userId, payload, socket);
          break;
        case 'managed:submit_answer':
          await this.processManagedAnswer(userId, payload);
          break;
        case 'managed:delete':
          await this.handleManagedDelete(userId, payload);
          break;
        default:
          console.warn(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error('Error processing WS message:', error);
    }
  }

  private async handleChallenge(challengerId: number, payload: { receiverId: number; wager: number; topic?: string; isRevenge?: boolean; handicap?: any }) {
    const { receiverId, wager, topic, isRevenge, handicap } = payload;
    
    // Safety: Cleanup any active duels involving these users to avoid ghost states
    for (const [duelId, room] of this.activeDuels.entries()) {
        if (room.challenger.userId === challengerId || room.receiver.userId === challengerId ||
            room.challenger.userId === receiverId || room.receiver.userId === receiverId) {
            console.log(`♻️ [REMATCH] Cleaning up stale duel ${duelId} for new challenge`);
            this.activeDuels.delete(duelId);
            if (this.duelTimers.has(duelId)) {
                clearTimeout(this.duelTimers.get(duelId));
                this.duelTimers.delete(duelId);
            }
        }
    }

    const challenger = await storage.getUser(challengerId);
    const receiverSocket = this.userSockets.get(receiverId);

    console.log(`📢 [CHALLENGE] From ${challengerId} (${challenger?.name}) to ${receiverId}. Socket found: ${!!receiverSocket}`);

    if (!receiverSocket) {
        console.warn(`⚠️ [CHALLENGE] Target user ${receiverId} not found in socket map. Active users:`, Array.from(this.userSockets.keys()));
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
      topic: topic || 'Matemáticas Generales',
      handicap: handicap || null
    }).returning();

    const receiver = await storage.getUser(receiverId);
    
    this.sendToUser(receiverId, {
      type: 'duel:invited',
      payload: {
        duelId: newDuel.id,
        challengerId: challengerId,
        receiverId: receiverId,
        challengerName: challenger!.name,
        receiverName: receiver?.name || "Oponente",
        wager,
        topic: topic || 'Matemáticas Generales',
        isRevenge: !!isRevenge,
        handicap: newDuel.handicap
      }
    });

    this.broadcastDuelListToAdmins();
  }

  private async processResponse(userId: number, payload: { duelId: number; action: 'accept' | 'reject' | 'counter'; wager?: number; handicap?: any }) {
    const { duelId, action, wager, handicap } = payload;
    const duelRecord = await db.query.duels.findFirst({ where: eq(duels.id, duelId) });

    if (!duelRecord) return;

    if (action === 'reject') {
      await db.update(duels).set({ status: 'cancelled' }).where(eq(duels.id, duelId));
      const message = { type: 'duel:rejected', payload: { duelId, receiverId: duelRecord.receiverId } };
      this.sendToUser(duelRecord.challengerId, message);
      this.sendToUser(duelRecord.receiverId, message);
    } else if (action === 'counter') {
      await db.update(duels).set({ 
        wager: wager !== undefined ? wager : duelRecord.wager,
        handicap: handicap !== undefined ? handicap : duelRecord.handicap
      }).where(eq(duels.id, duelId));
      
      const targetId = Number(userId === duelRecord.challengerId ? duelRecord.receiverId : duelRecord.challengerId);
      console.log(`📢 [COUNTER] User ${userId} countered. Wager: ${wager}, Handicap:`, handicap);
      const challenger = await storage.getUser(duelRecord.challengerId);
      const receiver = await storage.getUser(duelRecord.receiverId);

      this.sendToUser(targetId, { 
        type: 'duel:countered', 
        payload: { 
          duelId, 
          challengerId: duelRecord.challengerId,
          receiverId: duelRecord.receiverId,
          challengerName: challenger?.name || "Retador",
          receiverName: receiver?.name || "Oponente",
          wager: wager !== undefined ? wager : duelRecord.wager,
          handicap: handicap !== undefined ? handicap : duelRecord.handicap
        } 
      });
    } else if (action === 'accept') {
      if (wager && wager !== duelRecord.wager) {
        await db.update(duels).set({ wager }).where(eq(duels.id, duelId));
        console.log(`📢 [ACCEPT WITH WAGER] Setting wager to ${wager} before starting duel ${duelId}`);
      }
      await this.startDuel(duelId);
    }
  }

  private async startDuel(duelId: number) {
    const duelRecord = await db.query.duels.findFirst({ where: eq(duels.id, duelId) });
    if (!duelRecord) return;

    // Mark as ready/preparing
    await db.update(duels).set({ status: 'ready' }).where(eq(duels.id, duelId));

    this.broadcastToDuel(duelId, { type: 'duel:preparing', payload: { duelId } });
    this.broadcastDuelListToAdmins();

    try {
      // Generate AI Quiz using the stored topic
      const quizData = await generateAiQuizData({
        topicDescription: duelRecord.topic || "Duelo de velocidad matemática",
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
          createdByUserId: null
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
          
          const shuffledOptions = this.shuffleArray([...q.options]);
          
          const createdAnswers = await tx.insert(answers).values(
            shuffledOptions.map((opt: any) => ({
              questionId: createdQ.id,
              content: opt.text || opt.content,
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
        challenger: { userId: duelRecord.challengerId, username: challenger!.name },
        receiver: { userId: duelRecord.receiverId, username: receiver!.name },
        status: 'in_progress',
        wager: duelRecord.wager,
        topic: duelRecord.topic || undefined,
        quizId: result.quizId,
        currentQuestionIndex: 0,
        questions: result.questions,
        scores: { [duelRecord.challengerId]: 0, [duelRecord.receiverId]: 0 },
        failedUserIds: [],
        questionStartTime: 0,
        bonusCredits: { [duelRecord.challengerId]: 0, [duelRecord.receiverId]: 0 },
        history: [],
        participantsGone: new Set(),
        currentRoundAnswers: [],
        spectators: new Set(),
        handicap: duelRecord.handicap as any || undefined
      };

      // Apply points handicap
      const pointsH = room.handicap?.points;
      if (pointsH && pointsH.value > 0) {
        const targetId = Number(pointsH.targetId);
        if (room.scores[targetId] !== undefined) {
          room.scores[targetId] = pointsH.value;
          console.log(`🎯 [HANDICAP] Initializing user ${targetId} with ${pointsH.value} points.`);
        } else {
          console.warn(`⚠️ [HANDICAP] Target user ${targetId} not found in scores. Keys:`, Object.keys(room.scores));
        }
      }

      this.activeDuels.set(duelId, room);
      this.broadcastDuelListToAdmins();
      
      console.log(`⚔️ [DUEL START] Room ${room.id}: ${room.challenger.username} vs ${room.receiver.username}. Handicap:`, room.handicap);

      // Start!
      this.sendToUser(room.challenger.userId, { 
        type: 'duel:start', 
        payload: { 
            questionsCount: room.questions.length,
            opponentName: room.receiver.username,
            challenger: { userId: room.challenger.userId, username: room.challenger.username },
            receiver: { userId: room.receiver.userId, username: room.receiver.username },
            duelId: room.id,
            topic: room.topic,
            handicap: room.handicap,
            scores: room.scores
        } 
      });

      this.sendToUser(room.receiver.userId, { 
        type: 'duel:start', 
        payload: { 
            questionsCount: room.questions.length,
            opponentName: room.challenger.username,
            challenger: { userId: room.challenger.userId, username: room.challenger.username },
            receiver: { userId: room.receiver.userId, username: room.receiver.username },
            duelId: room.id,
            topic: room.topic,
            handicap: room.handicap,
            scores: room.scores
        } 
      });

      setTimeout(() => this.sendNextQuestion(duelId), 3000);

    } catch (error) {
      console.error('Failed to generate duel quiz:', error);
      // Mark duel as cancelled in DB
      await db.update(duels).set({ status: 'cancelled' }).where(eq(duels.id, duelId));
      // Notify both users directly by ID (room may not be in activeDuels yet)
      const errorMsg = { type: 'duel:error', payload: { message: 'Error al generar el duelo. Intenta de nuevo.' } };
      this.sendToUser(duelRecord.challengerId, errorMsg);
      this.sendToUser(duelRecord.receiverId, errorMsg);
    }
  }

  private sendNextQuestion(duelId: number) {
    const room = this.activeDuels.get(duelId);
    if (!room || room.currentQuestionIndex >= room.questions.length) {
        this.finishDuel(duelId);
        return;
    }

    room.failedUserIds = []; // Reset for new question
    room.currentRoundAnswers = []; // Reset selections

    const question = room.questions[room.currentQuestionIndex];
    console.log(`❓ [DUEL] Sending question ${room.currentQuestionIndex + 1}/${room.questions.length} for room ${duelId}`);
    
    room.questionStartTime = Date.now();

    this.broadcastToDuel(duelId, {
      type: 'duel:question',
      payload: {
        index: room.currentQuestionIndex,
        content: question.content,
        options: question.options.map((o: any) => ({ id: o.id, content: o.content })),
        scores: room.scores, // Safety sync
        startTime: room.questionStartTime
      }
    });
    this.broadcastDuelListToAdmins();

    // SERVER-SIDE TIMEOUT (Failsafe for stuck duels - Increased to 2h)
    if (this.duelTimers.has(duelId)) clearTimeout(this.duelTimers.get(duelId));
    this.duelTimers.set(duelId, setTimeout(() => this.handleQuestionTimeout(duelId, room.currentQuestionIndex), 7200000));
  }

  private handleQuestionTimeout(duelId: number, questionIndex: number) {
      const room = this.activeDuels.get(duelId);
      if (!room || room.status !== 'in_progress' || room.currentQuestionIndex !== questionIndex) return;

      console.log(`⏰ [TIMEOUT] Question ${questionIndex + 1} timed out for room ${duelId}. Forcing next...`);
      
      // Mark anyone who hasn't answered as failed if not already in failedUserIds
      const answerers = room.currentRoundAnswers.map(a => a.userId);
      if (!answerers.includes(room.challenger.userId)) room.failedUserIds.push(room.challenger.userId);
      if (!answerers.includes(room.receiver.userId)) room.failedUserIds.push(room.receiver.userId);

      // We treat it as if both failed
      this.broadcastToDuel(duelId, {
          type: 'duel:round_result',
          payload: {
              winnerId: null,
              scores: room.scores,
              correctAnswerId: room.questions[questionIndex].options.find((o: any) => o.isCorrect)?.id,
              answerId: null
          }
      });

      room.currentQuestionIndex++;
      setTimeout(() => this.sendNextQuestion(duelId), 2000);
  }

  private async processAnswer(userId: number, payload: { duelId: number; questionIndex: number; answerId: number }) {
    const { duelId, questionIndex, answerId } = payload;
    const room = this.activeDuels.get(duelId);
    if (!room || room.status !== 'in_progress' || room.currentQuestionIndex !== questionIndex) return;

    const question = room.questions[questionIndex];
    const answer = question.options.find((o: any) => o.id === answerId);
    const correctAnswer = question.options.find((o: any) => o.isCorrect);

    // Track this selection
    room.currentRoundAnswers.push({ userId, answerId });

    if (answer?.isCorrect) {
        room.scores[userId]++;
        
        // Speed Bonus Logic (Updated to 4s)
        const timeTaken = Date.now() - room.questionStartTime;
        let speedBonus = false;
        if (timeTaken < 4000) {
            speedBonus = true;
            const opponentId = userId === room.challenger.userId ? room.receiver.userId : room.challenger.userId;
            room.bonusCredits[userId]++;
            room.bonusCredits[opponentId]--;
            console.log(`⚡ [SPEED BONUS] User ${userId} was fast! (+1 credit, -1 from ${opponentId})`);
        }

        this.broadcastToDuel(duelId, {
            type: 'duel:round_result',
            payload: {
                winnerId: userId,
                winnerName: userId === room.challenger.userId ? room.challenger.username : room.receiver.username,
                scores: room.scores,
                correctAnswerId: correctAnswer?.id,
                answerId: answerId,
                speedBonus: speedBonus
            }
        });

        this.broadcastDuelListToAdmins();

        // Save to history
        room.history.push({
            content: question.content,
            options: question.options.map((o: any) => ({
                id: o.id,
                content: o.content,
                isCorrect: o.isCorrect,
                selections: room.currentRoundAnswers
                    .filter(ans => ans.answerId === o.id)
                    .map(ans => ({
                        userId: ans.userId,
                        username: ans.userId === room.challenger.userId ? room.challenger.username : room.receiver.username
                    }))
            }))
        });

        // Delay before next question
        room.currentQuestionIndex++;

        // BARAJAR: Si un jugador ya ganó suficientes puntos o es la última pregunta, terminar
        const allFinished = room.currentQuestionIndex >= room.questions.length;
        
        // Failsafe: if opponent is offline, finish now instead of waiting
        const opponentId = userId === room.challenger.userId ? room.receiver.userId : room.challenger.userId;
        const opponentSocket = this.userSockets.get(opponentId);
        if (allFinished || !opponentSocket || opponentSocket.size === 0) {
            setTimeout(() => this.finishDuel(duelId), 1000);
        } else {
            setTimeout(() => this.sendNextQuestion(duelId), 3000);
        }
    } else {
        // Inform BOTH that someone failed
        if (!room.failedUserIds.includes(userId)) {
            room.failedUserIds.push(userId);
        }

        this.broadcastToDuel(duelId, { 
            type: 'duel:answer_feedback', 
            payload: { 
                userId, 
                answerId, 
                isCorrect: false,
                userName: userId === room.challenger.userId ? room.challenger.username : room.receiver.username
            } 
        });

        // Check if both users have now failed
        if (room.failedUserIds.length >= 2) {
            console.log(`🚫 [DUEL] Both users failed question ${questionIndex}. Moving on...`);
            this.broadcastToDuel(duelId, {
                type: 'duel:round_result',
                payload: {
                    winnerId: null, // No winner this round
                    scores: room.scores,
                    correctAnswerId: correctAnswer?.id,
                    answerId: null
                }
            });

            // Save to history (even if both failed)
            room.history.push({
                content: question.content,
                options: question.options.map((o: any) => ({
                    id: o.id,
                    content: o.content,
                    isCorrect: o.isCorrect,
                    selections: room.currentRoundAnswers
                        .filter(ans => ans.answerId === o.id)
                        .map(ans => ({
                            userId: ans.userId,
                            username: ans.userId === room.challenger.userId ? room.challenger.username : room.receiver.username
                        }))
                }))
            });

            room.currentQuestionIndex++;
            setTimeout(() => this.sendNextQuestion(duelId), 3000);
        }
    }
  }

  private async finishDuel(duelId: number, forcedWinnerId?: number) {
    if (this.duelTimers.has(duelId)) {
        clearTimeout(this.duelTimers.get(duelId)!);
        this.duelTimers.delete(duelId);
    }

    const room = this.activeDuels.get(duelId);
    if (!room) return;

    const s1 = room.scores[room.challenger.userId];
    const s2 = room.scores[room.receiver.userId];
    let winnerId = forcedWinnerId || null;
    
    if (!forcedWinnerId) {
        if (s1 > s2) winnerId = room.challenger.userId;
        else if (s2 > s1) winnerId = room.receiver.userId;
    }

    // Transactional Credit and Stats Update
    await db.transaction(async (tx) => {
        if (winnerId) {
            const loserId = winnerId === room.challenger.userId ? room.receiver.userId : room.challenger.userId;
            const winnerBonus = room.bonusCredits[winnerId] || 0;
            const finalWager = room.wager + winnerBonus;

            // Loser pays credits (base + winner's speed bonuses)
            await tx.execute(sql`UPDATE users SET hint_credits = hint_credits - ${finalWager} WHERE id = ${loserId}`);
            // Winner gets credits AND +1 win
            await tx.execute(sql`UPDATE users SET hint_credits = hint_credits + ${finalWager}, duel_wins = duel_wins + 1 WHERE id = ${winnerId}`);
            
            console.log(`🏆 [DUEL END] Winner: ${winnerId} (+${finalWager} credits, +1 win), Loser: ${loserId} (-${finalWager} credits)`);
            
            room.wager = finalWager; // Store final amount for broadcast
            (room as any).winnerBonus = winnerBonus;
        }

        await tx.update(duels).set({
            status: 'finished',
            scores: room.scores,
            winnerId
        }).where(eq(duels.id, duelId));

        // Update friendship persistent score
        if (winnerId) {
          const u1 = room.challenger.userId;
          const u2 = room.receiver.userId;
          const [rel] = await tx.select().from(friendships).where(
            or(
              and(eq(friendships.userId, u1), eq(friendships.friendId, u2)),
              and(eq(friendships.userId, u2), eq(friendships.friendId, u1))
            )
          );

          if (rel && rel.status === 'accepted') {
            if (rel.userId === winnerId) {
              await tx.update(friendships).set({ userWins: rel.userWins + 1 }).where(eq(friendships.id, rel.id));
            } else {
              await tx.update(friendships).set({ friendWins: rel.friendWins + 1 }).where(eq(friendships.id, rel.id));
            }
            console.log(`📈 [SOCIAL] Updated friendship ${rel.id} score for winner ${winnerId}`);
          }
        }
    });

    const winnerName = winnerId ? (winnerId === room.challenger.userId ? room.challenger.username : room.receiver.username) : null;
    
    this.broadcastToDuel(duelId, {
        type: 'duel:end',
        payload: {
            winnerId,
            winnerName,
            scores: room.scores,
            wager: room.wager,
            speedBonuses: (room as any).winnerBonus || 0,
            bonusSummary: room.bonusCredits,
            history: room.history,
            challengerName: room.challenger.username,
            receiverName: room.receiver.username
        }
    });

    // Mark room as finished in memory so recovery won't re-send stale state
    room.status = 'finished';
    this.broadcastDuelListToAdmins();

    // Safety timeout: cleanup even if nobody calls leaveResults
    setTimeout(() => this.cleanupDuelQuiz(duelId), 120_000);
  }

  private async handleLeaveResults(userId: number, payload: { duelId: number }) {
    const { duelId } = payload;
    const room = this.activeDuels.get(duelId);
    if (!room) return;

    // Only process finished rooms
    if (room.status !== 'finished') return;

    room.participantsGone.add(userId);
    console.log(`👋 [DUEL] User ${userId} left results. Gone: ${room.participantsGone.size}/2`);

    if (room.participantsGone.size >= 2) {
        await this.cleanupDuelQuiz(duelId);
    }
  }

  private async handleAbandonDuel(userId: number, payload: { duelId: number }, socket: WebSocket) {
    const { duelId } = payload;
    const room = this.activeDuels.get(duelId);
    
    if (room) {
        // If it's just a spectator leaving, don't destroy the room or notify players
        if (room.spectators.has(socket)) {
            room.spectators.delete(socket);
            console.log(`👁️ [SPECTATE] Admin ${userId} stopped spectating room ${duelId}`);
            return;
        }

        console.log(`👋 [ABANDON] User ${userId} abandoned duel ${duelId}.`);

        if (room.status === 'in_progress') {
            const winnerId = userId === room.challenger.userId ? room.receiver.userId : room.challenger.userId;
            console.log(`🏳️ [FORCED WIN] Awarding victory to ${winnerId} because ${userId} left.`);
            await this.finishDuel(duelId, winnerId);
            return;
        }
        
        const isFinished = room.status === 'finished';
        await db.update(duels).set({ status: isFinished ? 'finished' : 'cancelled' }).where(eq(duels.id, duelId));
        
        if (!isFinished) {
            this.broadcastToDuel(duelId, { 
                type: 'duel:error', 
                payload: { message: 'El oponente ha abandonado el duelo.' } 
            });
        }
        
        room.status = 'finished';
        this.activeDuels.delete(duelId);
        this.broadcastDuelListToAdmins();
        
        if (this.duelTimers.has(duelId)) {
            clearTimeout(this.duelTimers.get(duelId)!);
            this.duelTimers.delete(duelId);
        }
    }
  }

  private async cleanupDuelQuiz(duelId: number) {
    const room = this.activeDuels.get(duelId);
    if (!room) return;

    if (room.quizId) {
        console.log(`🧹 [CLEANUP] Deleting ephemeral quiz ${room.quizId} for finished duel ${duelId}`);
        await storage.deleteQuiz(room.quizId);
    }

    this.activeDuels.delete(duelId);
    this.broadcastDuelListToAdmins();
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

  private async processChatEdit(senderId: number, payload: { messageId: number; content: string }) {
    try {
      const updated = await storage.editChatMessage(payload.messageId, senderId, payload.content);
      if (updated) {
        const msg = { type: 'chat:edited', payload: updated };
        this.sendToUser(updated.senderId, msg);
        this.sendToUser(updated.receiverId, msg);
      }
    } catch (error: any) {
      this.sendToUser(senderId, { type: 'chat:error', payload: { message: error.message } });
    }
  }

  private async processChatDelete(senderId: number, payload: { messageId: number }) {
    try {
      const [message] = await db.select().from(messages).where(eq(messages.id, payload.messageId));
      if (!message) return;
      
      const success = await storage.deleteChatMessage(payload.messageId, senderId);
      if (success) {
        const msg = { type: 'chat:deleted', payload: { id: payload.messageId, senderId: message.senderId, receiverId: message.receiverId } };
        this.sendToUser(message.senderId, msg);
        this.sendToUser(message.receiverId, msg);
      }
    } catch (error: any) {
      this.sendToUser(senderId, { type: 'chat:error', payload: { message: error.message } });
    }
  }

  public broadcastToUser(userId: number, message: any) {
    this.sendToUser(userId, message);
  }

  private sendToUser(userId: number, message: any) {
    const sockets = this.userSockets.get(userId);
    if (!sockets || sockets.size === 0) return;
    
    const messageStr = JSON.stringify(message);
    sockets.forEach(socket => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(messageStr);
        }
    });
  }

  private broadcastToDuel(duelId: number, message: any) {
    const room = this.activeDuels.get(duelId);
    if (room) {
      this.sendToUser(room.challenger.userId, message);
      this.sendToUser(room.receiver.userId, message);
      
      // Also send to spectators
      const messageStr = JSON.stringify(message);
      room.spectators.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
              ws.send(messageStr);
          }
      });
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

  private broadcastToManaged(challengeId: number, message: any) {
    const room = this.activeManagedChallenges.get(challengeId);
    if (!room) return;

    for (const player of room.players.values()) {
        this.sendToUser(player.userId, message);
    }

    if (room.adminId) {
        this.sendToUser(room.adminId, message);
    }
  }

  private sendSyncState(userId: number, room: DuelRoom) {
    const isChallenger = room.challenger.userId === userId;
    const opponentName = isChallenger ? room.receiver.username : room.challenger.username;

    const payload = {
        duelId: room.id,
        status: room.status,
        opponentName,
        questionsCount: room.questions.length,
        currentQuestion: {
            index: room.currentQuestionIndex,
            content: room.questions[room.currentQuestionIndex]?.content || "",
            options: room.questions[room.currentQuestionIndex]?.options || [],
            startTime: room.questionStartTime
        },
        scores: room.scores,
        topic: room.topic,
        history: room.history,
        wager: room.wager,
        handicap: room.handicap
    };

    this.sendToUser(userId, { type: 'duel:sync', payload });
  }

  private broadcastDuelListToAdmins() {
    if (this.adminSockets.size === 0) return;

    const duelList = Array.from(this.activeDuels.values()).map(room => ({
        id: room.id,
        challengerName: room.challenger.username,
        receiverName: room.receiver.username,
        status: room.status,
        topic: room.topic,
        wager: room.wager,
        currentQuestionIndex: room.currentQuestionIndex,
        questionsCount: room.questions.length,
        scores: room.scores
    }));

    const message = JSON.stringify({ type: 'admin:duel_list', payload: duelList });
    let sentCount = 0;
    this.adminSockets.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
            sentCount++;
        }
    });

    if (sentCount > 0) {
        console.log(`📡 [ADMIN] Broadcasted active duel list to ${sentCount} admins`);
    }
  }

  private async handleAdminSpectate(userId: number, payload: { duelId: number }, socket: WebSocket) {
    const user = await storage.getUser(userId);
    if (!user || user.role !== 'admin') return;

    const { duelId } = payload;
    const room = this.activeDuels.get(duelId);
    if (!room) return;

    room.spectators.add(socket);
    console.log(`👁️ [SPECTATE] Admin ${user.username} started spectating duel ${duelId}`);
    
    // Send initial state to the spectator
    this.sendSyncStateToSpectator(socket, room);
  }

  private sendSyncStateToSpectator(socket: WebSocket, room: DuelRoom) {
    const payload = {
        duelId: room.id,
        status: room.status,
        opponentName: room.receiver.username, // Just for UI structure, they see both anyway
        challenger: { userId: room.challenger.userId, username: room.challenger.username },
        receiver: { userId: room.receiver.userId, username: room.receiver.username },
        challengerName: room.challenger.username,
        receiverName: room.receiver.username,
        questionsCount: room.questions.length,
        currentQuestion: {
            index: room.currentQuestionIndex,
            content: room.questions[room.currentQuestionIndex]?.content || "",
            options: (room.questions[room.currentQuestionIndex]?.options || []).map((o: any) => ({ id: o.id, content: o.content }))
        },
        scores: room.scores,
        topic: room.topic,
        history: room.history,
        wager: room.wager,
        isSpectator: true
    };

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'duel:sync', payload }));
    }
  }

  // --- Managed Challenge Methods ---

  private async handleManagedCreate(adminId: number, payload: any) {
    const { studentIds, wager, creditsMode, prizeConfig, advantages = {}, quizConfig, questionsCount = 10 } = payload;
    
    // NEW: Cleanup any existing active managed challenges for this admin to avoid ghost states
    const existingChallenges = Array.from(this.activeManagedChallenges.entries())
        .filter(([_, room]) => room.adminId === adminId);
        
    for (const [id, _] of existingChallenges) {
        console.log(`♻️ [MANAGED CLEANUP] Removing previous active challenge ${id} for admin ${adminId}`);
        this.activeManagedChallenges.delete(id);
    }

    
    // Extract actual config from the nested quizConfig object
    const quizId = quizConfig?.type === 'database' ? quizConfig.quizId : null;
    const aiTopic = quizConfig?.type === 'ai' ? quizConfig.topic : null;
    
    try {
      const challenge = await storage.createManagedChallenge({
        adminId,
        quizId: quizId || null,
        aiTopic: aiTopic || null,
        wager,
        creditsMode,
        questionsCount,
        prizeConfig,
        status: 'pending'
      });

      const playerMap = new Map<number, ManagedChallengePlayer>();
      const admin = await storage.getUser(adminId);
      
      for (const studentId of studentIds) {
        const user = await storage.getUser(studentId);
        if (user) {
          await storage.addParticipantToChallenge({
            challengeId: challenge.id,
            userId: studentId,
            status: 'pending'
          });
          
          const playerAdvantage = advantages[studentId] || { points: 0, timeDelay: 0 };
          
          playerMap.set(studentId, {
            userId: studentId,
            username: user.name,
            status: 'pending',
            score: playerAdvantage.points || 0,
            currentIndex: 0,
            pointsHandicap: playerAdvantage.points || 0,
            timeHandicap: playerAdvantage.timeDelay || 0
          });

          // Notify student
          this.sendToUser(studentId, {
            type: 'managed:invited',
            payload: {
              challengeId: challenge.id,
              adminName: admin?.name || "Administrador",
              wager,
              creditsMode,
              prizeConfig,
              topic: aiTopic || "Reto Administrado",
              participantIds: studentIds
            }
          });
        }
      }

      const room: ManagedChallengeRoom = {
        id: challenge.id,
        adminId,
        adminSocket: null,
        players: playerMap,
        status: 'pending',
        wager,
        creditsMode,
        questionsCount,
        prizeConfig,
        quizId: quizId || undefined,
        currentQuestionIndex: 0,
        questions: [],
        questionStartTime: 0,
        history: [],
        topic: aiTopic || undefined,
        failedUserIds: [],
        currentRoundAnswers: [],
        bonusCredits: {}
      };

      this.activeManagedChallenges.set(challenge.id, room);
      this.broadcastManagedChallengeListToAdmins();

      // IMPORTANT: Send full sync to the admin so their UI transitions to the monitoring lobby
      this.sendToUser(adminId, {
          type: 'managed:sync',
          payload: {
              challengeId: room.id,
              topic: room.topic || "Reto Administrado",
              status: room.status,
              players: Array.from(room.players.values()).map(p => ({
                  userId: p.userId,
                  username: p.username,
                  status: p.status,
                  score: p.score
              })),
              scores: Object.fromEntries(Array.from(room.players.values()).map(p => [p.userId, p.score])),
              currentQuestionIndex: room.currentQuestionIndex,
              questionsCount: room.questions.length
          }
      });

      this.sendToUser(adminId, {
          type: 'managed:created',
          payload: { challengeId: challenge.id }
      });
    } catch (error) {
      console.error('❌ [MANAGED CRITICAL] Error creating challenge:', error);
    }
  }

  private async handleManagedRespond(userId: number, payload: { challengeId: number; action: 'accept' | 'abandon' }) {
    const { challengeId, action } = payload;
    const room = this.activeManagedChallenges.get(challengeId);
    if (!room) return;

    const player = room.players.get(userId);
    if (!player) return;

    player.status = action === 'accept' ? 'ready' : 'abandoned';
    
    // Update DB status for participant
    const participants = await storage.getParticipantsByChallenge(challengeId);
    const pRecord = participants.find(p => p.userId === userId);
    if (pRecord) {
        await storage.updateParticipantStatus(pRecord.id, player.status);
    }

    const updateMsg = {
        type: 'managed:player_update',
        payload: {
            challengeId,
            userId,
            status: player.status,
            username: player.username
        }
    };

    // Notify everyone including Admin
    this.broadcastToManaged(challengeId, updateMsg);
  }

  private async handleManagedStart(adminId: number, payload: { challengeId: number }) {
    const { challengeId } = payload;
    const room = this.activeManagedChallenges.get(challengeId);
    if (!room || room.adminId !== adminId) return;

    // NEW: Remove anyone who hasn't accepted (status !== 'ready') before starting
    const pendingParticipants = Array.from(room.players.entries())
        .filter(([_, p]) => p.status !== 'ready');
    
    for (const [uid, _] of pendingParticipants) {
        console.log(`👋 [MANAGED START] Removing pending player ${uid} from challenge ${challengeId}`);
        room.players.delete(uid);
        // Clear their invitation on the client side with a friendly message
        this.sendToUser(uid, { 
            type: 'managed:error', 
            payload: { message: 'El reto ha comenzado y ya no puedes unirte. ¡Acepta más rápido la próxima!' } 
        });
    }

    if (room.players.size === 0) {
        this.sendToUser(adminId, { type: 'managed:error', payload: { message: 'No hay suficientes participantes listos para comenzar.' } });
        return;
    }

    room.status = 'ready';
    await storage.updateManagedChallenge(challengeId, { status: 'ready' });

    // BROADCAST PREPARING EARLY! So students see tips while AI generates questions
    this.broadcastToManaged(challengeId, {
        type: 'managed:preparing',
        payload: { challengeId }
    });
    try {
      let questionsList: any[] = [];
      if (room.quizId) {
          const qs = await storage.getQuestionsByQuiz(room.quizId);
          for (const q of qs) {
              const opts = await storage.getAnswersByQuestion(q.id);
              questionsList.push({ ...q, options: opts });
          }
      } else if (room.topic) {
          const quizData = await generateAiQuizData({
              topicDescription: room.topic,
              categoryName: "Reto Grupal",
              difficulty: "medium",
              questionCount: room.questionsCount || 8
          });
          // MAP OPTIONS CAREFULLY
          questionsList = quizData.questions.map((q: any) => {
              const options = q.options.map((opt: any, idx: number) => ({
                  id: idx,
                  content: typeof opt === 'string' ? opt : opt.content,
                  isCorrect: typeof opt === 'string' ? (opt === q.correctAnswer) : !!opt.isCorrect
              }));
              
              return {
                  id: Math.floor(Math.random() * 1000000), // Random ID for the question
                  content: q.content,
                  options: this.shuffleArray(options)
              };
          });
      }

      // Limit questions to questionsCount if we have more
      if (questionsList.length > room.questionsCount) {
          questionsList = questionsList.slice(0, room.questionsCount);
      }
      
      room.questions = questionsList;
      
      if (questionsList.length === 0) {
          console.warn('⚠️ [MANAGED] Attempted to start challenge with 0 questions. Topic:', room.topic);
          this.sendToUser(adminId, { 
              type: 'managed:error', 
              payload: { message: 'No se pudieron generar preguntas. Revisa el tema e intenta de nuevo.' } 
          });
          room.status = 'pending'; // Reset status
          await storage.updateManagedChallenge(challengeId, { status: 'pending' });
          return;
      }

      room.status = 'in_progress';
      await storage.updateManagedChallenge(challengeId, { status: 'in_progress' });
      room.currentQuestionIndex = 0;
      room.failedUserIds = [];
      room.currentRoundAnswers = [];

      const startMsg = {
          type: 'managed:started',
          payload: {
              challengeId,
              questionsCount: questionsList.length,
              topic: room.topic || "Cuestionario",
              players: Array.from(room.players.values()).map(p => ({
                  userId: p.userId,
                  username: p.username,
                  status: p.status,
                  score: p.score,
                  pointsHandicap: p.pointsHandicap,
                  timeHandicap: p.timeHandicap
              }))
          }
      };

      // Notify everyone about start
      this.broadcastToManaged(challengeId, startMsg);


      // Synchronized first question after 1.5s (just enough to see the preparing countdown)
      setTimeout(() => this.sendNextManagedQuestion(challengeId), 1500);
    } catch (error) {
      console.error('❌ [MANAGED] Error starting challenge:', error);
      this.sendToUser(adminId, { type: 'managed:error', payload: { message: 'Error al iniciar el reto' } });
    }
  }

  private sendNextManagedQuestion(challengeId: number) {
    const room = this.activeManagedChallenges.get(challengeId);
    if (!room || room.currentQuestionIndex >= room.questions.length) {
        this.finishManagedChallenge(challengeId);
        return;
    }

    room.failedUserIds = [];
    room.currentRoundAnswers = [];
    room.questionStartTime = Date.now();

    const question = room.questions[room.currentQuestionIndex];
    const msg = {
        type: 'managed:question',
        payload: {
            index: room.currentQuestionIndex,
            content: question.content,
            options: question.options.map((o: any) => ({ id: o.id, content: o.content })),
            questionsCount: room.questions.length,
            startTime: room.questionStartTime,
            scores: Object.fromEntries(Array.from(room.players.values()).map(p => [p.userId, p.score]))
        }
    };

    console.log(`❓ [MANAGED SYNC] Sending question ${room.currentQuestionIndex + 1}/${room.questions.length} to everyone in ${challengeId}`);
    this.broadcastToManaged(challengeId, msg);
    
    // Also notify Admin WITH Correct Answers
    const adminMsg = {
        ...msg,
        payload: {
            ...msg.payload,
            options: question.options.map((o: any) => ({ 
                id: o.id, 
                content: o.content,
                isCorrect: o.isCorrect
            }))
        }
    };
    this.sendToUser(room.adminId, adminMsg);
  }

  private async processManagedAnswer(userId: number, payload: { challengeId: number; questionIndex: number; answerId: number }) {
    const { challengeId, questionIndex, answerId } = payload;
    const room = this.activeManagedChallenges.get(challengeId);
    if (!room || room.status !== 'in_progress' || room.currentQuestionIndex !== questionIndex) return;

    const player = room.players.get(userId);
    if (!player || player.status !== 'ready') return;

    const question = room.questions[questionIndex];
    const answer = question.options.find((o: any) => o.id === answerId);
    const correctAnswer = question.options.find((o: any) => o.isCorrect);
    
    // Check if this player already answered (prevent double submit)
    if (room.currentRoundAnswers.some(a => a.userId === userId)) return;

    room.currentRoundAnswers.push({ userId, answerId });

    if (answer?.isCorrect) {
        player.score++;
        
        // WINNER! Broadcast to everyone so they know the round is over
        this.broadcastToManaged(challengeId, {
            type: 'managed:round_result',
            payload: {
                winnerId: userId,
                winnerName: player.username,
                userName: player.username, // Standard key for feedback UI
                scores: Object.fromEntries(Array.from(room.players.values()).map(p => [p.userId, p.score])),
                correctAnswerId: correctAnswer?.id,
                answerId: answerId,
                isCorrect: true
            }
        });

        // Credit Logic: If it's a wager mode, handle transfers
        if (room.wager > 0) {
            const transferAmount = room.wager;
            await db.transaction(async (tx) => {
                // Award round winner reward
                await tx.update(users)
                    .set({ hintCredits: sql`hint_credits + ${transferAmount}` })
                    .where(eq(users.id, userId));
                
                // If redistribute mode, subtract from everyone else who is still in the game
                if (room.creditsMode === 'redistribute') {
                    const otherPlayerIds = Array.from(room.players.keys()).filter(id => id !== userId);
                    if (otherPlayerIds.length > 0) {
                        await tx.update(users)
                            .set({ hintCredits: sql`CASE WHEN hint_credits >= ${transferAmount} THEN hint_credits - ${transferAmount} ELSE 0 END` })
                            .where(inArray(users.id, otherPlayerIds));
                    }
                }
            });
        }

        // SPEED BONUS: Independent of wager — always check if answered before 4 seconds
        const elapsed = Date.now() - room.questionStartTime;
        if (elapsed < 4000) {
            await db.transaction(async (tx) => {
                await tx.update(users)
                    .set({ hintCredits: sql`hint_credits + 1` })
                    .where(eq(users.id, userId));
                room.bonusCredits[userId] = (room.bonusCredits[userId] || 0) + 1;
                
                // If redistribute mode, subtract 1 from everyone else too
                if (room.creditsMode === 'redistribute') {
                    const otherPlayerIds = Array.from(room.players.keys()).filter(id => id !== userId);
                    if (otherPlayerIds.length > 0) {
                        await tx.update(users)
                            .set({ hintCredits: sql`CASE WHEN hint_credits > 0 THEN hint_credits - 1 ELSE 0 END` })
                            .where(inArray(users.id, otherPlayerIds));
                        
                        for (const otherId of otherPlayerIds) {
                            room.bonusCredits[otherId] = (room.bonusCredits[otherId] || 0) - 1;
                        }
                    }
                }
            });
            
            this.broadcastToManaged(challengeId, {
                type: 'managed:speed_bonus',
                payload: { userId, userName: player.username }
            });
            console.log(`⚡ [MANAGED] Speed Bonus (+1) awarded to ${userId} in ${elapsed}ms`);
        }

        // Notify Admin of progress
        this.sendToUser(room.adminId, {
            type: 'managed:player_progress',
            payload: { userId, score: player.score, questionIndex }
        });

        // Add to history before moving to next round
        room.history.push({
            content: question.content,
            options: question.options.map((o: any) => ({
                id: o.id,
                content: o.content,
                isCorrect: o.isCorrect,
                selections: room.currentRoundAnswers.filter(a => a.answerId === o.id).map(a => ({
                    userId: a.userId,
                    username: room.players.get(a.userId)?.username || "Desconocido"
                }))
            }))
        });

        room.currentQuestionIndex++;
        
        if (room.currentQuestionIndex >= room.questions.length) {
            setTimeout(() => this.finishManagedChallenge(challengeId), 2000);
        } else {
            // Next synchronized question after 3s
            setTimeout(() => this.sendNextManagedQuestion(challengeId), 3000);
        }
    } else {
        // WRONG! Inform everyone that someone failed (like 1v1 circles)
        if (!room.failedUserIds.includes(userId)) {
            room.failedUserIds.push(userId);
        }

        // Specific result for the failure
        this.broadcastToManaged(challengeId, { 
            type: 'managed:answer_feedback', 
            payload: { 
                userId, 
                answerId, 
                isCorrect: false,
                userName: player.username
            } 
        });

        // Check if everyone has failed
        const activeParticipants = Array.from(room.players.values()).filter(p => p.status === 'ready');
        if (room.failedUserIds.length >= activeParticipants.length) {
            this.broadcastToManaged(challengeId, {
                type: 'managed:round_result',
                payload: {
                    winnerId: null,
                    scores: Object.fromEntries(Array.from(room.players.values()).map(p => [p.userId, p.score])),
                    correctAnswerId: correctAnswer?.id,
                    answerId: null
                }
            });

            // Add to history on skip
            room.history.push({
                content: question.content,
                options: question.options.map((o: any) => ({
                    id: o.id,
                    content: o.content,
                    isCorrect: o.isCorrect,
                    selections: room.currentRoundAnswers.filter(a => a.answerId === o.id).map(a => ({
                        userId: a.userId,
                        username: room.players.get(a.userId)?.username || "Desconocido"
                    }))
                }))
            });

            room.currentQuestionIndex++;
            if (room.currentQuestionIndex >= room.questions.length) {
                setTimeout(() => this.finishManagedChallenge(challengeId), 2000);
            } else {
                setTimeout(() => this.sendNextManagedQuestion(challengeId), 3000);
            }
        }
    }
  }

  private async finishManagedChallenge(challengeId: number) {
    const room = this.activeManagedChallenges.get(challengeId);
    if (!room) return;

    room.status = 'finished';
    await storage.updateManagedChallenge(challengeId, { status: 'finished' });

    // Calculate Ranks
    const sortedPlayers = Array.from(room.players.values())
        .filter(p => p.status === 'ready' || p.status === 'finished')
        .sort((a, b) => b.score - a.score);

    let currentRank = 1;
    const rankings = sortedPlayers.map((p, index) => {
        if (index > 0 && p.score < sortedPlayers[index-1].score) {
            currentRank = index + 1;
        }
        
        let creditChange = 0;
        const losersPenalty = room.prizeConfig ? Number(room.prizeConfig.losers[p.userId] || 0) : 0;
        // Prizes based on ACTUAL position in the sorted list
        const winnerPrize = room.prizeConfig ? Number(room.prizeConfig.winners[index + 1] || 0) : 0;
        const bonus = room.bonusCredits[p.userId] || 0;
        
        if (room.creditsMode === 'redistribute') {
            creditChange = winnerPrize - losersPenalty + bonus;
        } else if (room.creditsMode === 'system_pay') {
            creditChange = winnerPrize + bonus;
        }
        return { 
            id: Number(p.userId), 
            username: p.username, 
            score: p.score, 
            creditChange, 
            bonusGained: bonus,
            rank: currentRank
        };
    });

    const winners: number[] = [];
    if (sortedPlayers.length > 0) winners.push(sortedPlayers[0].userId);
    if (sortedPlayers.length > 1) winners.push(sortedPlayers[1].userId);
    if (sortedPlayers.length > 2) winners.push(sortedPlayers[2].userId);

    // Persist final scores and ranks to database for history
    for (const r of rankings) {
        await storage.updateParticipantScore(challengeId, r.id, r.score);
    }
    await storage.updateManagedChallenge(challengeId, { status: 'finished', winnerIds: winners });

    // Apply Credit Logic
    await db.transaction(async (tx) => {
        if (room.creditsMode === 'redistribute' && room.prizeConfig) {
            // Losers pay
            for (const [lId, amount] of Object.entries(room.prizeConfig.losers)) {
                await tx.execute(sql`UPDATE users SET hint_credits = hint_credits - ${Number(amount)} WHERE id = ${Number(lId)}`);
            }
            // Winners get
            for (const [rank, amount] of Object.entries(room.prizeConfig.winners)) {
                const playerAtRank = sortedPlayers[Number(rank) - 1];
                if (playerAtRank) {
                    await tx.execute(sql`UPDATE users SET hint_credits = hint_credits + ${Number(amount)} WHERE id = ${playerAtRank.userId}`);
                }
            }
        } else if (room.creditsMode === 'system_pay' && room.prizeConfig) {
            // Only winners get fixed system rewards
            for (const [rank, amount] of Object.entries(room.prizeConfig.winners)) {
                const playerAtRank = sortedPlayers[Number(rank) - 1];
                if (playerAtRank) {
                    await tx.execute(sql`UPDATE users SET hint_credits = hint_credits + ${Number(amount)} WHERE id = ${playerAtRank.userId}`);
                }
            }
        }
    });

    // Calculate session leaderboard from all finished challenges by this admin
    let sessionLeaderboard: any[] = [];
    try {
        const allChallenges = await storage.getManagedChallengesByAdmin(room.adminId);
        const finishedChallenges = allChallenges.filter((c: any) => c.status === 'finished');
        
        if (finishedChallenges.length >= 1) {
            const playerStats: Record<number, { username: string; wins: number; totalScore: number; played: number }> = {};
            
            for (const ch of finishedChallenges) {
                if (!ch.participants || ch.participants.length === 0) continue;
                const sorted = [...ch.participants].sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
                
                for (let i = 0; i < sorted.length; i++) {
                    const p = sorted[i];
                    if (!playerStats[p.userId]) {
                        playerStats[p.userId] = { username: p.user?.username || `User${p.userId}`, wins: 0, totalScore: 0, played: 0 };
                    }
                    playerStats[p.userId].played++;
                    playerStats[p.userId].totalScore += (p.score || 0);
                    if (i === 0 && (p.score || 0) > 0) playerStats[p.userId].wins++;
                }
            }
            
            sessionLeaderboard = Object.entries(playerStats)
                .map(([id, stats]) => ({ userId: Number(id), ...stats }))
                .sort((a, b) => b.wins - a.wins || b.totalScore - a.totalScore);
        }
    } catch (e) {
        console.error("[ManagedChallenge] Error calculating session leaderboard:", e);
    }

    // Notify final results
    const resultsMsg = {
        type: 'managed:results',
        payload: {
            winners,
            rankings,
            history: room.history,
            sessionLeaderboard
        }
    };

    this.broadcastToManaged(challengeId, resultsMsg);
    this.activeManagedChallenges.delete(challengeId);
    this.broadcastManagedChallengeListToAdmins();
  }

  private async sendManagedSyncState(userId: number, room: ManagedChallengeRoom) {
      const player = room.players.get(userId);
      const adminUser = await storage.getUser(room.adminId);
      const currentQuestion = room.status === 'in_progress' ? {
          index: room.currentQuestionIndex,
          content: room.questions[room.currentQuestionIndex]?.content,
          options: room.questions[room.currentQuestionIndex]?.options?.map((o: any) => ({ id: o.id, content: o.content })),
          questionsCount: room.questions.length,
          startTime: room.questionStartTime
      } : null;

      this.sendToUser(userId, {
          type: 'managed:sync',
          payload: {
              challengeId: room.id,
              status: room.status,
              adminName: adminUser?.username || "El Administrador",
              topic: room.topic || "Cuestionario",
              wager: room.wager,
              players: Array.from(room.players.values()).map(p => ({
                  userId: p.userId,
                  username: p.username,
                  status: p.status,
                  score: p.score,
                  pointsHandicap: p.pointsHandicap,
                  timeHandicap: p.timeHandicap
              })),
              scores: Object.fromEntries(Array.from(room.players.values()).map(p => [p.userId, p.score])),
              currentQuestionIndex: room.currentQuestionIndex,
              questionsCount: room.questions.length,
              currentQuestion,
              myStatus: player?.status,
              isAdmin: room.adminId === userId
          }
      });
  }

  private async handleManagedSpectate(userId: number, payload: { challengeId: number }, socket: WebSocket) {
      const room = this.activeManagedChallenges.get(payload.challengeId);
      if (!room) return;
      if (room.adminId === userId) {
          room.adminSocket = socket;
          this.sendManagedSyncState(userId, room);
      } else if (room.players.has(userId)) {
          const p = room.players.get(userId)!;
          p.socket = socket;
          this.sendManagedSyncState(userId, room);
      }
  }

  private broadcastManagedChallengeListToAdmins() {
      const list = Array.from(this.activeManagedChallenges.values()).map(room => ({
          id: room.id,
          status: room.status,
          adminId: room.adminId,
          playerCount: room.players.size,
          topic: room.topic || "Cuestionario"
      }));
      
      const msg = JSON.stringify({ type: 'admin:managed_list', payload: list });
      this.adminSockets.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) ws.send(msg);
      });
  }

  private async handleManagedDelete(adminId: number, payload: { challengeId: number }) {
      const { challengeId } = payload;
      
      // 1. Notify participants if it's an active room
      const room = this.activeManagedChallenges.get(challengeId);
      if (room && Number(room.adminId) === Number(adminId)) {
          const adminUser = await storage.getUser(adminId);
          this.broadcastToManaged(challengeId, {
              type: 'managed:deleted',
              payload: { 
                  challengeId, 
                  adminName: adminUser?.username || "El Administrador",
                  message: 'El administrador ha cancelado el lanzamiento del reto.' 
              }
          });
          this.activeManagedChallenges.delete(challengeId);
          console.log(`🗑️ [MANAGED DELETE] Admin ${adminId} deleted ACTIVE challenge ${challengeId}`);
      }
      
      // 2. Clear from DB (cascading participants)
      await storage.deleteManagedChallenge(challengeId);

      // 3. Update all admins lists
      this.broadcastManagedChallengeListToAdmins();
  }

  private shuffleArray<T>(array: T[]): T[] {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
  }
}
