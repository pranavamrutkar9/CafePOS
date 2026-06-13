import { Server, Socket } from 'socket.io';
import { SocketEvent } from '@cafepos/shared-types';

let ioInstance: Server | null = null;

export function initSocketIO(io: Server) {
  ioInstance = io;

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
  return ioInstance;
}
