import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  coach?: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const coach = await prisma.coach.findUnique({
      where: { id: decoded.coachId },
      select: { id: true, username: true, name: true, email: true }
    });

    if (!coach) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.coach = coach;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};