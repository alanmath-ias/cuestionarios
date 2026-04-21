import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { parse } from 'cookie';
import { sessionStore, sessionSecret } from './index.js';
import { storage } from './storage.js';
import { generateAiQuizData } from './ai-utils.js';
import { db } from './db.js';
import { users, duels, quizzes, questions as questionsTable, answers, friendships } from '../shared/schema.js';
import { eq, sql, or, and } from 'drizzle-orm';

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
  topic?: string;
  failedUserIds: number[];
  questionStartTime: number;
  bonusCredits: { [userId: number]: number };
  history: any[];
  participantsGone: Set<number>;
  currentRoundAnswers: { userId: number; answerId: number }[];
  spectators: Set<WebSocket>;
  handicap?: {
    type: 'points' | 'time' | 'none';
    value: number;
    targetId: number;
  };
}

export class DuelServer {
  public static instance: DuelServer | null = null;
  private wss: WebSocketServer;
  private userSockets: Map<number, WebSocket> = new Map();
  private adminSockets: Set<WebSocket> = new Set();
  private activeDuels: Map<number, DuelRoom> = new Map();
  private duelTimers: Map<number, NodeJS.Timeout> = new Map();

  constructor(server: Server) {
    DuelServer.instance = this;
    this.wss = new WebSocketServer({ server, path: '/ws/duels' });
    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();
    console.log('🚀 Duel WebSocket Server initialized at /ws/duels');
  }

  private startHeartbeat() {
    setInterval(() => {
      this.userSockets.forEach((ws, userId) => {
        if ((ws as any).isAlive === false) {
          console.log(`💀 [HEARTBEAT] Dead socket detected: user ${userId}. Terminating.`);
          this.userSockets.delete(userId);
          return ws.terminate();
        }

        (ws as any).isAlive = false;
        ws.ping();
        // Send application-level ping to ensure client JS updates lastMessageTime
        ws.send(JSON.stringify({ type: 'ping' }));
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

    // Close old socket if it exists to avoid "ghost" sessions
    const oldSocket = this.userSockets.get(userId);
    if (oldSocket && oldSocket.readyState === WebSocket.OPEN) {
      console.log(`🔄 [SOCKET] Closing stale socket for user ${user.username} (ID: ${userId})`);
      oldSocket.terminate();
    }

    (socket as any).isAlive = true;
    socket.on('pong', () => { (socket as any).isAlive = true; });

    this.userSockets.set(userId, socket);
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
        if ((room.challenger.userId === userId || room.receiver.userId === userId) && room.status === 'in_progress') {
            console.log(`🔄 [SYNC] User ${userId} reconnected to active duel ${room.id}. Sending sync state...`);
            this.sendSyncState(userId, room);
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
      this.userSockets.delete(userId);
      this.adminSockets.delete(socket);
      // Notify friends that this user is offline
      this.broadcastStatus(userId, false);
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
        case 'duel:leave_results':
          await this.handleLeaveResults(userId, payload);
          break;
        case 'duel:abandon':
          await this.handleAbandonDuel(userId, payload);
          break;
        default:
          console.warn(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error('Error processing WS message:', error);
    }
  }

  private async handleChallenge(userId: number, payload: { receiverId: number; wager: number; topic?: string; isRevenge?: boolean; handicap?: any }) {
    const { receiverId: rawReceiverId, wager, topic, isRevenge, handicap } = payload;
    const receiverId = Number(rawReceiverId);
    const challengerId = userId;
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
      if (room.handicap?.type === 'points' && room.handicap.value > 0) {
        const targetId = Number(room.handicap.targetId);
        if (room.scores[targetId] !== undefined) {
          room.scores[targetId] = room.handicap.value;
          console.log(`🎯 [HANDICAP] Initializing user ${targetId} with ${room.handicap.value} points.`);
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
    this.broadcastToDuel(duelId, {
      type: 'duel:question',
      payload: {
        index: room.currentQuestionIndex,
        content: question.content,
        options: question.options.map((o: any) => ({ id: o.id, content: o.content })),
        scores: room.scores // Safety sync
      }
    });

    room.questionStartTime = Date.now();
    this.broadcastDuelListToAdmins();
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
        setTimeout(() => this.sendNextQuestion(duelId), 3000);
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
            history: room.history
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

  private async handleAbandonDuel(userId: number, payload: { duelId: number }) {
    const { duelId } = payload;
    const room = this.activeDuels.get(duelId);
    
    if (room) {
        // If it's just a spectator leaving, don't destroy the room or notify players
        const userSocket = this.userSockets.get(userId);
        if (userSocket && room.spectators.has(userSocket)) {
            room.spectators.delete(userSocket);
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
        
        await db.update(duels).set({ status: 'cancelled' }).where(eq(duels.id, duelId));
        
        this.broadcastToDuel(duelId, { 
            type: 'duel:error', 
            payload: { message: 'El oponente ha abandonado el duelo.' } 
        });
        
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
            options: room.questions[room.currentQuestionIndex]?.options || []
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
}
