import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { Router, Request, Response } from 'express';
import { customAlphabet } from 'nanoid';
import { parse } from 'url';
import { storage } from './storage.js';

const generateShareCode = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 8);

export interface LiveQuizRoom {
  shareCode: string;
  quizId: number;
  studentId: number;
  studentName: string;
  quizTitle: string;
  timeLimit: number;
  totalQuestions: number;
  questions: any[];
  currentQuestionIndex: number;
  selectedAnswerId: number | null;
  directResponse: string;
  studentAnswers: any[];
  elapsedTime: number;
  hintsRevealed: Record<number, string[]>;
  status: 'in_progress' | 'completed' | 'stopped';
  score?: number | null;
  studentSocket: WebSocket | null;
  spectators: Set<WebSocket>;
  spectatorNames: Map<WebSocket, string>;
  isStudentOnline: boolean;
  createdAt: number;
  lastActiveAt: number;
}

export function sanitizeRoomForSpectator(room: LiveQuizRoom) {
  // Ensure each studentAnswer has isCorrect resolved using question definitions
  const resolvedStudentAnswers = (room.studentAnswers || []).map((a: any) => {
    let isCorrect = a.isCorrect;
    if (isCorrect === undefined || isCorrect === null) {
      if (a.answerId) {
        const q = (room.questions || []).find((quest: any) => Number(quest.id) === Number(a.questionId));
        const ansDef = (q?.answers || []).find((ans: any) => Number(ans.id) === Number(a.answerId));
        if (ansDef && typeof ansDef.isCorrect === 'boolean') {
          isCorrect = ansDef.isCorrect;
        }
      }
    }
    return {
      ...a,
      questionId: Number(a.questionId),
      isCorrect,
    };
  });

  const answeredQuestionIds = new Set(resolvedStudentAnswers.map((a: any) => Number(a.questionId)));

  const sanitizedQuestions = (room.questions || []).map((q: any) => {
    const isAnswered = answeredQuestionIds.has(Number(q.id));
    return {
      id: q.id,
      content: q.content,
      type: q.type,
      difficulty: q.difficulty,
      points: q.points,
      imageUrl: q.imageUrl,
      explanation: isAnswered ? q.explanation : undefined,
      answers: (q.answers || []).map((a: any) => ({
        id: a.id,
        content: a.content,
        // Only reveal isCorrect if the question has already been answered by the student
        isCorrect: isAnswered ? a.isCorrect : undefined,
      }))
    };
  });

  return {
    shareCode: room.shareCode,
    quizId: room.quizId,
    studentId: room.studentId,
    studentName: room.studentName,
    quizTitle: room.quizTitle,
    timeLimit: room.timeLimit,
    totalQuestions: room.totalQuestions,
    currentQuestionIndex: room.currentQuestionIndex,
    selectedAnswerId: room.selectedAnswerId,
    directResponse: room.directResponse,
    studentAnswers: resolvedStudentAnswers,
    elapsedTime: room.elapsedTime || 0,
    hintsRevealed: room.hintsRevealed || {},
    status: room.status,
    score: room.score ?? null,
    isStudentOnline: room.isStudentOnline,
    spectatorCount: room.spectators.size,
    questions: sanitizedQuestions,
  };
}

export class LiveQuizServer {
  public static instance: LiveQuizServer | null = null;
  private wss: WebSocketServer;
  private rooms = new Map<string, LiveQuizRoom>();
  private socketToRoom = new Map<WebSocket, { shareCode: string; role: 'student' | 'spectator' }>();

  constructor(server: Server) {
    LiveQuizServer.instance = this;
    this.wss = new WebSocketServer({ noServer: true });
    server.on('upgrade', (req, socket, head) => {
      const pathname = req.url ? req.url.split('?')[0] : '';
      if (pathname === '/ws/live-quiz') {
        this.wss.handleUpgrade(req, socket, head, (ws) => {
          this.wss.emit('connection', ws, req);
        });
      }
    });
    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();

    // Periodic room cleanup (every 10 minutes)
    setInterval(() => this.cleanupStaleRooms(), 10 * 60 * 1000);

    console.log('📡 Live Quiz WebSocket Server initialized at /ws/live-quiz');
  }

