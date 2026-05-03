import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowRight } from 'lucide-react';
import { db } from '../db/db';

export default function Onboarding() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');

  const calculateCalories = (weightKgVal, heightCmVal, ageVal, genderVal) => {
    if (!weightKgVal || !heightCmVal || !ageVal) return 2000;
    let bmr = 10 * weightKgVal + 6.25 * heightCmVal - 5 * ageVal;
    bmr += (genderVal === 'male' ? 5 : -161);
    return Math.round(bmr * 1.55);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !age || !height || !weight) {
      setError('Please fill in all fields');
      return;
    }

    const heightCmVal = parseInt(height, 10);
    const weightKgVal = parseFloat(weight);
    const ageVal = parseInt(age, 10);

    if (heightCmVal <= 0 || weightKgVal <= 0 || ageVal <= 0) {
      setError('Height, weight, and age must be valid positive values');
      return;
    }

    const targetCalories = calculateCalories(weightKgVal, heightCmVal, ageVal, gender);
    const today = new Date().toISOString().split('T')[0];

    try {
      await db.profiles.add({
        name: name.trim(),
        username: name.trim().toLowerCase().replace(/\s+/g, ''),
        password: '',
        gender,
        age: ageVal,
        height: heightCmVal,
        weight: weightKgVal,
        totalDays: 75,
        currentDay: 1,
        startDate: today,
        isHardcoreMode: true,
        targetCalories,
        customHabits: []
      });
    } catch (err) {
      console.error('Failed to create profile', err);
      setError('Something went wrong. Please try again.');
    }
  };

  const inputClass = "w-full bg-surfaceHighlight border border-white/10 rounded-lg px-4 py-2.5 text-textMain focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/50"
          >
            <Activity className="text-primary w-10 h-10" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-black tracking-tight text-textMain"
          >
            TRACKIT
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-textMuted mt-2"
          >
            Forge discipline. Track progress.
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-8"
        >
          <h2 className="text-xl font-bold text-textMain mb-6 text-center">Set Up Your Profile</h2>
          
          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 border border-red-500/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-textMuted mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Saimantika Ghoshal"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={inputClass + " appearance-none"}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Age (years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={inputClass}
                  placeholder="25"
                  min="1"
                  max="120"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={inputClass}
                  placeholder="175"
                  min="50"
                  max="300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={inputClass}
                  placeholder="70.5"
                  min="20"
                  max="500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-background font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors mt-6"
            >
              Start Tracking
              <ArrowRight size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
