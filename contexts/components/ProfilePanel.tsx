import React from 'react';
import { X, User, MessageSquare, Activity, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWellness } from '../contexts/WellnessContext';
import { MoodChart } from './MoodChart';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { chatHistory, moodLogs, clearChat } = useWellness();

  if (!isOpen) return null;

  // Group chat history by date
  const groupedChats = chatHistory.reduce((acc, msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {} as Record<string, typeof chatHistory>);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shrink-0">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">My Profile</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                    <X size={20} />
                </button>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/50">
                    {user?.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 className="font-bold text-lg">{user?.username}</h3>
                    <p className="text-indigo-100 text-sm">{user?.email}</p>
                </div>
            </div>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50">
            
            {/* Stats Section */}
            <div>
                <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
                    <Activity size={18} className="text-indigo-600" />
                    <h3>Weekly Performance</h3>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 h-48">
                    <MoodChart />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                        <span className="block text-2xl font-bold text-green-600">
                            {moodLogs.filter(m => m.mood === 'Happy').length}
                        </span>
                        <span className="text-xs text-green-700 font-medium">Happy Moments</span>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center border border-orange-100">
                        <span className="block text-2xl font-bold text-orange-600">
                            {moodLogs.filter(m => m.mood === 'Stress' || m.mood === 'Anxiety').length}
                        </span>
                        <span className="text-xs text-orange-700 font-medium">Challenges</span>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-800 font-semibold">
                        <MessageSquare size={18} className="text-purple-600" />
                        <h3>Chat History</h3>
                    </div>
                    {chatHistory.length > 0 && (
                        <button 
                            onClick={() => { if(confirm("Delete all chat history?")) clearChat(); }}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                            <Trash2 size={12} /> Clear
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {Object.keys(groupedChats).length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No history yet.</p>
                    ) : (
                        Object.entries(groupedChats).reverse().map(([date, msgs]) => (
                            <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{date}</span>
                                </div>
                                <div className="p-3 space-y-2">
                                    {msgs.slice(-3).map(msg => (
                                        <div key={msg.id} className="text-xs">
                                            <span className={`font-bold ${msg.role === 'user' ? 'text-blue-600' : 'text-purple-600'}`}>
                                                {msg.role === 'user' ? 'You' : 'MindScope'}:
                                            </span>
                                            <span className="text-gray-600 ml-2 line-clamp-1">{msg.content}</span>
                                        </div>
                                    ))}
                                    {msgs.length > 3 && <p className="text-xs text-center text-gray-400 italic">...and {msgs.length - 3} more</p>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </>
  );
};