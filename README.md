# Football Training Session Management System

A comprehensive web application for managing football training sessions, player attendance, and statistics. Built with React, Node.js, PostgreSQL, and Docker.

## Features

### Core Functionality
- **Coach Authentication**: Secure login system with JWT tokens
- **Session Management**: View and manage daily training sessions (morning/evening)
- **Attendance Tracking**: Mark players as present (regular/complimentary) or absent
- **Photo Integration**: Take or upload group photos during attendance
- **Player Statistics**: Comprehensive tracking of sessions, attendance rates, and remaining quotas
- **Mobile Responsive**: Optimized for tablets and mobile devices

### Advanced Features
- **Role-based Access**: Coaches only see their assigned age groups
- **Real-time Statistics**: Live updates of attendance rates and session usage
- **Complimentary Session Tracking**: Up to 3 complimentary sessions per player
- **Session Plans**: Fixed number of sessions per month with usage tracking
- **Attendance History**: Complete player attendance records with timestamps

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Webcam** for photo capture
- **Vite** for development and building

### Backend
- **Node.js** with Express and TypeScript
- **Prisma ORM** for database management
- **PostgreSQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file handling

### DevOps
- **Docker & Docker Compose** for containerization
- **Hot reload** in development
- **Health checks** for services
- **Volume mounting** for development

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Using Docker (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd football-training-management

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
```

### Local Development
```bash
# Install dependencies
npm run setup

# Start PostgreSQL (you'll need to set this up manually)
# Update DATABASE_URL in server/.env

# Run database migrations and seed
cd server
npm run db:push
npm run db:seed

# Start both frontend and backend
cd ..
npm run dev
```

## Demo Credentials

The system comes with pre-seeded demo data:

### Coaches
- **Coach 1**: `username: coach1`, `password: password123` (Manages Under 12 age group)
- **Coach 2**: `username: coach2`, `password: password123` (Manages Under 16 age group)

### Sample Data
- 2 age groups (Under 12, Under 16)
- 10 players total (5 per age group)
- Training plans with 12 sessions per month
- Today's morning and evening sessions for each age group

## Usage Guide

### For Coaches

1. **Login**: Use the demo credentials or create new coach accounts
2. **Dashboard**: View today's sessions with attendance statistics
3. **Mark Attendance**: 
   - Click "Mark Attendance" on any session
   - Mark players as Present (regular), Present (complimentary), or Absent
   - Take group photos using camera or upload existing photos
4. **View Statistics**: Navigate to Players section to see detailed statistics
5. **Player Profiles**: Click on any player to view detailed attendance history

### Session Types
- **Morning Sessions**: 9:00 AM
- **Evening Sessions**: 6:00 PM

### Attendance Types
- **Regular**: Counts towards booked sessions
- **Complimentary**: Up to 3 free sessions for missed sessions
- **Absent**: Player didn't attend

## Database Schema

### Key Entities
- **Coaches**: Authentication and age group assignment
- **Age Groups**: Player groupings managed by coaches
- **Players**: Individual player information and training plans
- **Training Sessions**: Daily session scheduling
- **Attendance**: Session attendance records with photos
- **Training Plans**: Monthly session quotas and usage tracking

### Relationships
- Coaches manage multiple Age Groups
- Age Groups contain multiple Players
- Players have Training Plans with session quotas
- Training Sessions belong to Age Groups
- Attendance links Players to Training Sessions

## API Endpoints

### Authentication
- `POST /api/auth/login` - Coach login

### Sessions
- `GET /api/sessions/today` - Get today's sessions for coach
- `GET /api/sessions/:id` - Get session details
- `PATCH /api/sessions/:id/status` - Update session status
- `PATCH /api/sessions/:id/photo` - Upload group photo

### Attendance
- `POST /api/attendance` - Mark player attendance
- `GET /api/attendance/session/:id` - Get session attendance

### Players
- `GET /api/players` - Get players with statistics
- `GET /api/players/:id` - Get player details and history

## Development

### Project Structure
```
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── contexts/          # React contexts (Auth)
│   ├── pages/             # Page components
│   └── App.tsx            # Main app component
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── index.ts       # Server entry point
│   ├── prisma/           # Database schema and migrations
│   └── seed.ts           # Database seeding
├── docker-compose.yml    # Docker orchestration
└── README.md
```

### Environment Variables

#### Server (.env)
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/football_training"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
```

#### Client (Vite automatically loads)
```
VITE_API_URL=http://localhost:3001
```

### Database Operations
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Seed database with sample data
npm run db:seed
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Role-based Access**: Coaches only access their assigned age groups
- **Input Validation**: Server-side validation for all endpoints
- **CORS Configuration**: Proper cross-origin resource sharing setup

## Deployment

### Production Considerations
1. **Environment Variables**: Update JWT_SECRET and database credentials
2. **Database**: Use managed PostgreSQL service (AWS RDS, etc.)
3. **File Storage**: Consider cloud storage for photos (AWS S3, etc.)
4. **SSL**: Enable HTTPS in production
5. **Monitoring**: Add logging and monitoring solutions

### Docker Production
```bash
# Build and start in production mode
docker-compose -f docker-compose.prod.yml up --build -d
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please create an issue in the repository or contact the development team.