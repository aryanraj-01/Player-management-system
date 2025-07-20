import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get today's sessions for coach's age groups
router.get('/today', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const coachId = req.coach!.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await prisma.trainingSession.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        },
        ageGroup: {
          coachId: coachId
        }
      },
      include: {
        ageGroup: {
          include: {
            players: {
              include: {
                trainingPlans: {
                  where: { isActive: true }
                }
              }
            }
          }
        },
        attendances: {
          include: {
            player: true
          }
        }
      },
      orderBy: {
        timeSlot: 'asc'
      }
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const sessionId = req.params.id;
    const coachId = req.coach!.id;

    const session = await prisma.trainingSession.findFirst({
      where: {
        id: sessionId,
        ageGroup: {
          coachId: coachId
        }
      },
      include: {
        ageGroup: {
          include: {
            players: {
              include: {
                trainingPlans: {
                  where: { isActive: true }
                }
              }
            }
          }
        },
        attendances: {
          include: {
            player: true
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update session status
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const sessionId = req.params.id;
    const { status } = req.body;
    const coachId = req.coach!.id;

    const session = await prisma.trainingSession.findFirst({
      where: {
        id: sessionId,
        ageGroup: {
          coachId: coachId
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updatedSession = await prisma.trainingSession.update({
      where: { id: sessionId },
      data: { status }
    });

    res.json(updatedSession);
  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload group photo
router.patch('/:id/photo', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const sessionId = req.params.id;
    const { photo } = req.body;
    const coachId = req.coach!.id;

    const session = await prisma.trainingSession.findFirst({
      where: {
        id: sessionId,
        ageGroup: {
          coachId: coachId
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updatedSession = await prisma.trainingSession.update({
      where: { id: sessionId },
      data: { groupPhoto: photo }
    });

    res.json(updatedSession);
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;