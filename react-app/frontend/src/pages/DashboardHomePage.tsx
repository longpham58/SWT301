import { useTranslation } from 'react-i18next';
import '../styles/dashboard.css';

export function DashboardHomePage() {
  const { t } = useTranslation();
  return (
    <div className="overview-page">
      <header className="overview-header">
        <div>
          <h1 className="overview-title">{t('overview.title')}</h1>
          <p className="overview-subtitle">
            {t('overview.subtitle')}
          </p>
        </div>
      </header>

      <section className="overview-metrics" aria-label={t('overview.title')}>
        <article className="metric-card metric-exam">
          <div className="metric-label">{t('overview.todayExams')}</div>
          <div className="metric-value">1</div>
          <div className="metric-desc">{t('overview.todayExamDesc')}</div>
        </article>
        <article className="metric-card metric-students">
          <div className="metric-label">{t('overview.studentsExam')}</div>
          <div className="metric-value">45</div>
          <div className="metric-desc">{t('overview.studentsExamDesc')}</div>
        </article>
        <article className="metric-card metric-rooms">
          <div className="metric-label">{t('overview.roomsActive')}</div>
          <div className="metric-value">5/7</div>
          <div className="metric-desc">{t('overview.roomsActiveDesc')}</div>
        </article>
        <article className="metric-card metric-finished">
          <div className="metric-label">{t('overview.finished')}</div>
          <div className="metric-value">18/45</div>
          <div className="metric-desc">{t('overview.finishedDesc')}</div>
        </article>
      </section>

      <div className="overview-layout">
        <section className="overview-left">
          <header className="section-header">
            <h2>{t('overview.liveRooms')}</h2>
            <button type="button" className="link-button">
              {t('overview.viewAll')}
            </button>
          </header>

          <div className="room-grid">
            {ROOMS.map((room) => (
              <article key={room.id} className="room-card">
                <div className="room-card-header">
                  <span className={`room-status room-status-${room.statusType}`}>
                    {room.statusType === 'running' ? t('overview.inProgress') : t('overview.waitingStudent')}
                  </span>
                  <span className="room-slot">{t('overview.slot')} {room.slot}</span>
                </div>
                <div className="room-card-body">
                  <h3 className="room-name">{t(room.nameKey)}</h3>
                  <p className="room-subject">{t(room.subjectKey)}</p>
                  <div className="room-examiner">
                    <span className="room-examiner-icon" aria-hidden="true">
                      👤
                    </span>
                    <span className="room-examiner-name">{room.examiner === 'Chưa phân công' ? t('overview.notAssigned') : room.examiner}</span>
                  </div>
                </div>
                <footer className="room-card-footer">
                  <span className="room-time">{room.time}</span>
                </footer>
              </article>
            ))}
          </div>
        </section>

        <aside className="overview-right">
          <section className="time-control-card">
            <header className="section-header">
              <h2>{t('overview.timeControl')}</h2>
            </header>
            <div className="time-control-body">
              <div className="time-circle" aria-label={t('overview.timeControl')}>
                <div className="time-circle-inner">
                  <span className="time-main">00:30</span>
                  <span className="time-sub">{t('overview.ready')}</span>
                </div>
              </div>
              <button type="button" className="primary-button full-width">
                {t('overview.startSlot')}
              </button>
              <div className="time-meta">
                <span>{t('overview.slotMeta')}</span>
                <span>{t('overview.waitTimeMeta')}</span>
              </div>
            </div>
          </section>

          <section className="recent-exams-card">
            <header className="section-header">
              <h2>{t('overview.recentExams')}</h2>
            </header>
            <ul className="recent-exams-list">
              <li>
                <div className="recent-exam-title">{t('overview.todayExamDesc')}</div>
                <div className="recent-exam-meta">
                  <span>14/01/2026 · {t('overview.slotMorning')}</span>
                  <span className="tag tag-success">{t('overview.completed')}</span>
                </div>
              </li>
              <li>
                <div className="recent-exam-title">{t('overview.sampleExamTitle')}</div>
                <div className="recent-exam-meta">
                  <span>10/01/2026 · {t('overview.slotAfternoon')}</span>
                  <span className="tag tag-info">{t('overview.grading')}</span>
                </div>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

const ROOMS = [
  { id: 1, statusType: 'running' as const, slot: 1, nameKey: 'overview.room1' as const, subjectKey: 'overview.roomSubjectHeart' as const, examiner: 'Nguyễn Văn A', time: '05:32', count: 7 },
  { id: 2, statusType: 'running' as const, slot: 2, nameKey: 'overview.room2' as const, subjectKey: 'overview.roomSubjectLung' as const, examiner: 'Trần Thị B', time: '03:18', count: 6 },
  { id: 3, statusType: 'waiting' as const, slot: 3, nameKey: 'overview.room3' as const, subjectKey: 'overview.roomSubjectAbdomen' as const, examiner: 'Chưa phân công', time: '00:00', count: 0 },
  { id: 4, statusType: 'running' as const, slot: 4, nameKey: 'overview.room4' as const, subjectKey: 'overview.roomSubjectInjection' as const, examiner: 'Lê Văn C', time: '07:22', count: 7 },
  { id: 5, statusType: 'running' as const, slot: 5, nameKey: 'overview.room5' as const, subjectKey: 'overview.roomSubjectResuscitation' as const, examiner: 'Phạm Thị D', time: '01:05', count: 5 },
  { id: 6, statusType: 'waiting' as const, slot: 6, nameKey: 'overview.room6' as const, subjectKey: 'overview.roomSubjectCommunication' as const, examiner: 'Chưa phân công', time: '00:00', count: 0 },
] as const;
