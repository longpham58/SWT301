import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clearToken, clearUser, getUser } from '../utils/auth.storage';
import { ScheduleProvider } from '../contexts/ScheduleContext';
import '../styles/dashboard.css';

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUsername(user.username);
      setFullName(user.name);
    }
  }, []);

  const handleLogout = () => {
    clearToken();
    clearUser();
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="sidebar-lang">
          <button
            type="button"
            className={i18n.language === 'vi' ? 'lang-btn active' : 'lang-btn'}
            onClick={() => { i18n.changeLanguage('vi'); document.documentElement.lang = 'vi'; }}
            aria-label={t('dashboard.langVi')}
          >
            VI
          </button>
          <button
            type="button"
            className={i18n.language === 'en' ? 'lang-btn active' : 'lang-btn'}
            onClick={() => { i18n.changeLanguage('en'); document.documentElement.lang = 'en'; }}
            aria-label={t('dashboard.langEn')}
          >
            EN
          </button>
        </div>
        <button onClick={handleLogout} className="sidebar-logout">
          {t('dashboard.logout')}
        </button>
        <div className="sidebar-profile">
          <div className="profile-avatar">👤</div>
          <div className="profile-info">
            <span className="profile-name">{fullName || t('dashboard.accountExaminer')}</span>
            <span className="profile-user">@{username}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            {t('dashboard.overview')}
          </NavLink>
          <NavLink
            to="/dashboard/account-examiner"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            {t('dashboard.accountExaminerNav')}
          </NavLink>
          <NavLink
            to="/dashboard/students"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            {t('dashboard.studentListNav')}
          </NavLink>
          <NavLink
            to="/dashboard/rooms"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            {t('dashboard.roomManagerNav')}
          </NavLink>
          <NavLink
            to="/dashboard/setup-exam"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            {t('dashboard.setupExamNav')}
          </NavLink>
          <NavLink
            to="/dashboard/exam-schedule"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            {t('dashboard.examScheduleNav')}
          </NavLink>
          <NavLink
            to="/dashboard/manage-score"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            {t('dashboard.manageScoreNav')}
          </NavLink>
        </nav>
      </aside>

      <main className="dashboard-main">
        <ScheduleProvider>
          <Outlet />
        </ScheduleProvider>
      </main>
    </div>
  );
}
