-- Performance indexes: add missing indexes for frequently-queried columns

-- Order: tableId (used in floor-table status queries, GET /orders?tableId=)
CREATE INDEX IF NOT EXISTS "Order_tableId_idx" ON "Order"("tableId");

-- Order: sessionId (used in session closing aggregate, GET /orders?sessionId=)
CREATE INDEX IF NOT EXISTS "Order_sessionId_idx" ON "Order"("sessionId");

-- KitchenTicket: orderId (used when fetching tickets for an order)
CREATE INDEX IF NOT EXISTS "KitchenTicket_orderId_idx" ON "KitchenTicket"("orderId");

-- KitchenTicket: status (used in GET /kds/tickets filter)
CREATE INDEX IF NOT EXISTS "KitchenTicket_status_idx" ON "KitchenTicket"("status");

-- KitchenTicketItem: ticketId (used in every ticket item lookup)
CREATE INDEX IF NOT EXISTS "KitchenTicketItem_ticketId_idx" ON "KitchenTicketItem"("ticketId");

-- KitchenTicketItem: orderItemId (used in re-send to kitchen query)
CREATE INDEX IF NOT EXISTS "KitchenTicketItem_orderItemId_idx" ON "KitchenTicketItem"("orderItemId");