  public getRoom(shareCode: string): LiveQuizRoom | undefined {
    return this.rooms.get(shareCode);
  }

  public createOrUpdateRoom(data: {
    quizId: number;
    quizTitle: string;
    studentId: number;
    studentName: string;
    timeLimit: number;
    totalQuestions: number;
    questions: any[];
    currentQuestionIndex?: number;
    selectedAnswerId?: number | null;
    directResponse?: string;
    studentAnswers?: any[];
    elapsedTime?: number;
    hintsRevealed?: Record<number, string[]>;
    existingCode?: string;
  }): LiveQuizRoom {
    let shareCode = data.existingCode;

    // Check if existing code is still valid and belongs to same quiz/student
    if (shareCode && this.rooms.has(shareCode)) {
      const existing = this.rooms.get(shareCode)!;
      if (existing.quizId === data.quizId && existing.studentId === data.studentId) {
        existing.quizTitle = data.quizTitle;
        existing.timeLimit = data.timeLimit;
        existing.totalQuestions = data.totalQuestions;
        existing.questions = data.questions;
        if (data.currentQuestionIndex !== undefined) existing.currentQuestionIndex = data.currentQuestionIndex;
        if (data.selectedAnswerId !== undefined) existing.selectedAnswerId = data.selectedAnswerId;
        if (data.directResponse !== undefined) existing.directResponse = data.directResponse;
        if (data.studentAnswers !== undefined) existing.studentAnswers = data.studentAnswers;
        if (data.elapsedTime !== undefined) existing.elapsedTime = data.elapsedTime;
        if (data.hintsRevealed !== undefined) existing.hintsRevealed = data.hintsRevealed;
        existing.lastActiveAt = Date.now();
        return existing;
      }
    }

    // Generate unique share code
    shareCode = generateShareCode();
    while (this.rooms.has(shareCode)) {
      shareCode = generateShareCode();
    }

    const room: LiveQuizRoom = {
      shareCode,
      quizId: data.quizId,
      studentId: data.studentId,
      studentName: data.studentName,
      quizTitle: data.quizTitle,
      timeLimit: data.timeLimit,
      totalQuestions: data.totalQuestions,
      questions: data.questions,
      currentQuestionIndex: data.currentQuestionIndex ?? 0,
      selectedAnswerId: data.selectedAnswerId ?? null,
      directResponse: data.directResponse ?? '',
      studentAnswers: data.studentAnswers ?? [],
      elapsedTime: data.elapsedTime ?? 0,
      hintsRevealed: data.hintsRevealed ?? {},
      status: 'in_progress',
      score: null,
      studentSocket: null,
      spectators: new Set(),
      spectatorNames: new Map(),
      isStudentOnline: false,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };

    this.rooms.set(shareCode, room);
    console.log(`[LiveQuiz] Room created: ${shareCode} for user ${data.studentName} (Quiz: "${data.quizTitle}")`);
    return room;
  }

  public deleteRoom(shareCode: string): boolean {
    const room = this.rooms.get(shareCode);
    if (!room) return false;

    // Broadcast stopped event to spectators
    this.broadcastToSpectators(room, {
      type: 'quiz:stopped',
      message: 'La transmisión en vivo ha sido finalizada por el estudiante.'
    });

    // Close spectator sockets
    for (const ws of room.spectators) {
      this.socketToRoom.delete(ws);
    }
    if (room.studentSocket) {
      this.socketToRoom.delete(room.studentSocket);
    }

    this.rooms.delete(shareCode);
    console.log(`[LiveQuiz] Room ${shareCode} closed.`);
    return true;
  }

