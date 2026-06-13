import { Server } from 'socket.io';
import { SocketEvent } from '@cafepos/shared-types';

// TODO: Implement helper functions to emit socket events to specific rooms/users (e.g. notify KDS of order, notify frontend of status change)

export function emitOrderCreated(io: Server, orderId: string, orderData: any) {
  io.to('orders').emit(SocketEvent.ORDER_CREATED, { orderId, orderData });
}

export function emitKitchenTicketCreated(io: Server, ticketId: string, ticketData: any) {
  io.to('kds').emit(SocketEvent.KITCHEN_TICKET_CREATED, { ticketId, ticketData });
}

export function emitTableStatusChanged(io: Server, tableId: string, status: string) {
  io.emit(SocketEvent.TABLE_STATUS_CHANGED, { tableId, status });
}
