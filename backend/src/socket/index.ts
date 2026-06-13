import { Server, Socket } from 'socket.io';
import { SocketEvent } from '@cafepos/shared-types';

export let io: Server | null = null;

export function initSocketIO(socketServer: Server) {
  io = socketServer;

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(SocketEvent.JOIN_ROOM, (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on(SocketEvent.LEAVE_ROOM, (room: string) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

export function getSocketIO(): Server | null {
  return io;
}

export function emitToKds(event: string, payload: any) {
  if (io) {
    io.to('kds').emit(event, payload);
    console.log(`Socket: Emitted event '${event}' to room 'kds'`);
  }
}

export function emitToSession(sessionId: string, event: string, payload: any) {
  if (io) {
    io.to(`session:${sessionId}`).emit(event, payload);
    console.log(`Socket: Emitted event '${event}' to room 'session:${sessionId}'`);
  }
}