  private startHeartbeat() {
    setInterval(() => {
      this.wss.clients.forEach((ws: any) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 25000);
  }

  private cleanupStaleRooms() {
    const now = Date.now();
    const MAX_IDLE_TIME = 2.5 * 60 * 60 * 1000; // 2.5 hours
    for (const [code, room] of this.rooms.entries()) {
      if (now - room.lastActiveAt > MAX_IDLE_TIME && room.spectators.size === 0 && !room.isStudentOnline) {
        this.rooms.delete(code);
        console.log(`🧹 [LiveQuiz] Cleaned up stale room ${code}`);
      }
    }
  }

  private handleConnection(socket: WebSocket, req: any) {
    (socket as any).isAlive = true;
    socket.on('pong', () => { (socket as any).isAlive = true; });

    const parsedUrl = parse(req.url || '', true);
    const queryCode = parsedUrl.query?.code as string | undefined;
    const queryRole = parsedUrl.query?.role as 'student' | 'spectator' | undefined;

    if (queryCode && queryRole) {
      this.handleJoin(socket, queryCode, queryRole);
    }

    socket.on('message', (raw: string) => {
      try {
        const message = JSON.parse(raw);
        this.handleMessage(socket, message);
      } catch (e) {
        console.error('[LiveQuiz WS] Parse error:', e);
      }
    });

    socket.on('close', () => {
      this.handleDisconnect(socket);
    });

    socket.on('error', (err) => {
      console.error('[LiveQuiz WS] Socket error:', err);
    });
  }

  private handleJoin(socket: WebSocket, shareCode: string, role: 'student' | 'spectator', extraName?: string) {
    if (this.socketToRoom.has(socket)) {
      return;
    }

    const room = this.rooms.get(shareCode);
    if (!room) {
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Sala de transmisión no encontrada o expirada.'
      }));
      return;
    }

    room.lastActiveAt = Date.now();
    this.socketToRoom.set(socket, { shareCode, role });

