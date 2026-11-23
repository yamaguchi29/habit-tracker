import { Home, BarChart2, Calendar, User, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <div className="nav-items">
        <button 
          className={`nav-item ${isActive('/') ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <Home size={24} />
        </button>
        
        <button 
          className={`nav-item ${isActive('/stats') ? 'active' : ''}`}
          onClick={() => navigate('/stats')}
        >
          <BarChart2 size={24} />
        </button>

        <div className="fab-placeholder"></div>

        <button 
          className={`nav-item ${isActive('/calendar') ? 'active' : ''}`}
          onClick={() => navigate('/calendar')}
        >
          <Calendar size={24} />
        </button>

        <button 
          className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          <User size={24} />
        </button>
      </div>

      <button className="fab" onClick={() => navigate('/add')}>
        <Plus size={32} />
      </button>
    </nav>
  );
}
