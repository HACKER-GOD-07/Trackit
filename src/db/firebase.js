import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBS-UCCepUkd9e6tCByoSUs4U2QXIJMH3s",
  authDomain: "trackit-app-d8a9d.firebaseapp.com",
  projectId: "trackit-app-d8a9d",
  storageBucket: "trackit-app-d8a9d.firebasestorage.app",
  messagingSenderId: "1013279493309",
  appId: "1:1013279493309:web:58069ea3172dc4704dfbd4",
  measurementId: "G-74KDX3DJ86"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);

/**
 * Sync a user profile to Firestore.
 * Uses a unique device ID so each device/user gets their own document.
 */
export async function syncProfileToCloud(profile) {
  try {
    const deviceId = getOrCreateDeviceId();
    const docRef = doc(firestore, 'users', deviceId);

    await setDoc(docRef, {
      name: profile.name || '',
      gender: profile.gender || '',
      age: profile.age || null,
      height: profile.height || null,
      weight: profile.weight || null,
      targetCalories: profile.targetCalories || null,
      totalDays: profile.totalDays || 75,
      currentDay: profile.currentDay || 1,
      startDate: profile.startDate || '',
      isHardcoreMode: profile.isHardcoreMode ?? true,
      lastSyncedAt: serverTimestamp(),
      deviceId,
    }, { merge: true });

    console.log('[Trackit] Profile synced to cloud ✅');
  } catch (err) {
    // Silently fail — the app works offline-first, cloud sync is a bonus
    console.warn('[Trackit] Cloud sync failed (offline?):', err.message);
  }
}

/**
 * Sync a daily log entry to Firestore.
 */
export async function syncDailyLogToCloud(profileId, logData) {
  try {
    const deviceId = getOrCreateDeviceId();
    const docId = `${deviceId}_${logData.date}`;
    const docRef = doc(firestore, 'dailyLogs', docId);

    await setDoc(docRef, {
      deviceId,
      profileId,
      date: logData.date,
      completedHabits: logData.completedHabits || [],
      weight: logData.weight || null,
      calories: logData.calories || null,
      lastSyncedAt: serverTimestamp(),
    }, { merge: true });

    console.log(`[Trackit] Daily log ${logData.date} synced ✅`);
  } catch (err) {
    console.warn('[Trackit] Daily log sync failed (offline?):', err.message);
  }
}

/**
 * Generate or retrieve a persistent device identifier.
 * This ensures each user/device gets a unique document in Firestore.
 */
function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem('trackit_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('trackit_device_id', deviceId);
  }
  return deviceId;
}
