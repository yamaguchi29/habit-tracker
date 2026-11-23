import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ChevronLeft, Activity, Coffee, Moon, BookOpen, Music, Code, Dumbbell, Heart, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './AddHabit.css';

const ICONS = [
  { name: 'Activity', icon: Activity },
  { name: 'Coffee', icon: Coffee },
  { name: 'Moon', icon: Moon },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Music', icon: Music },
  { name: 'Code', icon: Code },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Heart', icon: Heart }
];

const DAYS = [
  { label: '月', value: 1 },
  { label: '火', value: 2 },
  { label: '水', value: 3 },
  { label: '木', value: 4 },
  { label: '金', value: 5 },
  { label: '土', value: 6 },
  { label: '日', value: 0 }
];

export function AddHabit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [title, setTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [selectedIcon, setSelectedIcon] = useState('Activity');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHabit = async () => {
      if (!id || !user) return;
      try {
        const docRef = doc(db, 'habits', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title);
          setReminderTime(data.reminderTime || '');
          setSelectedDays(data.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
          setSelectedIcon(data.icon || 'Activity');
        }
      } catch (error) {
        console.error('Error fetching habit', error);
      }
    };
    fetchHabit();
  }, [id, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;
    setLoading(true);

    try {
      if (id) {
        await updateDoc(doc(db, 'habits', id), {
          title: title.trim(),
          reminderTime: reminderTime || null,
          daysOfWeek: selectedDays,
          icon: selectedIcon
        });
      } else {
        await addDoc(collection(db, 'habits'), {
          userId: user.uid,
          title: title.trim(),
          completedDates: [],
          createdAt: serverTimestamp(),
          reminderTime: reminderTime || null,
          daysOfWeek: selectedDays,
          icon: selectedIcon
        });
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving habit', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('この習慣を削除してもよろしいですか？')) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'habits', id), {
        deletedAt: serverTimestamp()
      });
      navigate('/');
    } catch (error) {
      console.error('Error deleting habit', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="add-habit-page">
      <header className="add-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1>{id ? '習慣を編集' : '新しく追加'}</h1>
      </header>

      <form onSubmit={handleSave} className="add-form">
        <div className="form-section">
          <label>習慣の名前</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            placeholder="例: 早起き、読書など"
            className="text-input"
            required
            autoFocus
          />
        </div>

        <div className="form-section">
          <label>リマインダー時間 (オプション)</label>
          <input 
            type="time" 
            value={reminderTime} 
            onChange={e => setReminderTime(e.target.value)}
            className="text-input"
          />
        </div>

        <div className="form-section">
          <label>実施する曜日</label>
          <div className="days-selector">
            {DAYS.map(day => (
              <button
                key={day.value}
                type="button"
                className={`day-btn ${selectedDays.includes(day.value) ? 'active' : ''}`}
                onClick={() => toggleDay(day.value)}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label>アイコンを選択</label>
          <div className="icon-selector">
            {ICONS.map(item => (
              <button
                key={item.name}
                type="button"
                className={`icon-btn ${selectedIcon === item.name ? 'active' : ''}`}
                onClick={() => setSelectedIcon(item.name)}
              >
                <item.icon size={24} />
              </button>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-submit-btn" disabled={loading}>
            {loading ? '保存中...' : '保存する'}
          </button>
          
          {id && (
            <button 
              type="button" 
              className="delete-btn" 
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 size={18} />
              この習慣を削除
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

