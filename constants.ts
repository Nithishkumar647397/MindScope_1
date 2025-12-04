import { Mood } from "./types";
import { Smile, Frown, Meh, AlertCircle, Zap, CloudLightning } from 'lucide-react';

export const MOOD_COLORS: Record<Mood, string> = {
  [Mood.Happy]: 'bg-yellow-50 from-yellow-100 to-orange-50',
  [Mood.Sad]: 'bg-blue-50 from-blue-100 to-indigo-50',
  [Mood.Angry]: 'bg-red-50 from-red-100 to-orange-50',
  [Mood.Stress]: 'bg-purple-50 from-purple-100 to-pink-50',
  [Mood.Neutral]: 'bg-gray-50 from-gray-100 to-slate-50',
  [Mood.Anxiety]: 'bg-teal-50 from-teal-100 to-green-50',
};

export const MOOD_ACCENTS: Record<Mood, string> = {
  [Mood.Happy]: 'text-yellow-600 bg-yellow-100 border-yellow-200',
  [Mood.Sad]: 'text-blue-600 bg-blue-100 border-blue-200',
  [Mood.Angry]: 'text-red-600 bg-red-100 border-red-200',
  [Mood.Stress]: 'text-purple-600 bg-purple-100 border-purple-200',
  [Mood.Neutral]: 'text-gray-600 bg-gray-100 border-gray-200',
  [Mood.Anxiety]: 'text-teal-600 bg-teal-100 border-teal-200',
};

export const MOOD_ICONS: Record<Mood, any> = {
  [Mood.Happy]: Smile,
  [Mood.Sad]: Frown,
  [Mood.Angry]: Zap,
  [Mood.Stress]: AlertCircle,
  [Mood.Neutral]: Meh,
  [Mood.Anxiety]: CloudLightning,
};
