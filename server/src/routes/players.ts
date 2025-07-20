import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get players in coach's age groups with statistics
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const coachId = req.coach!.id;

    const players = await prisma.player.findMany({
      where: {
        ageGroup: {
          coachId: coachId
        }
      },
      include: {
        ageGroup: true,
        trainingPlans: {
          where: { isActive: true }
        },
        attendances: {
          where: {
            status: 'PRESENT'
          },
          include: {
            session: true
          }
        }
      }
    });

    // Calculate statistics for each player
    const playersWithStats = players.map(player => {
      const activePlan = player.trainingPlans[0];
      const totalAttendances = player.attendances.length;
      const complimentaryAttendances = player.attendances.filter(a => a.isComplimentary).length;
      const regularAttendances = totalAttendances - complimentaryAttendances;

      return {
        ...player,
        statistics: {
          totalAttendances,
          regularAttendances,
          complimentaryAttendances,
          sessionsBooked: activePlan?.sessionsBooked || 0,
          sessionsUsed: activePlan?.sessionsUsed || 0,
          complimentaryUsed: activePlan?.complimentaryUsed || 0,
          remainingSessions: (activePlan?.sessionsBooked || 0) - (activePlan?.sessionsUsed || 0),
          remainingComplimentary: 3 - (activePlan?.complimentaryUsed || 0)
        }
      };
    });

    res.json(playersWithStats);
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get player details with attendance history
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const playerId = req.params.id;
    const coachId = req.coach!.id;

    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        ageGroup: {
          coachId: coachId
        }
      },
      include: {
        ageGroup: true,
        trainingPlans: {
          where: { isActive: true }
        },
        attendances: {
          include: {
            session: true
          },
          orderBy: {
            session: {
              date: 'desc'
            }
          }
        }
      }
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;