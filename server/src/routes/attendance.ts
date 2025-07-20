import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Mark attendance
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { playerId, sessionId, status, isComplimentary, photo, notes } = req.body;
    const coachId = req.coach!.id;

    // Verify coach has access to this session
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

    // Check if attendance already exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        playerId_sessionId: {
          playerId,
          sessionId
        }
      }
    });

    let attendance;
    if (existingAttendance) {
      // Update existing attendance
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status,
          isComplimentary,
          photo,
          notes,
          markedAt: new Date()
        },
        include: {
          player: true,
          session: true
        }
      });
    } else {
      // Create new attendance
      attendance = await prisma.attendance.create({
        data: {
          playerId,
          sessionId,
          status,
          isComplimentary,
          photo,
          notes
        },
        include: {
          player: true,
          session: true
        }
      });
    }

    // Update training plan usage if present
    if (status === 'PRESENT') {
      const activePlan = await prisma.trainingPlan.findFirst({
        where: {
          playerId,
          isActive: true
        }
      });

      if (activePlan) {
        if (isComplimentary && activePlan.complimentaryUsed < 3) {
          await prisma.trainingPlan.update({
            where: { id: activePlan.id },
            data: {
              complimentaryUsed: activePlan.complimentaryUsed + 1
            }
          });
        } else if (!isComplimentary) {
          await prisma.trainingPlan.update({
            where: { id: activePlan.id },
            data: {
              sessionsUsed: activePlan.sessionsUsed + 1
            }
          });
        }
      }
    }

    res.json(attendance);
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attendance for a session
router.get('/session/:sessionId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const sessionId = req.params.sessionId;
    const coachId = req.coach!.id;

    // Verify coach has access to this session
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

    const attendances = await prisma.attendance.findMany({
      where: { sessionId },
      include: {
        player: {
          include: {
            trainingPlans: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    res.json(attendances);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;