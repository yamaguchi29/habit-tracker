import { useRef, useEffect } from 'react';
import { format, addDays, subDays, startOfToday, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import './DateSelector.css';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const today = startOfToday();
  const dates = Array.from({ length: 14 }, (_, i) => addDays(subDays(today, 7), i));
  const todayRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Enable mouse wheel scrolling horizontally
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    // Delay slightly to ensure DOM is ready and styles applied
    const timer = setTimeout(() => {
      if (todayRef.current) {
        todayRef.current.scrollIntoView({
          behavior: 'auto',
          inline: 'center',
          block: 'nearest'
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []); // Run once on mount

  return (
    <div className="date-selector" ref={containerRef}>
      <div className="date-scroll">
        {dates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isSameDay(date, today);
          
          return (
            <button
              key={date.toISOString()}
              ref={isTodayDate ? todayRef : null}
              className={`date-item ${isSelected ? 'active' : ''} ${isTodayDate ? 'is-today' : ''}`}
              onClick={() => onDateChange(date)}
            >
              <span className="date-day-name">{format(date, 'eee', { locale: ja })}</span>
              <span className="date-day-number">{format(date, 'd')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
