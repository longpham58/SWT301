import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/login.css';
import { login } from '../utils/api';
import { setToken, setUser } from '../utils/auth.storage';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberAccount, setRememberAccount] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await login(username, password);
      setToken(response.accessToken, rememberAccount);
      setUser(response.user, rememberAccount);
      console.log({ username, password, rememberAccount, rememberDevice });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message)
          : t('login.loginFailed');
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="welcome-card" aria-hidden="true">
          <div className="welcome-content">
            <div className="welcome-text">
              <h1>{t('login.welcomeTitle')}</h1>
              <p>{t('login.welcomeSubtitle')}</p>
            </div>

          </div>
        </section>

        <section className="login-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <header className="form-header">
              <h2>{t('login.signIn')}</h2>
              <p>{t('login.signInSubtitle')}</p>
            </header>

            <div className="form-group">
              <label className="form-label" htmlFor="username">
                {t('login.username')}
              </label>
              <div className="input-field">
                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                    <path
                      d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.33 0-8 1.67-8 5v1h16v-1c0-3.33-4.67-5-8-5z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  id="username"
                  type="text"
                  placeholder={t('login.username')}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                {t('login.password')}
              </label>
              <div className="input-field">
                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                    <path
                      d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-7-2a2 2 0 0 1 4 0v2h-4z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.password')}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                >
                  {showPassword ? t('common.hide') : t('common.show')}
                </button>
              </div>
            </div>

            <div className="form-row">
              <a 
                className="forgot-link" 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  navigate('/login/forgot');
                }}
              >
                {t('login.forgotPassword')}
              </a>
            </div>

            {errorMessage && <div className="form-error">{errorMessage}</div>}

            <div className="checkbox-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={rememberAccount}
                  onChange={(event) => setRememberAccount(event.target.checked)}
                  disabled={isLoading}
                />
                <span>{t('login.rememberAccount')}</span>
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(event) => setRememberDevice(event.target.checked)}
                  disabled={isLoading}
                />
                <span>{t('login.rememberDevice')}</span>
              </label>
            </div>

            <button className="login-button" type="submit" disabled={isLoading}>
              {isLoading ? t('login.signingIn') : t('login.signInButton')}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