    if (role === 'student') {
      room.studentSocket = socket;
      room.isStudentOnline = true;
      console.log(`[LiveQuiz] Student connected to room ${shareCode}`);

      // Notify spectators that student is online
      this.broadcastToSpectators(room, {
        type: 'student:status',
        isOnline: true,
        spectatorCount: room.spectators.size
      });

      // Confirm to student
      socket.send(JSON.stringify({
        type: 'student:joined',
        shareCode: room.shareCode,
        spectatorCount: room.spectators.size
      }));
    } else {
      room.spectators.add(socket);
      const name = extraName || 'Espectador';
      room.spectatorNames.set(socket, name);
      console.log(`[LiveQuiz] Spectator joined room ${shareCode}. Total spectators: ${room.spectators.size}`);

      // Send initial snapshot to spectator
      socket.send(JSON.stringify({
        type: 'quiz:sync_state',
        payload: sanitizeRoomForSpectator(room)
      }));

      // Broadcast spectator count to student & all spectators
      this.broadcastRoom(room, {
        type: 'quiz:spectator_count',
        count: room.spectators.size,
        joinedName: name
      });
    }
  }

  private handleMessage(socket: WebSocket, message: any) {
    const { type, shareCode, ...payload } = message;

    if (type === 'student:join') {
      this.handleJoin(socket, shareCode, 'student');
      return;
    }

    if (type === 'spectator:join') {
      this.handleJoin(socket, shareCode, 'spectator', payload.name);
      return;
    }

    const room = this.rooms.get(shareCode);
    if (!room) return;

    room.lastActiveAt = Date.now();

    switch (type) {
      case 'student:change_question': {
        room.currentQuestionIndex = payload.questionIndex ?? room.currentQuestionIndex;
        room.selectedAnswerId = payload.selectedAnswerId ?? null;
        room.directResponse = payload.directResponse ?? '';
        if (payload.studentAnswers && Array.isArray(payload.studentAnswers) && payload.studentAnswers.length > 0) {
          room.studentAnswers = payload.studentAnswers;
        }

        const sanitized = sanitizeRoomForSpectator(room);

        this.broadcastToSpectators(room, {
          type: 'quiz:question_changed',
          questionIndex: room.currentQuestionIndex,
          selectedAnswerId: room.selectedAnswerId,
          directResponse: room.directResponse,
          studentAnswers: sanitized.studentAnswers,
          questions: sanitized.questions,
        });
        break;
      }

      case 'student:select_answer': {
        room.selectedAnswerId = payload.answerId;
        this.broadcastToSpectators(room, {
          type: 'quiz:answer_selected',
          questionIndex: room.currentQuestionIndex,
          answerId: payload.answerId
        });
        break;
      }

      case 'student:input_response': {
        room.directResponse = payload.response ?? '';
        this.broadcastToSpectators(room, {
          type: 'quiz:response_typed',
          questionIndex: room.currentQuestionIndex,
          response: room.directResponse
        });
        break;
      }

      case 'student:answer_submitted': {
        if (payload.answer) {
          const filtered = (room.studentAnswers || []).filter(
            a => Number(a.questionId) !== Number(payload.answer.questionId)
          );
          room.studentAnswers = [...filtered, payload.answer];
        } else if (payload.studentAnswers && Array.isArray(payload.studentAnswers) && payload.studentAnswers.length > 0) {
          room.studentAnswers = payload.studentAnswers;
        }

        room.selectedAnswerId = null;
        room.directResponse = '';

        const sanitized = sanitizeRoomForSpectator(room);

        this.broadcastToSpectators(room, {
          type: 'quiz:answer_submitted',
          answer: payload.answer,
          studentAnswers: sanitized.studentAnswers,
          questions: sanitized.questions,
          currentQuestionIndex: payload.currentQuestionIndex ?? room.currentQuestionIndex
        });
        break;
      }

      case 'student:hint_revealed': {
        if (!room.hintsRevealed) room.hintsRevealed = {};
        if (!room.hintsRevealed[payload.questionId]) room.hintsRevealed[payload.questionId] = [];
        room.hintsRevealed[payload.questionId].push(payload.hint);

        this.broadcastToSpectators(room, {
          type: 'quiz:hint_revealed',
          questionId: payload.questionId,
          hint: payload.hint,
          hintsRevealed: room.hintsRevealed
        });
        break;
      }

      case 'student:timer_sync': {
        room.elapsedTime = payload.elapsedTime ?? room.elapsedTime;
        this.broadcastToSpectators(room, {
          type: 'quiz:timer_sync',
          elapsedTime: room.elapsedTime
        });
        break;
      }

      case 'student:finish': {
        room.status = 'completed';
        room.score = payload.score;
        if (payload.finalAnswers) {
          room.studentAnswers = payload.finalAnswers;
        }

        this.broadcastToSpectators(room, {
          type: 'quiz:finished',
          score: payload.score,
          totalTime: payload.totalTime,
          finalAnswers: room.studentAnswers
        });
        break;
      }

      case 'student:stop': {
        this.deleteRoom(shareCode);
        break;
      }

      default:
        break;
    }
  }

  private handleDisconnect(socket: WebSocket) {
    const meta = this.socketToRoom.get(socket);
    if (!meta) return;

    this.socketToRoom.delete(socket);
    const room = this.rooms.get(meta.shareCode);
    if (!room) return;

    if (meta.role === 'student') {
      room.isStudentOnline = false;
      room.studentSocket = null;
      console.log(`[LiveQuiz] Student disconnected from room ${meta.shareCode}`);

      this.broadcastToSpectators(room, {
        type: 'student:status',
        isOnline: false,
        spectatorCount: room.spectators.size
      });
    } else {
      room.spectators.delete(socket);
      const name = room.spectatorNames.get(socket);
      room.spectatorNames.delete(socket);
      console.log(`[LiveQuiz] Spectator left room ${meta.shareCode}. Remaining: ${room.spectators.size}`);

      this.broadcastRoom(room, {
        type: 'quiz:spectator_count',
        count: room.spectators.size,
        leftName: name
      });
    }
  }

  private broadcastToSpectators(room: LiveQuizRoom, msgObj: any) {
    const msg = JSON.stringify(msgObj);
    for (const ws of room.spectators) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
  }

  private broadcastRoom(room: LiveQuizRoom, msgObj: any) {
    const msg = JSON.stringify(msgObj);
    if (room.studentSocket && room.studentSocket.readyState === WebSocket.OPEN) {
      room.studentSocket.send(msg);
    }
    for (const ws of room.spectators) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
  }
}

