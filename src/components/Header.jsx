import React from 'react';
import { motion } from 'framer-motion';
import { quotes } from '../utils/quotes';
import { Award } from 'lucide-react';

export default function Header({ profile, currentStreak, completionRatio, badges = [] }) {
  if (!profile) return null;

  const quoteOfTheDay = quotes[(profile.currentDay - 1) % quotes.length];

  return (
    <div className="glass-panel p-6 mb-8 mt-12">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-textMain">Day {profile.currentDay} <span className="text-textMuted text-2xl font-medium">/ {profile.totalDays}</span></h1>
          <p className="text-textMuted mt-1">{profile.name} • {profile.targetCalories ? `${profile.targetCalories} kcal/day` : (profile.isHardcoreMode ? 'Hardcore Mode' : 'Soft Mode')}</p>
          <p className="text-primary/80 italic text-sm mt-3 border-l-2 border-primary/50 pl-3">"{quoteOfTheDay}"</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-4xl font-black text-primary">{(completionRatio * 100).toFixed(0)}%</div>
          <p className="text-sm text-textMuted font-medium tracking-wide uppercase mt-1">Daily Progress</p>
        </div>
      </div>
      
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {badges.map(badge => (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={badge} 
              className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]"
            >
              <Award size={14} />
              {badge}
            </motion.div>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-3 bg-surfaceHighlight rounded-full overflow-hidden mt-2">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${completionRatio * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      {/* Streak Info */}
      <div className="mt-4 flex justify-between text-sm font-medium">
        <span className="text-textMuted">🔥 Current Streak: <span className="text-textMain">{currentStreak}</span> Days</span>
        <span className="text-textMuted">{Math.max(0, profile.totalDays - profile.currentDay)} Days Remaining</span>
      </div>
    </div>
  );
}
