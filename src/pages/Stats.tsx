import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { format, subDays, subMonths, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { isHabitActiveOnDate } from '../utils/habitUtils';
import './Stats.css';

interface Habit {
  id: string;
  completedDates: string[];
  daysOfWeek?: number[];
  createdAt?: any;
}

type Range = '7d' | '1m' | '1y';

export function Stats() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [range, setRange] = useState<Range>('7d');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Habit);
      setHabits(data);
      updateChartData(data, range);
    });
    return unsubscribe;
  }, [user, range]);

  const updateChartData = (data: Habit[], currentRange: Range) => {
    let stats: any[] = [];

    if (currentRange === '7d' || currentRange === '1m') {
      const days = currentRange === '7d' ? 6 : 29;
      const interval = eachDayOfInterval({
        start: subDays(new Date(), days),
        end: new Date()
      });

      stats = interval.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        // その日にやるべき習慣の数
        const assigned = data.filter(h => isHabitActiveOnDate(h, date)).length;
        const completedCount = data.reduce((acc, h) => acc + (h.completedDates.includes(dateStr) ? 1 : 0), 0);
        
        return {
          label: format(date, currentRange === '7d' ? 'd(E)' : 'MM/dd', { locale: ja }),
          count: completedCount,
          assigned: assigned // ツールチップで使用可能
        };
      });
    } else {
      // 1 year (monthly aggregation)
      const months = eachMonthOfInterval({
        start: subMonths(new Date(), 11),
        end: new Date()
      });

      stats = months.map(month => {
        const monthStr = format(month, 'yyyy-MM');
        const count = data.reduce((acc, h) => 
          acc + h.completedDates.filter(d => d.startsWith(monthStr)).length, 0
        );
        return {
          label: format(month, 'M月', { locale: ja }),
          count
        };
      });
    }
    setChartData(stats);
  };

  const totalCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0);

  return (
    <div className="stats-container">
      <div className="stats-summary">
        <div className="summary-card">
          <span className="summary-label">総達成回数</span>
          <span className="summary-value">{totalCompletions}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">登録習慣</span>
          <span className="summary-value">{habits.length}</span>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <h3>達成傾向</h3>
          <div className="range-tabs">
            <button 
              className={`range-tab ${range === '7d' ? 'active' : ''}`}
              onClick={() => setRange('7d')}
            >7日</button>
            <button 
              className={`range-tab ${range === '1m' ? 'active' : ''}`}
              onClick={() => setRange('1m')}
            >1月</button>
            <button 
              className={`range-tab ${range === '1y' ? 'active' : ''}`}
              onClick={() => setRange('1y')}
            >1年</button>
          </div>
        </div>

        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            {range === '1y' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="var(--primary-color)" 
                  strokeWidth={3} 
                  dot={{ r: radius_for_dots(range), fill: 'var(--primary-color)', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 画面下部の見切れ防止用スペーサー */}
      <div style={{ height: '160px', flexShrink: 0, width: '100%' }} />
    </div>
  );
}

function radius_for_dots(range: Range) {
  if (range === '1m') return 2;
  return 4;
}

