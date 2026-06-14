import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'super-secret-refresh-key-change-in-prod';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

const generateTokens = (user: any) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN as any });
  return { accessToken, refreshToken };
};

export class AuthService {
  async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.disabled) {
      throw new Error('Account is disabled. Please contact an administrator.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const { accessToken, refreshToken } = generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async signup(data: any) {
    if (!data.name || !data.email || !data.password) {
      throw new Error('Name, email, and password are required');
    }

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    // Public signup always creates EMPLOYEE accounts.
    // Admins are created through the employee management endpoint by an existing admin.
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash,
        role: 'EMPLOYEE',
      },
    });

    const { accessToken, refreshToken } = generateTokens(user);

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    try {
      const decoded: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      
      if (!user) {
        throw new Error('User not found');
      }

      const tokens = generateTokens(user);
      
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (e) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
