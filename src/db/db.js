import Dexie from 'dexie';

export const db = new Dexie('TrackitDB');

db.version(1).stores({
  profiles: '++id, name, totalDays, currentDay, startDate, isHardcoreMode',
  dailyLogs: '++id, [profileId+date], profileId, date, completedHabits, weight, calories',
});

db.version(2).stores({
  profiles: '++id, name, username, password, totalDays, currentDay, startDate, isHardcoreMode',
  dailyLogs: '++id, [profileId+date], profileId, date, completedHabits, weight, calories',
});


export const coreHabits = [
  { id: 'sleep', label: '7-8 Hours Sleep' },
  { id: 'gym', label: '75 Min Gym' },
  { id: 'walk', label: '20 Min Walk After Dinner' },
  { id: 'no_junk', label: 'No Packaged Junk Food' },
  { id: 'water', label: '1 Gallon Water' },
  { id: 'no_swiggy', label: 'No Restaurant Food' },
  { id: 'no_sugar', label: 'No Sugar' },
  { id: 'no_tea_coffee', label: 'No Tea/Coffee' },
];
