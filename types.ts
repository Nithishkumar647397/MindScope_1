export enum Mood {
  Happy = 'Happy',
  Sad = 'Sad',
  Angry = 'Angry',
  Stress = 'Stress',
  Neutral = 'Neutral',
  Anxiety = 'Anxiety',
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // In a real app, never store this in local storage plain text
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  relatedMood?: Mood;
  groundingLinks?: Array<{uri: string, title: string}>;
}

export interface MoodLog {
  id: string;
  timestamp: number;
  mood: Mood;
  note?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

export interface Recommendation {
  type: 'music' | 'place' | 'activity';
  title: string;
  description: string;
  link?: string;
}