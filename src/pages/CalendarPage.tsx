import { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isToday, 
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { isHabitActiveOnDate } from '../utils/habitUtils';
import './CalendarPage.css';

interface Habit {
  id: string;
  completedDates: string[];
  daysOfWeek?: number[];
  createdAt?: any;
}

export function CalendarPage() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Habit);
      setHabits(data);
    });
    return unsubscribe;
  }, [user]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Empty slots for the first week
  const startDay = getDay(monthStart);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const getHeatmapColor = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // 現在の月に属さない日は色を付けない
    if (!isSameMonth(date, monthStart)) return 'hidden';

    // 登録前や指定曜日以外の習慣を除外
    const activeHabits = habits.filter(h => isHabitActiveOnDate(h, date));
    if (activeHabits.length === 0) return 'level-0';

    const completedCount = activeHabits.filter(h => h.completedDates.includes(dateStr)).length;
    const ratio = completedCount / activeHabits.length;

    if (ratio === 0) return 'level-0';
    if (ratio <= 0.4) return 'level-1';
    if (ratio < 1) return 'level-2';
    return 'level-3';
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft size={24} />
        </button>
        <h2>{format(currentMonth, 'yyyy年 M月', { locale: ja })}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="calendar-grid">
        {['日', '月', '火', '水', '木', '金', '土'].map(d => (
          <div key={d} className="weekday-label">{d}</div>
        ))}
        
        {blanks.map(i => <div key={`blank-${i}`} className="calendar-day blank" />)}
        
        {dateRange.map(date => (
          <div 
            key={date.toISOString()} 
            className={`calendar-day ${getHeatmapColor(date)} ${isToday(date) ? 'today' : ''}`}
          >
            <span className="day-number">{format(date, 'd')}</span>
          </div>
        ))}
      </div>

      <div className="calendar-legend">
        <span>達成度: 0%</span>
        <div className="legend-item level-0" title="0%" />
        <div className="legend-item level-1" title="1-40%" />
        <div className="legend-item level-2" title="41-99%" />
        <div className="legend-item level-3" title="100%" />
        <span>100%</span>
      </div>

      {/* 画面下部の見切れ防止用スペーサー */}
      <div style={{ height: '160px', flexShrink: 0, width: '100%' }} />
    </div>
  );
}
