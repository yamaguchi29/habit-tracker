import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError('メールアドレスまたはパスワードが間違っています。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'ログイン' : '新規登録'}</h2>
        <p className="auth-subtitle">
          {isLogin ? '習慣トラッカーにおかえりなさい！' : '新しい習慣を始めましょう！'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '処理中...' : (isLogin ? 'ログイン' : '登録する')}
          </button>
        </form>

        <div className="auth-switch">
          <span>{isLogin ? 'アカウントをお持ちでないですか？' : 'すでにアカウントをお持ちですか？'}</span>
          <button type="button" className="switch-btn" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? '新規登録' : 'ログイン'}
          </button>
        </div>
      </div>
    </div>
  );
}
