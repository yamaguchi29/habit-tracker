import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddHabit } from './pages/AddHabit';
import { Stats } from './pages/Stats';
import { CalendarPage } from './pages/CalendarPage';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationManager } from './components/NotificationManager';

function App() {
  return (
    <AuthProvider>
      <NotificationManager />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="stats" element={<Stats />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="add" element={<AddHabit />} />
            <Route path="edit/:id" element={<AddHabit />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
