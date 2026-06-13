import { io, Socket } from 'socket.io-client';
import { SocketEvent } from '@cafepos/shared-types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const socket: Socket | null = typeof window !== 'undefined'
  ? io(SOCKET_URL, { autoConnect: true })
  : null;

export function joinKdsRoom() {
  if (socket) {
    socket.emit(SocketEvent.JOIN_ROOM, 'kds');
  }
}

export function joinSessionRoom(sessionId: string) {
  if (socket) {
    socket.emit(SocketEvent.JOIN_ROOM, `session:${sessionId}`);
  }
}
