import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocketIO, emitToKds } from './socket/index';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';

// Import modular routers
import authRouter from './modules/auth/auth.routes';
import productRouter from './modules/products/product.routes';
import categoryRouter from './modules/categories/category.routes';
import employeeRouter from './modules/employees/employee.routes';
import customerRouter from './modules/customers/customer.routes';
import floorTableRouter from './modules/floors-tables/floor-table.routes';
import paymentMethodRouter from './modules/payment-methods/payment-method.routes';
import couponPromotionRouter from './modules/coupons-promotions/coupon-promotion.routes';
import orderRouter from './modules/orders/order.routes';
import kdsRouter from './modules/kds/kds.routes';
import reportsRouter from './modules/reports/reports.routes';
import sessionRouter from './modules/sessions/session.routes';
import bookingsRouter from './modules/bookings/bookings.routes';
import paymentsRouter from './modules/payments/payments.routes';

dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

// Mount modular routes
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/customers', customerRouter);
app.use('/api/floors-tables', floorTableRouter);
app.use('/api/payment-methods', paymentMethodRouter);
app.use('/api/coupons-promotions', couponPromotionRouter);
app.use('/api/orders', orderRouter);
app.use('/api/kds', kdsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);

// Debug socket ticket emitter route
app.post('/debug/emit-dummy-ticket', (req, res) => {
  const dummyTicket = {
    id: 'dummy-t1',
    orderNumber: '9999',
    status: 'TO_COOK',
    items: [
      { id: 'di1', name: 'Joy Signature Burger', quantity: 2, isPrepared: false },
      { id: 'di2', name: 'Iced Peach Tea', quantity: 1, isPrepared: true }
    ],
    createdAt: new Date().toISOString()
  };
  emitToKds('kitchen_ticket_created', dummyTicket);
  return res.status(200).json({ message: 'Dummy ticket emitted to KDS room', ticket: dummyTicket });
});

// Initialize socket.io connection handlers
initSocketIO(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
