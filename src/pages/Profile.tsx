import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Bell } from 'lucide-react';
import { requestNotificationPermission } from '../components/NotificationManager';
import './Profile.css';

export function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleEnableNotifications = async () => {
    if (!user) return;
    const success = await requestNotificationPermission(user.uid);
    if (success) {
      alert('通知が有効になりました！');
    } else {
      alert('通知を有効にできませんでした。ブラウザの設定で通知が許可されているか確認してください。');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="user-avatar-container">
          <User size={48} strokeWidth={1.5} />
        </div>
        
        <div className="user-info">
          <p className="user-email-label">メールアドレス</p>
          <p className="user-email">{user?.email}</p>
        </div>

        <div className="notification-section">
          <h3>通知設定</h3>
          <p>スマホで通知を受け取るには、以下のボタンを押して許可してください。<br/>※iPhoneの場合は「ホーム画面に追加」してから設定してください。</p>
          <button onClick={handleEnableNotifications} className="notification-btn">
            <Bell size={18} />
            通知を有効にする
          </button>
        </div>

        <div className="profile-actions">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}


