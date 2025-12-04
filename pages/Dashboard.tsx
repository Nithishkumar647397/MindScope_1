import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWellness } from '../contexts/WellnessContext';
import { ChatInterface } from '../components/ChatInterface';
import { MoodChart } from '../components/MoodChart';
import { ProfilePanel } from '../components/ProfilePanel';
import { MOOD_COLORS, MOOD_ICONS, MOOD_ACCENTS } from '../constants.ts';
import { LogOut, Activity, Heart, User as UserIcon } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentMood, moodLogs } = useWellness();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const CurrentMoodIcon = MOOD_ICONS[currentMood];
  
  // Dynamic gradient based on mood
  const getGradient = (mood: string) => {
      switch(mood) {
          case 'Happy': return 'from-yellow-200 via-orange-100 to-yellow-50';
          case 'Sad': return 'from-blue-200 via-indigo-100 to-slate-200';
          case 'Angry': return 'from-red-200 via-orange-100 to-rose-200';
          case 'Stress': return 'from-purple-200 via-fuchsia-100 to-violet-200';
          case 'Anxiety': return 'from-teal-200 via-emerald-100 to-cyan-200';
          default: return 'from-gray-200 via-slate-100 to-zinc-200';
      }
  };

  const gradientClass = getGradient(currentMood);
  const accentClass = MOOD_ACCENTS[currentMood];

  // Simple stats
  const happyCount = moodLogs.filter(m => m.mood === 'Happy').length;
  const stressCount = moodLogs.filter(m => m.mood === 'Stress' || m.mood === 'Anxiety').length;

  return (
    <div className={`min-h-screen transition-all duration-[2000ms] ease-in-out bg-gradient-to-br ${gradientClass} animate-gradient`}>
      <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-8 bg-white/40 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/20">
          <div className="flex items-center gap-3">
             <div className="bg-white p-2.5 rounded-xl shadow-md">
                <Heart className="text-pink-600 fill-pink-600" size={24} />
             </div>
             <h1 className="text-2xl font-bold text-gray-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">MindScope</h1>
          </div>
          <div className="flex items-center gap-4">
             {/* Profile Circle Button */}
             <button 
                onClick={() => setIsProfileOpen(true)}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-transform hover:scale-105"
                title="View Profile"
             >
                 {user?.username ? (
                     <span className="font-bold text-sm">{user.username.charAt(0).toUpperCase()}</span>
                 ) : (
                     <UserIcon size={20} />
                 )}
             </button>
             
             <button onClick={logout} className="p-2.5 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full transition shadow-sm border border-gray-100" title="Logout">
               <LogOut size={20} />
             </button>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Stats & Chat */}
          <div className="lg:col-span-8 space-y-6">
             {/* Stats Row */}
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Current Mood Card */}
                <div className={`p-5 rounded-3xl border ${accentClass} flex items-center justify-between shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white/80 backdrop-blur`}>
                   <div>
                      <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Current Vibe</p>
                      <p className="text-2xl font-black mt-1 tracking-tight">{currentMood}</p>
                   </div>
                   <CurrentMoodIcon size={36} className="opacity-90" />
                </div>
                
                {/* Wellness Score */}
                <div className="p-5 bg-white/70 backdrop-blur-md rounded-3xl border border-white/40 shadow-lg hover:shadow-xl transition-all">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <Activity size={14} className="text-green-600" />
                      </div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Happy Days</p>
                   </div>
                   <p className="text-3xl font-bold text-gray-800">{happyCount}</p>
                </div>

                <div className="p-5 bg-white/70 backdrop-blur-md rounded-3xl border border-white/40 shadow-lg hover:shadow-xl transition-all hidden md:block">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <Activity size={14} className="text-orange-600" />
                      </div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stress Points</p>
                   </div>
                   <p className="text-3xl font-bold text-gray-800">{stressCount}</p>
                </div>
             </div>

             {/* Chat Interface */}
             <ChatInterface />
          </div>

          {/* Right Column: Analytics & Suggestions */}
          <div className="lg:col-span-4 space-y-6">
             
             {/* Chart */}
             <div className="bg-white/70 backdrop-blur-xl p-1 rounded-3xl shadow-lg border border-white/40">
                <MoodChart />
             </div>

             {/* Suggestions Panel */}
             <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/40">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                    Smart Tips
                </h3>
                
                {currentMood === 'Stress' || currentMood === 'Anxiety' ? (
                   <div className="space-y-3">
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-default">
                         <h4 className="font-bold text-emerald-800 text-sm mb-1">🌿 Grounding Technique</h4>
                         <p className="text-xs text-emerald-700 leading-relaxed">Focus on 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.</p>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-default">
                         <h4 className="font-bold text-indigo-800 text-sm mb-1">🎵 Sonic Relief</h4>
                         <p className="text-xs text-indigo-700 leading-relaxed">Ask MindScope for "Binaural Beats" to help sync your brainwaves for relaxation.</p>
                      </div>
                   </div>
                ) : currentMood === 'Sad' ? (
                   <div className="space-y-3">
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                         <h4 className="font-bold text-amber-800 text-sm mb-1">☀️ Light Therapy</h4>
                         <p className="text-xs text-amber-700 leading-relaxed">Even 10 minutes of sunlight can naturally boost serotonin levels.</p>
                      </div>
                   </div>
                ) : (
                   <div className="p-8 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                      <p>You're balanced! 🌟<br/>Keep up the positive momentum.</p>
                   </div>
                )}
             </div>

             <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 rounded-3xl shadow-xl shadow-indigo-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <h3 className="font-bold text-lg relative z-10">Need a human?</h3>
                <p className="text-indigo-100 text-sm mt-2 relative z-10 leading-relaxed">MindScope is AI. If you're in crisis, please reach out to professional support services.</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;