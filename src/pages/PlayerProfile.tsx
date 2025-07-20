import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Award,
  TrendingUp,
  Gift,
  Check,
  X,
  Clock
} from 'lucide-react';

interface PlayerDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  ageGroup: {
    name: string;
  };
  trainingPlans: Array<{
    id: string;
    sessionsBooked: number;
    sessionsUsed: number;
    complimentaryUsed: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>;
  attendances: Array<{
    id: string;
    status: 'PRESENT' | 'ABSENT';
    isComplimentary: boolean;
    markedAt: string;
    session: {
      id: string;
      date: string;
      timeSlot: 'MORNING' | 'EVENING';
    };
  }>;
}

function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchPlayer();
    }
  }, [id]);

  const fetchPlayer = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/players/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch player details');
      }

      const data = await response.json();
      setPlayer(data);
    } catch (error) {
      console.error('Error fetching player:', error);
      setError('Failed to load player details');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getAttendanceStats = () => {
    if (!player) return null;

    const activePlan = player.trainingPlans.find(p => p.isActive);
    if (!activePlan) return null;

    const presentAttendances = player.attendances.filter(a => a.status === 'PRESENT');
    const totalAttendances = presentAttendances.length;
    const complimentaryAttendances = presentAttendances.filter(a => a.isComplimentary).length;
    const regularAttendances = totalAttendances - complimentaryAttendances;
    
    const attendanceRate = activePlan.sessionsBooked > 0 
      ? Math.round((totalAttendances / activePlan.sessionsBooked) * 100)
      : 0;

    return {
      ...activePlan,
      totalAttendances,
      regularAttendances,
      complimentaryAttendances,
      attendanceRate,
      remainingSessions: activePlan.sessionsBooked - activePlan.sessionsUsed,
      remainingComplimentary: 3 - activePlan.complimentaryUsed,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeSlot: string) => {
    return timeSlot === 'MORNING' ? '9:00 AM' : '6:00 PM';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Player not found</h2>
          <button
            onClick={() => navigate('/players')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Players
          </button>
        </div>
      </div>
    );
  }

  const stats = getAttendanceStats();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/players')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Players
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">Player Profile</h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Player Info */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-gray-600" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{player.name}</h2>
            <p className="text-lg text-gray-600 mb-2">{player.ageGroup.name}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {player.email}
              </div>
              {player.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {player.phone}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Age {calculateAge(player.dateOfBirth)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAttendances}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Gift className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Complimentary Used</p>
                <p className="text-2xl font-bold text-gray-900">{stats.complimentaryUsed}/3</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Remaining Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.remainingSessions}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Plan */}
      {stats && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Training Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Regular Sessions</span>
                <span className="text-sm font-medium">{stats.sessionsUsed}/{stats.sessionsBooked}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.sessionsUsed / stats.sessionsBooked) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Complimentary Sessions</span>
                <span className="text-sm font-medium">{stats.complimentaryUsed}/3</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.complimentaryUsed / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Plan period: {formatDate(stats.startDate)} - {formatDate(stats.endDate)}</p>
          </div>
        </div>
      )}

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Attendance History</h3>
        </div>
        
        {player.attendances.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h4>
            <p className="text-gray-500">This player hasn't attended any sessions yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {player.attendances
              .sort((a, b) => new Date(b.session.date).getTime() - new Date(a.session.date).getTime())
              .map((attendance) => (
              <div key={attendance.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      attendance.status === 'PRESENT' 
                        ? attendance.isComplimentary 
                          ? 'bg-blue-100' 
                          : 'bg-green-100'
                        : 'bg-red-100'
                    }`}>
                      {attendance.status === 'PRESENT' ? (
                        attendance.isComplimentary ? (
                          <Gift className={`w-5 h-5 text-blue-600`} />
                        ) : (
                          <Check className={`w-5 h-5 text-green-600`} />
                        )
                      ) : (
                        <X className={`w-5 h-5 text-red-600`} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {formatDate(attendance.session.date)}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(attendance.session.timeSlot)}
                        </div>
                        <span>•</span>
                        <span>
                          {attendance.status === 'PRESENT' 
                            ? attendance.isComplimentary 
                              ? 'Present (Complimentary)'
                              : 'Present'
                            : 'Absent'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(attendance.markedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerProfile;