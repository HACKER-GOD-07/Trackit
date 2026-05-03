import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

export default function Analytics({ profile, today }) {
  const profileId = profile?.id;
  const targetCalories = profile?.targetCalories;

  const [weightInput, setWeightInput] = useState('');
  const [calorieInput, setCalorieInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  const logs = useLiveQuery(
    () => profileId ? db.dailyLogs.where({ profileId }).toArray() : [],
    [profileId]
  ) || [];

  const todayLog = logs.find(l => l.date === today);

  useEffect(() => {
    if (todayLog?.notes && !notesInput) {
      setNotesInput(todayLog.notes);
    }
  }, [todayLog?.notes]);

  useEffect(() => {
    if (todayLog) {
      const updates = {};
      if (todayLog.calories > 50000 || todayLog.calories < 0) updates.calories = 0;
      if (todayLog.weight > 1000 || todayLog.weight < 0) updates.weight = 0;
      
      if (Object.keys(updates).length > 0) {
        db.dailyLogs.update(todayLog.id, updates);
      }
    }
  }, [todayLog]);

  const handleSaveMetrics = async () => {
    const data = {};
    if (weightInput) {
      const w = parseFloat(weightInput);
      if (w >= 0 && w <= 600) data.weight = parseFloat(w.toFixed(2));
      else { alert("Please enter a valid weight (0 - 600)"); return; }
    }
    if (calorieInput) {
      const c = parseInt(calorieInput, 10);
      if (c >= 0 && c <= 10000) data.calories = c;
      else { alert("Please enter a valid calorie amount (0 - 10000)"); return; }
    }
    if (notesInput !== undefined) data.notes = notesInput;
    
    if (Object.keys(data).length === 0) return;

    if (todayLog) {
      await db.dailyLogs.update(todayLog.id, data);
    } else {
      await db.dailyLogs.add({
        profileId,
        date: today,
        completedHabits: [],
        ...data
      });
    }
    setWeightInput('');
    setCalorieInput('');
    // Intentionally not clearing notesInput so they can see what they just saved
  };

  const todayDate = new Date();
  const monthStart = startOfMonth(todayDate);
  const monthEnd = endOfMonth(todayDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate }).map(d => {
    const dateStr = format(d, 'yyyy-MM-dd');
    const log = logs.find(l => l.date === dateStr);
    const ratio = log ? log.completedHabits.length / 8 : 0;
    return { 
      date: d, 
      dateStr, 
      ratio: Math.min(ratio, 1),
      isCurrentMonth: isSameMonth(d, monthStart),
      isToday: isToday(d)
    };
  });

  const chartData = [...logs]
    .filter(l => l.weight && l.weight > 0 && l.weight <= 1000)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-14)
    .map(l => ({
      date: format(new Date(l.date), 'MMM dd'),
      weight: parseFloat(Number(l.weight).toFixed(2))
    }));

  const caloriesConsumed = todayLog?.calories || 0;
  const caloriePercent = targetCalories ? Math.min((caloriesConsumed / targetCalories) * 100, 100) : 0;
  const isOverCalories = targetCalories && caloriesConsumed > targetCalories;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12 pb-12">
      <div className="glass-panel p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-primary" />
          <h3 className="text-xl font-semibold">Daily Metrics</h3>
        </div>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="text-xs text-textMuted uppercase tracking-wider mb-1 block">Weight (kg/lbs)</label>
            <input 
              type="number"
              min="0"
              max="600"
              step="0.1"
              value={weightInput}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') { setWeightInput(''); return; }
                const num = Number(val);
                if (num < 0 || num > 600) return;
                if (val.includes('.') && val.split('.')[1].length > 2) return;
                setWeightInput(val);
              }}
              placeholder={todayLog?.weight ? Number(todayLog.weight).toFixed(2) : "0.0"}
              className="w-full bg-surfaceHighlight/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-textMuted uppercase tracking-wider mb-1 block">Calories</label>
            <input 
              type="number"
              min="0"
              max="10000"
              step="1"
              value={calorieInput}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') { setCalorieInput(''); return; }
                const num = Number(val);
                if (num < 0 || num > 10000) return;
                if (val.includes('.')) return;
                setCalorieInput(val);
              }}
              placeholder={caloriesConsumed || "0"}
              className="w-full bg-surfaceHighlight/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {targetCalories && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-textMuted mb-1">
              <span>Calories Consumed</span>
              <span>{caloriesConsumed} / {targetCalories} kcal</span>
            </div>
            <div className="w-full h-2 bg-surfaceHighlight rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isOverCalories ? 'bg-red-500' : 'bg-primary'}`} 
                style={{ width: `${caloriePercent}%` }} 
              />
            </div>
          </div>
        )}

        <div className="mb-4 flex-1">
          <label className="text-xs text-textMuted uppercase tracking-wider mb-1 flex items-center gap-1">
            <BookOpen size={14} /> Daily Reflections & Notes
          </label>
          <textarea
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            placeholder="How did today go? What workouts did you do? Which book did you read?"
            className="w-full bg-surfaceHighlight/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-y"
          />
        </div>

        <button 
          onClick={handleSaveMetrics}
          className="mt-auto w-full bg-primary/20 hover:bg-primary/30 text-primary font-medium p-3 rounded-lg transition-colors"
        >
          Save Metrics & Notes
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-primary" />
            <h3 className="text-xl font-semibold">{format(todayDate, 'MMMM yyyy')} Tracking</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="text-xs font-medium text-textMuted uppercase">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            let color = 'bg-surfaceHighlight/50'; 
            if (day.ratio > 0) color = 'bg-primary/30 text-white';
            if (day.ratio > 0.5) color = 'bg-primary/60 text-white';
            if (day.ratio === 1) color = 'bg-primary text-black font-bold';
            
            return (
              <div 
                key={day.dateStr} 
                title={`${day.dateStr}: ${(day.ratio*100).toFixed(0)}%`}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110 cursor-pointer
                  ${day.isCurrentMonth ? color : 'bg-transparent text-white/20'}
                  ${!day.isCurrentMonth && day.ratio > 0 ? 'opacity-50' : ''}
                  ${day.isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#0B0B0C]' : ''}
                `}
              >
                {format(day.date, 'd')}
              </div>
            );
          })}
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="glass-panel p-6 lg:col-span-2 h-72">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary" />
            <h3 className="text-xl font-semibold">Weight Trend (Last 14 Logs)</h3>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="date" stroke="#A1A1AA" tick={{fontSize: 12}} />
              <YAxis stroke="#A1A1AA" domain={['auto', 'auto']} tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181A', border: '1px solid #27272A', borderRadius: '8px' }}
                itemStyle={{ color: '#4ADE80' }}
              />
              <Area type="monotone" dataKey="weight" stroke="#4ADE80" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
