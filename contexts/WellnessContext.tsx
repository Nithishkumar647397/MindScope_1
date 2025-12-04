import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatMessage, Mood, MoodLog } from '../types';
import { useAuth } from './AuthContext';
import { analyzeMood } from '../services/geminiService';
import { ChatTable, MoodTable } from '../services/database';

interface WellnessContextType {
  currentMood: Mood;
  moodLogs: MoodLog[];
  chatHistory: ChatMessage[];
  addMessage: (content: string, role: 'user' | 'model', links?: any[]) => Promise<void>;
  addMoodLog: (mood: Mood) => void;
  isLoadingAI: boolean;
  clearChat: () => void;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export const WellnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = useState<Mood>(Mood.Neutral);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Load data when user changes
  useEffect(() => {
    const loadData = async () => {
        if (user) {
          const logs = await MoodTable.findByUserId(user.id);
          const chats = await ChatTable.findByUserId(user.id);
          
          setMoodLogs(logs);
          setChatHistory(chats);
    
          if (logs.length > 0) {
            setCurrentMood(logs[logs.length - 1].mood);
          }
        } else {
          setMoodLogs([]);
          setChatHistory([]);
          setCurrentMood(Mood.Neutral);
        }
    };
    loadData();
  }, [user]);

  const addMoodLog = async (mood: Mood) => {
    if (!user) return;
    const newLog: MoodLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      mood
    };
    
    await MoodTable.create(user.id, newLog);
    setMoodLogs(prev => [...prev, newLog]);
    setCurrentMood(mood);
  };

  const addMessage = async (content: string, role: 'user' | 'model', links?: any[]) => {
    if (!user) return;

    let detectedMood = currentMood;

    if (role === 'user') {
        setIsLoadingAI(true);
        // Analyze mood asynchronously to not block UI updates
        analyzeMood(content).then(mood => {
            if (mood !== Mood.Neutral) {
                addMoodLog(mood);
                detectedMood = mood;
            }
        }).finally(() => setIsLoadingAI(false));
    }

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: Date.now(),
      relatedMood: detectedMood,
      groundingLinks: links
    };

    await ChatTable.create(user.id, newMessage);
    setChatHistory(prev => [...prev, newMessage]);
  };

  const clearChat = async () => {
      if(!user) return;
      await ChatTable.clearHistory(user.id);
      setChatHistory([]);
  }

  return (
    <WellnessContext.Provider value={{
      currentMood,
      moodLogs,
      chatHistory,
      addMessage,
      addMoodLog,
      isLoadingAI,
      clearChat
    }}>
      {children}
    </WellnessContext.Provider>
  );
};

export const useWellness = () => {
  const context = useContext(WellnessContext);
  if (!context) throw new Error("useWellness must be used within a WellnessProvider");
  return context;
};