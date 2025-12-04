import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWellness } from '../contexts/WellnessContext';
import { Mood } from '../types';

const moodToValue = (mood: Mood) => {
  switch (mood) {
    case Mood.Happy: return 5;
    case Mood.Neutral: return 3;
    case Mood.Stress: return 2;
    case Mood.Anxiety: return 1;
    case Mood.Sad: return 1;
    case Mood.Angry: return 1;
    default: return 3;
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg text-xs">
        <p className="font-bold">{payload[0].payload.date}</p>
        <p className="text-blue-600">Mood: {payload[0].payload.mood}</p>
      </div>
    );
  }
  return null;
};

export const MoodChart: React.FC = () => {
  const { moodLogs } = useWellness();

  // Process data: Take last 7 days or last 10 entries
  const data = moodLogs.slice(-10).map(log => ({
    date: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: moodToValue(log.mood),
    mood: log.mood
  }));

  if (data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-white/50 rounded-2xl border border-gray-200 border-dashed">
        Not enough data yet. Chat with MindScope to track your mood.
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-white/60 backdrop-blur-sm p-4 rounded-2xl shadow-md border border-white/20">
      <h3 className="text-gray-700 font-semibold mb-4 text-sm">Emotional Trend (Real-time)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="date" hide />
          <YAxis domain={[0, 6]} hide />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMood)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};