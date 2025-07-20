import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Users, UserCheck, UserX, Camera } from 'lucide-react';

interface TrainingSession {
  id: string;
  date: string;
  timeSlot: 'MORNING' | 'EVENING';
  status: string;
  maxPlayers: number;
  groupPhoto?: string;
  ageGroup: {
    id: string;
    name: string;
    players: any[];
  };
  attendances: any[];
}

function Dashboard() {
  const { token, coach } = useAuth();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodaySessions();
  }, []);

  const fetchTodaySessions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sessions/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const getTimeSlotDisplay = (timeSlot: string) => {
    return timeSlot === 'MORNING' ? 'Morning (9:00 AM)' : 'Evening (6:00 PM)';
  };

  const getAttendanceStats = (session: TrainingSession) => {
    const totalPlayers = session.ageGroup.players.length;
    const attendances = session.attendances;
    const present = attendances.filter(a => a.status === 'PRESENT').length;
    const absent = attendances.filter(a => a.status === 'ABSENT').length;
    const pending = totalPlayers - present - absent;
    
    return { totalPlayers, present, absent, pending };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {coach?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here are today's training sessions for your age groups.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions scheduled</h3>
          <p className="text-gray-500">You don't have any training sessions scheduled for today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sessions.map((session) => {
            const stats = getAttendanceStats(session);
            
            return (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {session.ageGroup.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getTimeSlotDisplay(session.timeSlot)}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <UserCheck className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-700">{stats.present}</div>
                      <div className="text-xs text-green-600">Present</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <UserX className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="text-2xl font-bold text-red-700">{stats.absent}</div>
                      <div className="text-xs text-red-600">Absent</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-700">{stats.pending}</div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                  </div>

                  {session.groupPhoto && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Camera className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Group Photo</span>
                      </div>
                      <img
                        src={session.groupPhoto}
                        alt="Group photo"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {stats.totalPlayers} total players
                    </div>
                    <Link
                      to={`/session/${session.id}/attendance`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      Mark Attendance
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;