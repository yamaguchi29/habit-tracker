import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import './Header.css';

export function Header() {
  const now = new Date();
  
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="header-date">
          {format(now, 'MMMM d日 (eeee)', { locale: ja })}
        </h1>
      </div>
    </header>
  );
}
