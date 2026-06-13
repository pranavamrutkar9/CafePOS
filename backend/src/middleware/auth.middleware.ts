import { Request, Response, NextFunction } from 'express';

// TODO: Implement authenticating JWT payload middleware and verify signatures

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    // Placeholder validation logic
    // In production, decode token via jwt.verify and verify the user exists in database
    (req as any).user = {
      id: 'mock-user-id',
      role: 'ADMIN', // ADMIN | MANAGER | CASHIER | KITCHEN
      email: 'admin@cafepos.com'
    };
    
    return next();
  } else {
    return res.status(401).json({ message: 'Authorization token is required' });
  }
}