/**
 * Setup REST API endpoints for Live Quiz
 */
export function setupLiveQuizRoutes(apiRouter: Router) {
  // Initialize / start live quiz sharing session
  apiRouter.post('/live-quiz/init', async (req: Request, res: Response) => {
    try {
      const serverInstance = LiveQuizServer.instance;
      if (!serverInstance) {
        return res.status(503).json({ message: 'Live Quiz Server not ready' });
      }

      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Se requiere iniciar sesión para transmitir en vivo.' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      const isPremium = user.role === 'admin' || user.role === 'teacher' || user.subscriptionStatus === 'active';
      if (!isPremium) {
        return res.status(403).json({
          message: 'La función de transmisión en vivo está disponible exclusivamente para usuarios AlanMath Premium.',
          requiresPremium: true,
        });
      }

      const {
        quizId,
        quizTitle,
        timeLimit,
        totalQuestions,
        questions,
        currentQuestionIndex,
        selectedAnswerId,
        directResponse,
        studentAnswers,
        elapsedTime,
        hintsRevealed,
        existingCode
      } = req.body;

      if (!quizId || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: 'Invalid quiz payload' });
      }

      const studentName = user.name || user.username || 'Estudiante';

      const room = serverInstance.createOrUpdateRoom({
        quizId: Number(quizId),
        quizTitle: quizTitle || 'Cuestionario',
        studentId: userId,
        studentName,
        timeLimit: Number(timeLimit) || 0,
        totalQuestions: Number(totalQuestions) || questions.length,
        questions,
        currentQuestionIndex: Number(currentQuestionIndex) || 0,
        selectedAnswerId: selectedAnswerId !== undefined ? selectedAnswerId : null,
        directResponse: directResponse || '',
        studentAnswers: Array.isArray(studentAnswers) ? studentAnswers : [],
        elapsedTime: Number(elapsedTime) || 0,
        hintsRevealed: hintsRevealed || {},
        existingCode: existingCode || undefined,
      });

      return res.json({
        success: true,
        shareCode: room.shareCode,
        sharePath: `/quiz/live/${room.shareCode}`,
        spectatorCount: room.spectators.size,
      });
    } catch (err: any) {
      console.error('[LiveQuiz API] Init error:', err);
      return res.status(500).json({ message: 'Error initializing live quiz session' });
    }
  });

  // Get live quiz snapshot for spectators (public - no login required!)
  apiRouter.get('/live-quiz/:shareCode', (req: Request, res: Response) => {
    try {
      const serverInstance = LiveQuizServer.instance;
      if (!serverInstance) {
        return res.status(503).json({ message: 'Live Quiz Server not ready' });
      }

      const { shareCode } = req.params;
      const room = serverInstance.getRoom(shareCode);

      if (!room || room.status === 'stopped') {
        return res.status(404).json({ message: 'Transmisión no encontrada o finalizada.' });
      }

      return res.json({
        success: true,
        ...sanitizeRoomForSpectator(room)
      });
    } catch (err: any) {
      console.error('[LiveQuiz API] Get error:', err);
      return res.status(500).json({ message: 'Error retrieving live quiz' });
    }
  });

  // Stop live quiz sharing
  apiRouter.delete('/live-quiz/:shareCode', (req: Request, res: Response) => {
    try {
      const serverInstance = LiveQuizServer.instance;
      if (!serverInstance) {
        return res.status(503).json({ message: 'Live Quiz Server not ready' });
      }

      const { shareCode } = req.params;
      const deleted = serverInstance.deleteRoom(shareCode);

      return res.json({ success: deleted });
    } catch (err: any) {
      console.error('[LiveQuiz API] Delete error:', err);
      return res.status(500).json({ message: 'Error stopping live quiz' });
    }
  });
}
