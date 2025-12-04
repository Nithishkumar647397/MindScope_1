import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MapPin, Music, ExternalLink, StopCircle, Map } from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';
import { getChatResponse, findPeacefulPlaces, suggestMusic } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { Mood } from '../types';

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const ChatInterface: React.FC = () => {
  const { chatHistory, addMessage, isLoadingAI, currentMood, moodLogs } = useWellness();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hasTriggeredIntervention, setHasTriggeredIntervention] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoadingAI]);

  // --- Automatic Stress Intervention Logic ---
  useEffect(() => {
    if (moodLogs.length >= 3) {
      const recentLogs = moodLogs.slice(-3);
      const isStressed = recentLogs.every(log => log.mood === Mood.Stress || log.mood === Mood.Anxiety);
      
      if (isStressed && !hasTriggeredIntervention && user) {
         setHasTriggeredIntervention(true);
         handleAutoIntervention();
      }

      const lastMood = recentLogs[recentLogs.length - 1].mood;
      if (lastMood === Mood.Happy || lastMood === Mood.Neutral) {
        setHasTriggeredIntervention(false);
      }
    }
  }, [moodLogs, user]);

  const handleAutoIntervention = async () => {
     await addMessage("I've noticed you've been feeling stressed or anxious lately. I care about you. Let me find some peaceful places nearby where you can take a break and relax.", "model");
     
     if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const response = await findPeacefulPlaces("peaceful places to relax", { lat: latitude, lng: longitude });
            
            const mapSearchUrl = `https://www.google.com/maps/search/peaceful+places/@${latitude},${longitude},13z`;
            const allLinks = [
                { uri: mapSearchUrl, title: "🗺️ View All Places on Google Maps" },
                ...response.links
            ];
            
            await addMessage(response.text, "model", allLinks);
        }, async () => {
             await addMessage("I wanted to find places for you, but I couldn't access your location. Please try taking a deep breath or listening to some calming music instead.", "model");
        });
     }
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    
    const userMsg = input;
    setInput('');
    await addMessage(userMsg, 'user');

    const history = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await getChatResponse(history, userMsg);
    await addMessage(response.text, 'model', response.groundingLinks);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + ' ' + transcript : transcript));
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const handleFindPlaces = async () => {
     if (!navigator.geolocation) {
       await addMessage("Geolocation is not supported by your browser.", "model");
       return;
     }

     await addMessage("Can you find some peaceful places near me?", "user");
     
     navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        // Pass lat/lng clearly
        const response = await findPeacefulPlaces("peaceful places", { lat: latitude, lng: longitude });
        
        const mapSearchUrl = `https://www.google.com/maps/search/peaceful+places/@${latitude},${longitude},13z`;
        const allLinks = [
            { uri: mapSearchUrl, title: "🗺️ Open Area Map" },
            ...response.links
        ];

        await addMessage(response.text, "model", allLinks);
     }, async (error) => {
         await addMessage("I couldn't get your location to find places. Please check your permissions.", "model");
     });
  };

  const handleMusicSuggest = async () => {
     const moodToQuery = currentMood || "Neutral";
     await addMessage(`I'm feeling ${moodToQuery}. Can you suggest some music?`, "user");
     
     const response = await suggestMusic(moodToQuery);
     await addMessage(response.text, "model", response.links);
  };

  return (
    <div className="flex flex-col h-[70vh] md:h-[600px] bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative">
      {/* Header */}
      <div className="p-4 bg-white/40 border-b border-white/20 flex justify-between items-center shrink-0 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
            <h2 className="font-semibold text-gray-700 text-sm md:text-base tracking-wide">MindScope Companion</h2>
        </div>
        <div className="flex gap-2">
            <button onClick={handleMusicSuggest} className="p-2 px-3 text-xs font-medium bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition flex items-center gap-1.5 shadow-sm hover:shadow">
                <Music size={14} /> <span className="hidden sm:inline">Music</span>
            </button>
            <button onClick={handleFindPlaces} className="p-2 px-3 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition flex items-center gap-1.5 shadow-sm hover:shadow">
                <MapPin size={14} /> <span className="hidden sm:inline">Places</span>
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-gradient-to-b from-transparent to-white/30">
        {chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <span className="text-2xl">👋</span>
            </div>
            <p className="font-medium">How are you feeling today?</p>
            <p className="text-sm">I'm here to listen.</p>
          </div>
        )}
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`msg-enter flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-md transition-all ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-700 rounded-bl-sm border border-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              
              {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-black/5 space-y-2">
                      <p className="text-[10px] uppercase font-bold opacity-60 tracking-wider">Helpful Resources</p>
                      <div className="flex flex-wrap gap-2">
                          {msg.groundingLinks.map((link, idx) => (
                              <a 
                                key={idx} 
                                href={link.uri} 
                                target="_blank" 
                                rel="noreferrer" 
                                className={`text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all hover:-translate-y-0.5 shadow-sm ${
                                    link.title.includes("Map") 
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                                }`}
                              >
                                  {link.title.includes("Map") ? <Map size={14} /> : <ExternalLink size={12} />} 
                                  <span className="truncate max-w-[150px]">{link.title}</span>
                              </a>
                          ))}
                      </div>
                  </div>
              )}
            </div>
          </div>
        ))}
        {isLoadingAI && (
            <div className="flex justify-start">
                 <div className="bg-white/80 backdrop-blur p-4 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100">
                    <div className="flex space-x-1.5 items-center h-4">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/60 border-t border-white/20 shrink-0 backdrop-blur-md">
        <div className="flex gap-3 items-center max-w-4xl mx-auto">
          <button
            onClick={handleVoiceInput}
            className={`p-3.5 rounded-full transition-all shrink-0 shadow-lg ${
              isListening 
              ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200 shadow-red-500/30' 
              : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
            }`}
            title={isListening ? "Listening..." : "Speak"}
          >
            {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : "Type how you feel..."}
            className="flex-1 min-w-0 px-6 py-3.5 rounded-full border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none bg-white/90 text-sm md:text-base shadow-inner placeholder-gray-400 transition-all"
          />
          
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shrink-0 transform active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};