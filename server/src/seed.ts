import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.attendance.deleteMany();
  await prisma.trainingSession.deleteMany();
  await prisma.trainingPlan.deleteMany();
  await prisma.player.deleteMany();
  await prisma.ageGroup.deleteMany();
  await prisma.coach.deleteMany();

  // Create coaches
  const coach1 = await prisma.coach.create({
    data: {
      username: 'coach1',
      password: await bcrypt.hash('password123', 10),
      name: 'John Smith',
      email: 'john.smith@football.com'
    }
  });

  const coach2 = await prisma.coach.create({
    data: {
      username: 'coach2',
      password: await bcrypt.hash('password123', 10),
      name: 'Sarah Johnson',
      email: 'sarah.johnson@football.com'
    }
  });

  // Create age groups
  const u12Group = await prisma.ageGroup.create({
    data: {
      name: 'Under 12',
      description: 'Players aged 10-12 years',
      minAge: 10,
      maxAge: 12,
      coachId: coach1.id
    }
  });

  const u16Group = await prisma.ageGroup.create({
    data: {
      name: 'Under 16',
      description: 'Players aged 13-16 years',
      minAge: 13,
      maxAge: 16,
      coachId: coach2.id
    }
  });

  // Create players for U12
  const u12Players = await Promise.all([
    prisma.player.create({
      data: {
        name: 'Alex Thompson',
        email: 'alex.thompson@email.com',
        phone: '+1234567801',
        dateOfBirth: new Date('2013-03-15'),
        ageGroupId: u12Group.id
      }
    }),
    prisma.player.create({
      data: {
        name: 'Emma Wilson',
        email: 'emma.wilson@email.com',
        phone: '+1234567802',
        dateOfBirth: new Date('2013-07-22'),
        ageGroupId: u12Group.id
      }
    }),
    prisma.player.create({
      data: {
        name: 'Marcus Rodriguez',
        email: 'marcus.rodriguez@email.com',
        phone: '+1234567803',
        dateOfBirth: new Date('2012-11-08'),
        ageGroupId: u12Group.id
      }
    }),
    prisma.player.create({
      data: {
        name: 'Lily Chen',
        email: 'lily.chen@email.com',
        phone: '+1234567804',
        dateOfBirth: new Date('2013-01-30'),
        ageGroupId: u12Group.id
      }
    }),
    prisma.player.create({
      data: {
        name: 'Oliver Davis',
        email: 'oliver.davis@email.com',
        phone: '+1234567805',
        dateOfBirth: new Date('2012-09-12'),
        ageGroupId: u12Group.id
      }
    })
  ]);

  // Create players for U16
  const u16Players = await Promise.all([
    prisma.player.create({
      data: {
        name: 'Jake Morrison',
        email: 'jake.morrison@email.com',
        phone: '+1234567806',
        dateOfBirth: new Date('2009-05-18'),
        ageGroupId: u16Group.id
      }
    }),
    prisma.player.create({
      data: {
        name: 'Sofia Martinez',
        email: 'sofia.martinez@email.com',
        phone: '+1234567807',
        dateOfBirth: new Date('2008-12-03'),
        ageGroupId: u16Group.id
      }
    }),
    prisma.player.create({
      data: {
        name: 'Ryan O\'Connor',
        email: 'ryan.oconnor@email.com',
        phone: '+1234567808',
        dateOfBirth: new Date('2009-08-27'),
        ageGroupId: u16Group.id
      }
    }),
    prisma.player.create({
      data: {
        name: 'Zoe Kim',
        email: 'zoe.kim@email.com',
        phone: '+1234567809',
        dateOfBirth: new Date('2008-04-14'),
        ageGroupId: u16Group.id
      }
    }),
    prisma.player.create({
      data: {
        name: 'Ethan Brown',
        email: 'ethan.brown@email.com',
        phone: '+1234567810',
        dateOfBirth: new Date('2009-10-06'),
        ageGroupId: u16Group.id
      }
    })
  ]);

  // Create training plans for all players
  const allPlayers = [...u12Players, ...u16Players];
  await Promise.all(allPlayers.map(player => 
    prisma.trainingPlan.create({
      data: {
        playerId: player.id,
        sessionsBooked: 12,
        sessionsUsed: Math.floor(Math.random() * 5), // Random usage 0-4
        complimentaryUsed: Math.floor(Math.random() * 2), // Random 0-1
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        isActive: true
      }
    })
  ));

  // Create today's training sessions
  const today = new Date();
  today.setHours(9, 0, 0, 0); // 9 AM

  const morningSessionU12 = await prisma.trainingSession.create({
    data: {
      date: today,
      timeSlot: 'MORNING',
      status: 'SCHEDULED',
      maxPlayers: 20,
      ageGroupId: u12Group.id
    }
  });

  const eveningSessionU12 = await prisma.trainingSession.create({
    data: {
      date: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 6 PM
      timeSlot: 'EVENING',
      status: 'SCHEDULED',
      maxPlayers: 20,
      ageGroupId: u12Group.id
    }
  });

  const morningSessionU16 = await prisma.trainingSession.create({
    data: {
      date: today,
      timeSlot: 'MORNING',
      status: 'SCHEDULED',
      maxPlayers: 20,
      ageGroupId: u16Group.id
    }
  });

  const eveningSessionU16 = await prisma.trainingSession.create({
    data: {
      date: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 6 PM
      timeSlot: 'EVENING',
      status: 'SCHEDULED',
      maxPlayers: 20,
      ageGroupId: u16Group.id
    }
  });

  console.log('Database seeded successfully!');
  console.log('Coach credentials:');
  console.log('Username: coach1, Password: password123 (U12 group)');
  console.log('Username: coach2, Password: password123 (U16 group)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });