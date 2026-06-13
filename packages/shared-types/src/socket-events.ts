// TODO: Implement full socket event names/types

export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  
  // Order Events
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  
  // KDS Events
  KITCHEN_TICKET_CREATED = 'KITCHEN_TICKET_CREATED',
  KITCHEN_TICKET_UPDATED = 'KITCHEN_TICKET_UPDATED',

  // Table Events
  TABLE_STATUS_CHANGED = 'TABLE_STATUS_CHANGED',

  // Room Join Helpers
  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM'
}
