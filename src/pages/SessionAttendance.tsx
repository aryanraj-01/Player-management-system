import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Webcam from 'react-webcam';
import { 
  ArrowLeft, 
  Camera, 
  Check, 
  X, 
  Clock, 
  Gift, 
  User,
  Upload
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  email: string;
  trainingPlans: any[];
}

interface Attendance {
  id: string;
  status: 'PRESENT' | 'ABSENT';
  isComplimentary: boolean;
  photo?: string;
  notes?: string;
  player: Player;
}

interface Session {
  id: string;
  date: string;
  timeSlot: string;
  ageGroup: {
    name: string;
    players: Player[];
  };
  attendances: Attendance[];
  groupPhoto?: string;
}

function SessionAttendance() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [groupPhoto, setGroupPhoto] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<Record<string, {
    status: 'PRESENT' | 'ABSENT' | 'PENDING';
    isComplimentary: boolean;
    photo?: string;
    notes?: string;
  }>>({});
  const [saving, setSaving] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchSession();
    }
  }, [id]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/sessions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }

      const data = await response.json();
      setSession(data);
      setGroupPhoto(data.groupPhoto || '');
      
      // Initialize attendance data
      const initialAttendance: Record<string, any> = {};
      data.ageGroup.players.forEach((player: Player) => {
        const existingAttendance = data.attendances.find((a: Attendance) => a.player.id === player.id);
        if (existingAttendance) {
          initialAttendance[player.id] = {
            status: existingAttendance.status,
            isComplimentary: existingAttendance.isComplimentary,
            photo: existingAttendance.photo,
            notes: existingAttendance.notes,
          };
        } else {
          initialAttendance[player.id] = {
            status: 'PENDING',
            isComplimentary: false,
            photo: '',
            notes: '',
          };
        }
      });
      setAttendanceData(initialAttendance);
    } catch (error) {
      console.error('Error fetching session:', error);
      setError('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (playerId: string, status: 'PRESENT' | 'ABSENT', isComplimentary: boolean = false) => {
    setSaving(playerId);
    try {
      const response = await fetch('http://localhost:3001/api/attendance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          sessionId: id,
          status,
          isComplimentary,
          photo: attendanceData[playerId]?.photo || '',
          notes: attendanceData[playerId]?.notes || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark attendance');
      }

      setAttendanceData(prev => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          status,
          isComplimentary,
        }
      }));
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('Failed to mark attendance');
    } finally {
      setSaving('');
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setGroupPhoto(imageSrc);
      setShowCamera(false);
      uploadGroupPhoto(imageSrc);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setGroupPhoto(result);
        uploadGroupPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadGroupPhoto = async (photo: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/sessions/${id}/photo`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photo }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Failed to upload photo');
    }
  };

  const getPlayerStats = (player: Player) => {
    const activePlan = player.trainingPlans.find(p => p.isActive);
    if (!activePlan) return null;

    return {
      sessionsBooked: activePlan.sessionsBooked,
      sessionsUsed: activePlan.sessionsUsed,
      complimentaryUsed: activePlan.complimentaryUsed,
      remainingSessions: activePlan.sessionsBooked - activePlan.sessionsUsed,
      remainingComplimentary: 3 - activePlan.complimentaryUsed,
    };
  };

  const canUseComplimentary = (player: Player) => {
    const stats = getPlayerStats(player);
    return stats && stats.remainingComplimentary > 0;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white p-4 rounded-lg shadow border">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Session not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {session.ageGroup.name} - Attendance
            </h1>
            <div className="flex items-center mt-2 text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>
                {session.timeSlot === 'MORNING' ? 'Morning (9:00 AM)' : 'Evening (6:00 PM)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Group Photo Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Group Photo</h2>
        
        {groupPhoto ? (
          <div className="relative">
            <img
              src={groupPhoto}
              alt="Group photo"
              className="w-full max-w-md h-48 object-cover rounded-lg"
            />
            <button
              onClick={() => setShowCamera(true)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowCamera(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Take Group Photo</h3>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCamera(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Players List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Players</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {session.ageGroup.players.map((player) => {
            const playerAttendance = attendanceData[player.id];
            const stats = getPlayerStats(player);
            const canComplimentary = canUseComplimentary(player);
            
            return (
              <div key={player.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{player.name}</h3>
                      <p className="text-sm text-gray-500">{player.email}</p>
                      {stats && (
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                          <span>Sessions: {stats.sessionsUsed}/{stats.sessionsBooked}</span>
                          <span>Complimentary: {stats.complimentaryUsed}/3</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {playerAttendance?.status === 'PRESENT' ? (
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          playerAttendance.isComplimentary 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          <Check className="w-4 h-4 mr-1" />
                          {playerAttendance.isComplimentary ? 'Present (Complimentary)' : 'Present'}
                        </span>
                        <button
                          onClick={() => markAttendance(player.id, 'ABSENT')}
                          disabled={saving === player.id}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : playerAttendance?.status === 'ABSENT' ? (
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <X className="w-4 h-4 mr-1" />
                          Absent
                        </span>
                        <button
                          onClick={() => markAttendance(player.id, 'PRESENT')}
                          disabled={saving === player.id}
                          className="text-gray-400 hover:text-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => markAttendance(player.id, 'PRESENT', false)}
                          disabled={saving === player.id}
                          className="inline-flex items-center px-3 py-1 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {saving === player.id ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                          ) : (
                            <Check className="w-4 h-4 mr-1" />
                          )}
                          Present
                        </button>
                        
                        {canComplimentary && (
                          <button
                            onClick={() => markAttendance(player.id, 'PRESENT', true)}
                            disabled={saving === player.id}
                            className="inline-flex items-center px-3 py-1 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            <Gift className="w-4 h-4 mr-1" />
                            Complimentary
                          </button>
                        )}
                        
                        <button
                          onClick={() => markAttendance(player.id, 'ABSENT')}
                          disabled={saving === player.id}
                          className="inline-flex items-center px-3 py-1 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Absent
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SessionAttendance;