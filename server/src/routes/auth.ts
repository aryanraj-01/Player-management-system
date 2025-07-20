import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const coach = await prisma.coach.findUnique({
      where: { username },
      include: {
        ageGroups: {
          include: {
            players: true
          }
        }
      }
    });

    if (!coach || !await bcrypt.compare(password, coach.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { coachId: coach.id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      coach: {
        id: coach.id,
        username: coach.username,
        name: coach.name,
        email: coach.email,
        ageGroups: coach.ageGroups
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;