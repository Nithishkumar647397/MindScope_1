import { User, ChatMessage, MoodLog, Mood } from '../types';

/**
 * Database Service
 * 
 * This file simulates a backend database connection.
 * In a production environment, these methods would make API calls (fetch/axios) 
 * to a Python/Node.js backend connected to MongoDB/PostgreSQL.
 * 
 * Current Implementation: LocalStorage-based persistence for demo purposes.
 */

// --- USER TABLE OPERATIONS ---
export const UserTable = {
  findUserByEmail: async (email: string): Promise<User | null> => {
    const usersStr = localStorage.getItem('users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    return users.find(u => u.email === email) || null;
  },

  create: async (user: User): Promise<void> => {
    const usersStr = localStorage.getItem('users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }
};

// --- CHAT TABLE OPERATIONS ---
export const ChatTable = {
  findByUserId: async (userId: string): Promise<ChatMessage[]> => {
    const storedChats = localStorage.getItem(`chats_${userId}`);
    return storedChats ? JSON.parse(storedChats) : [];
  },

  create: async (userId: string, message: ChatMessage): Promise<void> => {
    const storedChats = localStorage.getItem(`chats_${userId}`);
    const chats: ChatMessage[] = storedChats ? JSON.parse(storedChats) : [];
    chats.push(message);
    localStorage.setItem(`chats_${userId}`, JSON.stringify(chats));
  },
  
  clearHistory: async (userId: string): Promise<void> => {
      localStorage.removeItem(`chats_${userId}`);
  }
};

// --- MOOD LOG TABLE OPERATIONS ---
export const MoodTable = {
  findByUserId: async (userId: string): Promise<MoodLog[]> => {
    const storedLogs = localStorage.getItem(`moods_${userId}`);
    return storedLogs ? JSON.parse(storedLogs) : [];
  },

  create: async (userId: string, log: MoodLog): Promise<void> => {
    const storedLogs = localStorage.getItem(`moods_${userId}`);
    const logs: MoodLog[] = storedLogs ? JSON.parse(storedLogs) : [];
    logs.push(log);
    localStorage.setItem(`moods_${userId}`, JSON.stringify(logs));
  },

  getLastMood: async (userId: string): Promise<Mood> => {
    const logs = await MoodTable.findByUserId(userId);
    return logs.length > 0 ? logs[logs.length - 1].mood : Mood.Neutral;
  }
};