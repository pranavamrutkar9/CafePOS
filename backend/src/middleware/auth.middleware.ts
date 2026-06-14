import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-prod';

export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      if (!user) {
        return res.status(401).json({ message: 'User no longer exists. Please log in again.' });
      }

      // Attach verified user context to request
      (req as any).user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired authorization token' });
    }
  } else {
    return res.status(401).json({ message: 'Authorization token is required' });
  }
}
