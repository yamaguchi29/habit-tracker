import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './HabitCalendar.css';

interface HabitCalendarProps {
  completedDates: string[]; // Format 'YYYY-MM-DD'
}

export function HabitCalendar({ completedDates }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 1日の曜日を取得 (0: 日曜日, 1: 月曜日 ...)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // 月の最終日を取得
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysPrefix = Array.from({ length: firstDayOfMonth }, (_, _i) => null);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isCompleted = (day: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return completedDates.includes(dStr);
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  return (
    <div className="habit-calendar" onClick={(e) => e.stopPropagation()}>
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="cal-nav-btn"><ChevronLeft size={20} /></button>
        <span className="cal-month-title">{year}年 {month + 1}月</span>
        <button onClick={handleNextMonth} className="cal-nav-btn"><ChevronRight size={20} /></button>
      </div>
      
      <div className="calendar-grid weekdays">
        <div>日</div><div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div>
      </div>

      <div className="calendar-grid days">
        {daysPrefix.map((_, i) => (
          <div key={`empty-${i}`} className="cal-day empty" />
        ))}
        {daysArray.map((day) => {
          const done = isCompleted(day);
          const today = isToday(day);
          return (
            <div key={day} className={`cal-day ${done ? 'completed-day' : ''} ${today ? 'today' : ''}`}>
              <span>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
