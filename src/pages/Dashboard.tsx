import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, Circle, Edit2, Activity, Coffee, Moon, BookOpen, Music, Code, Dumbbell, Heart } from 'lucide-react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { format, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ja } from 'date-fns/locale';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { DateSelector } from '../components/DateSelector';
import { isHabitActiveOnDate } from '../utils/habitUtils';
import './Dashboard.css';

interface Habit {
  id: string;
  userId: string;
  title: string;
  completedDates: string[]; // Format: 'YYYY-MM-DD'
  createdAt: any;
  reminderTime?: string | null;
  daysOfWeek?: number[]; // [0-6] where 0 is Sunday
  icon?: string;
}

const ICON_MAP: { [key: string]: any } = {
  Activity, Coffee, Moon, BookOpen, Music, Code, Dumbbell, Heart
};

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayOfWeek = selectedDate.getDay();

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Habit[];
      // Filter by day of week and creation date context
      const filtered = habitData.filter(h => isHabitActiveOnDate(h, selectedDate));
      
      // Sort by reminder time (All-day first, then by time)
      const sorted = filtered.sort((a, b) => {
        if (!a.reminderTime) return -1;
        if (!b.reminderTime) return 1;
        return a.reminderTime.localeCompare(b.reminderTime);
      });

      setHabits(sorted);
    });
    return unsubscribe;
  }, [user, selectedDayOfWeek]);

  const toggleHabit = async (habit: Habit) => {
    try {
      const isCompleted = habit.completedDates.includes(selectedDateStr);
      let newDates = [...habit.completedDates];

      if (isCompleted) {
        newDates = newDates.filter(d => d !== selectedDateStr);
      } else {
        newDates.push(selectedDateStr);
        if (isSameDay(selectedDate, new Date())) {
          // Mega Celebration!
          // Burst 1: Main center
          confetti({
            particleCount: 300,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#0d9488', '#2dd4bf', '#ccfbf1', '#ffffff']
          });
          
          // Burst 2: Left/Right side slightly later
          setTimeout(() => {
            confetti({
              particleCount: 200,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.7 },
              colors: ['#0d9488', '#5eead4']
            });
            confetti({
              particleCount: 200,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.7 },
              colors: ['#0d9488', '#5eead4']
            });
          }, 200);

          // Final burst: High up
          setTimeout(() => {
            confetti({
              particleCount: 200,
              spread: 150,
              origin: { y: 0.5 },
              colors: ['#2dd4bf', '#ffffff', '#ccfbf1']
            });
          }, 400);
        }
      }

      await updateDoc(doc(db, 'habits', habit.id), {
        completedDates: newDates
      });
    } catch (error) {
      console.error('Error toggling habit', error);
    }
  };

  return (
    <div className="dashboard-content">
      <DateSelector 
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate} 
      />

      <div className="section-header">
        <h2>{format(selectedDate, 'EEEE', { locale: ja })}の習慣</h2>
      </div>

      <div className="habit-grid">
        {habits.map(habit => {
          const isDone = habit.completedDates.includes(selectedDateStr);
          const IconComponent = ICON_MAP[habit.icon || 'Activity'] || Activity;
          
          return (
            <div 
              key={habit.id} 
              className={`habit-grid-card ${isDone ? 'done' : ''}`}
              onClick={() => toggleHabit(habit)}
            >
              <div className="card-top">
                <div className="habit-icon-wrapper">
                  <IconComponent size={24} />
                </div>
                <div className="card-actions">
                  <button 
                    className="edit-habit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit/${habit.id}`);
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  {isDone ? (
                    <CheckCircle size={24} className="check-icon active" />
                  ) : (
                    <Circle size={24} className="check-icon" />
                  )}
                </div>
              </div>
              <div className="card-bottom">
                <span className="habit-grid-title">{habit.title}</span>
                <span className="habit-grid-time">
                  {habit.reminderTime || '終日'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="empty-state">
          <p>この日の習慣はありません。</p>
        </div>
      )}

      {/* 画面下部の見切れ防止用スペーサー（タスク1つ分の高さ＋余白） */}
      <div style={{ height: '160px', flexShrink: 0, width: '100%' }} />
    </div>
  );
}
