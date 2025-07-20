import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, TrendingUp, Award, Gift, Calendar } from 'lucide-react';

interface PlayerWithStats {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  ageGroup: {
    name: string;
  };
  statistics: {
    totalAttendances: number;
    regularAttendances: number;
    complimentaryAttendances: number;
    sessionsBooked: number;
    sessionsUsed: number;
    complimentaryUsed: number;
    remainingSessions: number;
    remainingComplimentary: number;
  };
}

function PlayerStats() {
  const { token } = useAuth();
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'attendance' | 'remaining'>('name');

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/players', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }

      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Failed to load player statistics');
    } finally {
      setLoading(false);
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'attendance':
        return b.statistics.totalAttendances - a.statistics.totalAttendances;
      case 'remaining':
        return b.statistics.remainingSessions - a.statistics.remainingSessions;
      default:
        return 0;
    }
  });

  const getAttendanceRate = (player: PlayerWithStats) => {
    if (player.statistics.sessionsBooked === 0) return 0;
    return Math.round((player.statistics.totalAttendances / player.statistics.sessionsBooked) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Player Statistics</h1>
        <p className="text-gray-600">Track attendance and training progress for all players.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Sort Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <div className="flex space-x-2">
          {[
            { key: 'name', label: 'Name' },
            { key: 'attendance', label: 'Attendance' },
            { key: 'remaining', label: 'Remaining Sessions' },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key as any)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                sortBy === option.key
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Players</p>
              <p className="text-2xl font-bold text-gray-900">{players.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {players.length > 0 
                  ? Math.round(players.reduce((sum, p) => sum + getAttendanceRate(p), 0) / players.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {players.reduce((sum, p) => sum + p.statistics.totalAttendances, 0)}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {players.reduce((sum, p) => sum + p.statistics.complimentaryUsed, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPlayers.map((player) => {
          const attendanceRate = getAttendanceRate(player);
          
          return (
            <Link
              key={player.id}
              to={`/player/${player.id}`}
              className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow p-6 block"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{player.name}</h3>
                  <p className="text-sm text-gray-500">{player.ageGroup.name}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="font-medium">{attendanceRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(attendanceRate)}`}
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-semibold text-green-700">
                    {player.statistics.totalAttendances}
                  </div>
                  <div className="text-green-600">Total Sessions</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-semibold text-blue-700">
                    {player.statistics.remainingSessions}
                  </div>
                  <div className="text-blue-600">Remaining</div>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <div className="font-semibold text-orange-700">
                    {player.statistics.complimentaryUsed}/3
                  </div>
                  <div className="text-orange-600">Complimentary</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-700">
                    {player.statistics.sessionsBooked}
                  </div>
                  <div className="text-gray-600">Booked</div>
                </div>
              </div>

              {/* Warning indicators */}
              <div className="mt-4 flex flex-wrap gap-2">
                {player.statistics.remainingSessions <= 2 && player.statistics.remainingSessions > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Low sessions
                  </span>
                )}
                {player.statistics.remainingSessions === 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    No sessions left
                  </span>
                )}
                {attendanceRate < 60 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Low attendance
                  </span>
                )}
                {player.statistics.complimentaryUsed === 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Max complimentary
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {players.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
          <p className="text-gray-500">No players are assigned to your age groups.</p>
        </div>
      )}
    </div>
  );
}

export default PlayerStats;