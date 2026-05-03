import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Trash2 } from 'lucide-react';

export default function HabitBoard({ allHabits, completedHabits, onToggleHabit, onDeleteHabit }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {allHabits.map((habit) => {
        const isCompleted = completedHabits.includes(habit.id);
        
        return (
          <motion.button
            key={habit.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onToggleHabit(habit.id)}
            className={`glass-panel p-4 flex items-center justify-between transition-colors duration-300 ${isCompleted ? 'border-primary/50' : 'border-white/5'}`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-lg font-medium transition-colors ${isCompleted ? 'text-primary' : 'text-textMain'}`}>
                {habit.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteHabit(habit.id);
                }}
                className="p-2 rounded-full text-textMuted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Delete habit"
              >
                <Trash2 size={16} />
              </button>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-primary text-background' : 'bg-surfaceHighlight text-textMuted'}`}>
                {isCompleted ? <Check size={18} strokeWidth={3} /> : <X size={18} />}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
