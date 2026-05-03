import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, coreHabits } from './db/db';
import Background from './components/3d/Background';
import Header from './components/Header';
import HabitBoard from './components/HabitBoard';
import Analytics from './components/Analytics';
import Onboarding from './components/Onboarding';
import { Activity, Download, Upload } from 'lucide-react';

function App() {
  
  // ALL hooks MUST be at the top, before any conditional returns
  const [newHabit, setNewHabit] = useState('');
  const [editDaysStr, setEditDaysStr] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const profiles = useLiveQuery(() => db.profiles.toArray());
  const profile = profiles && profiles.length > 0 ? profiles[0] : null;
  const activeProfileId = profile?.id;

  const todayLog = useLiveQuery(
    () => activeProfileId ? db.dailyLogs.where({ profileId: activeProfileId, date: today }).first() : null,
    [activeProfileId, today]
  );

  const completedHabits = todayLog?.completedHabits || [];
  const allHabits = profile ? [
    ...coreHabits.filter(h => !(profile.deletedCoreHabits || []).includes(h.id)),
    ...(profile.customHabits || [])
  ] : [];
  const completionRatio = allHabits.length > 0 ? completedHabits.length / allHabits.length : 0;
  const currentStreak = profile ? profile.currentDay - 1 + (completionRatio === 1 ? 1 : 0) : 0; 

  const badges = [];
  if (currentStreak >= 7) badges.push('7-Day Streak 🔥');
  if (currentStreak >= 21) badges.push('Habit Builder 🧠');
  if (profile && profile.currentDay >= Math.floor(profile.totalDays / 2)) badges.push('Halfway There! ⛰️');
  if (completionRatio === 1) badges.push('Perfect Day 🌟');

  const handleToggleHabit = async (habitId) => {
    if (!profile) return;

    const currentCompleted = [...completedHabits];
    const index = currentCompleted.indexOf(habitId);

    if (index > -1) {
      currentCompleted.splice(index, 1);
    } else {
      currentCompleted.push(habitId);
    }

    if (todayLog) {
      await db.dailyLogs.update(todayLog.id, {
        completedHabits: currentCompleted
      });
    } else {
      await db.dailyLogs.add({
        profileId: profile.id,
        date: today,
        completedHabits: currentCompleted,
        weight: null,
        calories: null
      });
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!profile) return;
    
    if (habitId.startsWith('custom_')) {
      const updatedHabits = (profile.customHabits || []).filter(h => h.id !== habitId);
      await db.profiles.update(profile.id, { customHabits: updatedHabits });
    } else {
      const deletedCore = [...(profile.deletedCoreHabits || []), habitId];
      await db.profiles.update(profile.id, { deletedCoreHabits: deletedCore });
    }
  };

  const handleAddCustomHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.trim() || !profile) return;
    
    const habitId = `custom_${Date.now()}`;
    const newCustomHabit = { id: habitId, label: newHabit.trim() };
    const updatedHabits = [...(profile.customHabits || []), newCustomHabit];
    
    await db.profiles.update(profile.id, { customHabits: updatedHabits });
    setNewHabit('');
  };

  const handleUpdateTotalDays = async (e) => {
    e.preventDefault();
    if (!profile || !editDaysStr) return;
    const newTotal = parseInt(editDaysStr, 10);
    if (!isNaN(newTotal) && newTotal > 0 && newTotal <= 365) {
      await db.profiles.update(profile.id, { totalDays: newTotal });
      setEditDaysStr('');
    }
  };

  const handleExportData = async () => {
    const allProfiles = await db.profiles.toArray();
    const allLogs = await db.dailyLogs.toArray();
    const data = { profiles: allProfiles, dailyLogs: allLogs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trackit-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.profiles && data.dailyLogs) {
          await db.profiles.clear();
          await db.dailyLogs.clear();
          await db.profiles.bulkAdd(data.profiles);
          await db.dailyLogs.bulkAdd(data.dailyLogs);
          window.location.reload();
        } else {
          alert('Invalid backup format. Missing profiles or dailyLogs.');
        }
      } catch (err) {
        alert('Invalid backup file. Could not parse JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen relative">
      <Background completionRatio={activeProfileId ? completionRatio : 0} />
      
      {!profiles ? (
        <div className="text-textMain flex h-screen items-center justify-center relative z-10">Loading...</div>
      ) : profiles.length === 0 ? (
        <Onboarding />
      ) : profile ? (
        <div className="max-w-4xl mx-auto px-4 pb-12 pt-4 relative z-10 flex flex-col min-h-screen">
          <Header 
            profile={profile} 
            currentStreak={currentStreak} 
            completionRatio={completionRatio} 
            badges={badges}
          />

          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-primary" />
              <h2 className="text-2xl font-semibold">Daily Habits</h2>
            </div>
            <HabitBoard 
              allHabits={allHabits}
              completedHabits={completedHabits}
              onToggleHabit={handleToggleHabit}
              onDeleteHabit={handleDeleteHabit}
            />

            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <form onSubmit={handleAddCustomHabit} className="flex gap-2">
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  className="flex-1 bg-surfaceHighlight border border-white/10 rounded-lg px-4 py-2 text-textMain focus:outline-none focus:border-primary/50 text-sm"
                  placeholder="Add a new custom habit..."
                />
                <button
                  type="submit"
                  className="bg-primary/20 text-primary px-4 py-2 rounded-lg hover:bg-primary/30 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Add Habit
                </button>
              </form>
              
              <form onSubmit={handleUpdateTotalDays} className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={editDaysStr}
                  onChange={(e) => setEditDaysStr(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 bg-surfaceHighlight border border-white/10 rounded-lg px-4 py-2 text-textMain focus:outline-none focus:border-primary/50 text-sm"
                  placeholder={`Change Total Days (Current: ${profile.totalDays})`}
                />
                <button
                  type="submit"
                  className="bg-primary/20 text-primary px-4 py-2 rounded-lg hover:bg-primary/30 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Update Days
                </button>
              </form>
            </div>
          </div>

          <Analytics profile={profile} today={today} />
          
          <div className="mt-auto pt-16 text-center pb-8">
            <h3 className="text-textMuted uppercase tracking-wider text-xs font-bold mb-4">Data Management</h3>
            <div className="flex justify-center gap-4">
              <button 
                onClick={handleExportData} 
                className="flex items-center gap-2 text-xs bg-surfaceHighlight hover:bg-white/10 px-4 py-2 rounded-lg text-textMuted transition-colors"
              >
                <Download size={14} /> Export Backup
              </button>
              <label className="flex items-center gap-2 text-xs bg-surfaceHighlight hover:bg-white/10 px-4 py-2 rounded-lg text-textMuted transition-colors cursor-pointer">
                <Upload size={14} /> Import Backup
                <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
              </label>
            </div>
            <p className="text-[10px] text-textMuted mt-4 opacity-50">Local data only. Clearing your browser data will delete your progress without a backup.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
