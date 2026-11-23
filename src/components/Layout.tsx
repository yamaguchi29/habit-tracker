import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
        <div className="main-content-spacer" />
      </main>
      <BottomNav />
    </div>
  );
}
