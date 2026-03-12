import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/login.css';
import { verifyUsernameForReset, resetPassword } from '../utils/api';

type ForgotPasswordStep = 'username' | 'reset';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>('username');
  const [forgotUsername, setForgotUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleVerifyUsername = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      if (!forgotUsername) {
        throw new Error(t('forgotPassword.pleaseEnterUsername'));
      }
      await verifyUsernameForReset(forgotUsername);
      setForgotSuccess(t('forgotPassword.usernameValid'));
      setTimeout(() => {
        setForgotStep('reset');
        setForgotSuccess('');
      }, 1500);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message)
          : t('forgotPassword.verifyError');
      setForgotError(message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      if (!newPassword || !confirmPassword) {
        throw new Error(t('forgotPassword.pleaseEnterPassword'));
      }
      if (newPassword !== confirmPassword) {
        throw new Error(t('forgotPassword.passwordMismatch'));
      }
      if (newPassword.length < 6) {
        throw new Error(t('forgotPassword.passwordMinLength'));
      }
      await resetPassword(forgotUsername, newPassword);
      setForgotSuccess(t('forgotPassword.passwordSuccess'));
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message)
          : t('forgotPassword.resetError');
      setForgotError(message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
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
          {forgotStep === 'username' && (
            <form className="login-form" onSubmit={handleVerifyUsername}>
              <header className="form-header">
                <h2>{t('forgotPassword.title')}</h2>
                <p>{t('forgotPassword.subtitle')}</p>
              </header>

              <div className="form-group">
                <label className="form-label" htmlFor="forgot-username">
                  {t('forgotPassword.username')}
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
                    id="forgot-username"
                    type="text"
                    placeholder={t('forgotPassword.usernamePlaceholder')}
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    disabled={forgotLoading}
                    autoFocus
                  />
                </div>
              </div>

              {forgotError && <div className="form-error">{forgotError}</div>}
              {forgotSuccess && <div className="form-success">{forgotSuccess}</div>}

              <button className="login-button" type="submit" disabled={forgotLoading}>
                {forgotLoading ? t('forgotPassword.checking') : t('forgotPassword.continue')}
              </button>

              <div className="form-row">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={handleBackToLogin}
                  style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                >
                  {t('common.backToLogin')}
                </button>
              </div>
            </form>
          )}

          {forgotStep === 'reset' && (
            <form className="login-form" onSubmit={handleResetPasswordSubmit}>
              <header className="form-header">
                <h2>{t('forgotPassword.newPasswordTitle')}</h2>
                <p>{t('forgotPassword.newPasswordSubtitle')}</p>
              </header>

              <div className="form-group">
                <label className="form-label" htmlFor="new-password">
                  {t('forgotPassword.newPassword')}
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
                    id="new-password"
                    type="password"
                    placeholder={t('forgotPassword.newPasswordPlaceholder')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={forgotLoading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">
                  {t('forgotPassword.confirmPassword')}
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
                    id="confirm-password"
                    type="password"
                    placeholder={t('forgotPassword.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={forgotLoading}
                  />
                </div>
              </div>

              {forgotError && <div className="form-error">{forgotError}</div>}
              {forgotSuccess && <div className="form-success">{forgotSuccess}</div>}

              <button className="login-button" type="submit" disabled={forgotLoading}>
                {forgotLoading ? t('forgotPassword.updating') : t('forgotPassword.setPassword')}
              </button>

              <div className="form-row">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => {
                    setForgotStep('username');
                    setForgotUsername('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setForgotError('');
                  }}
                  style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                >
                  {t('forgotPassword.backToUsername')}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
