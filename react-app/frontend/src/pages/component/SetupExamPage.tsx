import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ScheduleRow } from '../../contexts/ScheduleContext';
import '../../styles/SetupExam.css';

/** Danh sách mã kỳ thi cố định – dùng làm key cho toàn bộ phần thi */
const EXAM_CODE_LIST: string[] = [
  'OSCE-2025-1',
  'OSCE-2025-2',
  'OSCE-2026-1',
  'OSCE-2026-2',
  'OSCE-2027-1',
];

interface SavedTimeLimit {
  id: number;
  waitTime: number;
  examinationTime: number;
  breakTime: number;
  created: string;
}

export function SetupExamPage() {
  const [activeTab, setActiveTab] = useState('setup');
  const [examCode, setExamCode] = useState<string>('');
  const [subjectCode, setSubjectCode] = useState<string>('');
  const [examType, setExamType] = useState<'Giữa kì' | 'Cuối kì'>('Giữa kì');
  const [waitTime, setWaitTime] = useState<string>('0');
  const [examinationTime, setExaminationTime] = useState<string>('0');
  const [breakTime, setBreakTime] = useState<string>('0');
  const [roomCount, setRoomCount] = useState<string>('0');
  const [cameraCount, setCameraCount] = useState<string>('0');
  const [startDate, setStartDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [logAccess, setLogAccess] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [bellOnEnd, setBellOnEnd] = useState(true);
  const [savedTimeLimits, setSavedTimeLimits] = useState<SavedTimeLimit[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { addSchedule, updateSchedule } = useSchedule();

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const editSchedule = (location.state as { editSchedule?: ScheduleRow } | null)?.editSchedule;

  useEffect(() => {
    if (!editSchedule) return;
    setExamCode(editSchedule.examCode);
    setSubjectCode(editSchedule.subjectCode);
    setExamType((editSchedule.examType === 'Cuối kì' ? 'Cuối kì' : 'Giữa kì') as 'Giữa kì' | 'Cuối kì');
    setRoomCount(String(editSchedule.roomCount));
    if (editSchedule.startDateTime) {
      const s = editSchedule.startDateTime;
      setStartDate(s.slice(0, 10));
      setStartTime(s.slice(11, 16) || '00:00');
    }
    if (editSchedule.endDateTime) {
      const e = new Date(editSchedule.endDateTime);
      const start = editSchedule.startDateTime ? new Date(editSchedule.startDateTime).getTime() : 0;
      const durationMs = e.getTime() - start;
      const durationMin = Math.round(durationMs / 60000);
      setExaminationTime(String(Math.max(0, durationMin)));
    }
  }, [editSchedule]);

  const getValidationErrors = (): string[] => {
    const missing: string[] = [];
    if (!examCode.trim()) missing.push('setupExam.validation_examCode');
    if (!subjectCode.trim()) missing.push('setupExam.validation_subjectCode');
    if (!startDate.trim()) missing.push('setupExam.validation_startDate');
    if (!startTime.trim()) missing.push('setupExam.validation_startTime');
    const waitNum = Number(waitTime);
    const examNum = Number(examinationTime);
    const breakNum = Number(breakTime);
    const roomNum = Number(roomCount);
    const cameraNum = Number(cameraCount);
    if (waitTime === '' || !Number.isFinite(waitNum) || waitNum < 0)
      missing.push('setupExam.validation_waitTime');
    if (examinationTime === '' || !Number.isFinite(examNum) || examNum <= 0)
      missing.push('setupExam.validation_examinationTime');
    if (breakTime === '' || !Number.isFinite(breakNum) || breakNum < 0)
      missing.push('setupExam.validation_breakTime');
    if (roomCount === '' || !Number.isFinite(roomNum) || roomNum <= 0)
      missing.push('setupExam.validation_roomCount');
    if (cameraCount === '' || !Number.isFinite(cameraNum) || cameraNum < 0)
      missing.push('setupExam.validation_cameraCount');
    return missing;
  };

  const handleSaveSettings = async () => {
    const errors = getValidationErrors();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setSaving(true);

    const roomNum = Number(roomCount) || 0;
    const formatDate = (yyyyMmDd: string) => {
      const [y, m, d] = yyyyMmDd.split('-');
      return d && m && y ? `${d}/${m}/${y}` : '';
    };
    const timeStr = endDateTime.date && endDateTime.time
      ? `${formatDate(startDate)} ${startTime} - ${endDateTime.time}`
      : `${formatDate(startDate)} ${startTime}`;

    const startDateTimeVal = startDate && startTime ? `${startDate}T${startTime}:00` : null;
    const endDateTimeVal =
      endDateTime.date && endDateTime.time
        ? `${endDateTime.date}T${endDateTime.time}:00`
        : null;

    const payload = {
      examCode: examCode.trim(),
      subjectCode: subjectCode.trim(),
      time: timeStr,
      startDateTime: startDateTimeVal,
      endDateTime: endDateTimeVal,
      roomCount: roomNum,
      examType,
      status: 'Nháp' as const,
    };

    try {
      if (editSchedule) {
        await updateSchedule(editSchedule.id, payload);
        showToast(t('setupExam.saveSuccess'));
        navigate('/dashboard/exam-schedule', { replace: true, state: {} });
        return;
      }

      await addSchedule(payload);
      showToast(t('setupExam.saveSuccess'));

      if (waitTime || examinationTime || breakTime) {
        const newSavedLimit: SavedTimeLimit = {
          id: Date.now(),
          waitTime: Number(waitTime) || 0,
          examinationTime: Number(examinationTime) || 0,
          breakTime: Number(breakTime) || 0,
          created: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        setSavedTimeLimits([newSavedLimit, ...savedTimeLimits]);
      }

      setExamCode('');
      setSubjectCode('');
      setExamType('Giữa kì');
      setWaitTime('0');
      setExaminationTime('0');
      setBreakTime('0');
      setRoomCount('0');
      setCameraCount('0');
      setStartDate('');
      setStartTime('');
      setLogAccess(true);
      setTwoFactor(false);
      setBellOnEnd(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'SAVED_OFFLINE') {
        showToast(t('setupExam.saveOffline'));
        setExamCode('');
        setSubjectCode('');
        setWaitTime('0');
        setExaminationTime('0');
        setBreakTime('0');
        setRoomCount('0');
        setCameraCount('0');
        setStartDate('');
        setStartTime('');
      } else {
        showToast(msg || t('setupExam.saveError'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValidationErrors([]);
    setExamCode('');
    setSubjectCode('');
    setExamType('Giữa kì');
    setWaitTime('0');
    setExaminationTime('0');
    setBreakTime('0');
    setRoomCount('0');
    setCameraCount('0');
    setStartDate('');
    setStartTime('');
    setLogAccess(true);
    setTwoFactor(false);
    setBellOnEnd(true);
  };

  const examDuration = useMemo(() => {
    const w = Number(waitTime) || 0;
    const e = Number(examinationTime) || 0;
    const b = Number(breakTime) || 0;
    const r = Number(roomCount) || 0;
    return (w + e + b) * (r || 1);
  }, [waitTime, examinationTime, breakTime, roomCount]);

  const handleNumberChange = (value: string, setter: (v: string) => void) => {
    if (value === '') setter('');
    else setter(String(Math.max(0, parseInt(value, 10) || 0)));
  };

  const endDateTime = useMemo(() => {
    if (!startDate || !startTime) return { date: '', time: '' };
    
    try {
      const startDateTime = new Date(`${startDate}T${startTime}:00`);
      const endDateTimeObj = new Date(startDateTime.getTime() + examDuration * 60000);
      
      const endDate = endDateTimeObj.toISOString().split('T')[0];
      const endHours = String(endDateTimeObj.getHours()).padStart(2, '0');
      const endMinutes = String(endDateTimeObj.getMinutes()).padStart(2, '0');
      const endTime = `${endHours}:${endMinutes}`;
      
      return { date: endDate, time: endTime };
    } catch {
      return { date: '', time: '' };
    }
  }, [startDate, startTime, examDuration]);

  return (
    <div className="setup-exam-page">
      <div className="setup-tabs">
        <button
          className={`tab-button ${activeTab === 'setup' ? 'active' : ''}`}
          onClick={() => setActiveTab('setup')}
        >
          {t('setupExam.tabScreenSetup')}
        </button>
        <button
          className={`tab-button ${activeTab === 'time' ? 'active' : ''}`}
          onClick={() => setActiveTab('time')}
        >
          {t('setupExam.tabTimeDetail')}
        </button>
        <button
          className={`tab-button ${activeTab === 'room' ? 'active' : ''}`}
          onClick={() => setActiveTab('room')}
        >
          {t('setupExam.tabRoom')}
        </button>
        <button
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          {t('setupExam.tabSecurity')}
        </button>
      </div>

      <div className="setup-content">
        {/* Screen Setup Exam Tab */}
        {activeTab === 'setup' && (
          <div className="tab-content">
            <div className="content-row">
              <div className="section">
                <h3 className="section-title">{t('setupExam.examInfo')}</h3>
                <div className="form-group">
                  <div className="time-exam-grid exam-info-grid">
                    <div>
                      <label className="sub-label">{t('setupExam.examCode')}</label>
                      <select
                        value={examCode}
                        onChange={(e) => setExamCode(e.target.value)}
                        className="exam-code-select"
                        aria-label={t('setupExam.examCode')}
                      >
                        <option value="">{t('setupExam.examCodePlaceholder')}</option>
                        {(examCode && !EXAM_CODE_LIST.includes(examCode)
                          ? [examCode, ...EXAM_CODE_LIST]
                          : EXAM_CODE_LIST
                        ).map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="sub-label">{t('setupExam.subjectCode')}</label>
                      <div className="input-with-spinner">
                        <input
                          type="text"
                          placeholder={t('setupExam.subjectCodePlaceholder')}
                          value={subjectCode}
                          onChange={(e) => setSubjectCode(e.target.value)}
                        />
                        <span className="spinner-visual" aria-hidden>
                          <span className="spinner-arrow-up" />
                          <span className="spinner-arrow-down" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('setupExam.examType')}</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as 'Giữa kì' | 'Cuối kì')}
                    className="exam-type-select"
                  >
                    <option value="Giữa kì">{t('setupExam.examTypeMid')}</option>
                    <option value="Cuối kì">{t('setupExam.examTypeFinal')}</option>
                  </select>
                </div>
              </div>

              <div className="section">
                <h3 className="section-title">{t('setupExam.timeConfig')}</h3>
                <div className="form-group">
                  <label>{t('setupExam.startTime')}</label>
                  <div className="time-inputs">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('setupExam.timeExam')}</label>
                  <div className="time-exam-grid">
                    <div>
                      <label className="sub-label">{t('setupExam.waitTime')}</label>
                      <input
                        type="number"
                        value={waitTime}
                        onChange={(e) => handleNumberChange(e.target.value, setWaitTime)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="sub-label">{t('setupExam.examinationTime')}</label>
                      <input
                        type="number"
                        value={examinationTime}
                        onChange={(e) => handleNumberChange(e.target.value, setExaminationTime)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="sub-label">{t('setupExam.breakTime')}</label>
                      <input
                        type="number"
                        value={breakTime}
                        onChange={(e) => handleNumberChange(e.target.value, setBreakTime)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('setupExam.examDuration')}</label>
                  <div className="duration-display">
                    {examDuration} {t('setupExam.minutes')}
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('setupExam.timeEnd')}</label>
                  <div className="time-inputs">
                    <input type="date" value={endDateTime.date} disabled />
                    <input type="time" value={endDateTime.time} disabled />
                  </div>
                </div>
              </div>

              <div className="section">
                <h3 className="section-title">{t('setupExam.roomExam')}</h3>
                <div className="form-group">
                  <label>{t('setupExam.roomCount')}</label>
                  <input
                    type="number"
                    placeholder={t('setupExam.roomCountPlaceholder')}
                    value={roomCount}
                    onChange={(e) => handleNumberChange(e.target.value, setRoomCount)}
                  />
                </div>
                <div className="form-group">
                  <label>{t('setupExam.camera')}</label>
                  <input
                    type="number"
                    placeholder={t('setupExam.cameraPlaceholder')}
                    value={cameraCount}
                    onChange={(e) => handleNumberChange(e.target.value, setCameraCount)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time & Detail Tab */}
        {activeTab === 'time' && (
          <div className="tab-content">
            <div className="content-section">
              <h3>{t('setupExam.timeTabTitle')}</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('setupExam.startTime')}</label>
                  <div className="time-inputs">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <h3>{t('setupExam.timeExam')}</h3>
              <div className="form-row time-exam-row">
                <div className="form-group">
                  <label>{t('setupExam.waitTime')}</label>
                  <input
                    type="number"
                    value={waitTime}
                    onChange={(e) => handleNumberChange(e.target.value, setWaitTime)}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>{t('setupExam.examinationTime')}</label>
                  <input
                    type="number"
                    value={examinationTime}
                    onChange={(e) => handleNumberChange(e.target.value, setExaminationTime)}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>{t('setupExam.breakTime')}</label>
                  <input
                    type="number"
                    value={breakTime}
                    onChange={(e) => handleNumberChange(e.target.value, setBreakTime)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="exam-duration-summary">
                <span className="label">{t('setupExam.examDurationLabel')}</span>
                <span className="duration">{examDuration} {t('setupExam.minutes')}</span>
              </div>

              <h3 style={{ marginTop: '30px' }}>{t('setupExam.savedTimeList')}</h3>
              {savedTimeLimits.length === 0 ? (
                <p style={{ color: '#999', fontStyle: 'italic' }}>{t('setupExam.noSavedSettings')}</p>
              ) : (
                <div className="saved-time-limits-list">
                  {savedTimeLimits.map((limit) => (
                    <div key={limit.id} className="saved-time-limit-item">
                      <div className="time-limit-info">
                        <span className="time-label">{t('setupExam.timeLimitWait')}: {limit.waitTime} {t('setupExam.minutes')}</span>
                        <span className="time-separator">|</span>
                        <span className="time-label">{t('setupExam.timeLimitExam')}: {limit.examinationTime} {t('setupExam.minutes')}</span>
                        <span className="time-separator">|</span>
                        <span className="time-label">{t('setupExam.timeLimitBreak')}: {limit.breakTime} {t('setupExam.minutes')}</span>
                      </div>
                      <div className="time-limit-created">{limit.created}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Room Tab – dùng chung state với tab Setup, hiển thị khi đã setup trước */}
        {activeTab === 'room' && (
          <div className="tab-content">
            <div className="room-section">
              <h3>{t('setupExam.roomTabTitle')}</h3>
              <table className="room-table">
                <thead>
                  <tr>
                    <th>{t('setupExam.roomLabel')}</th>
                    <th>{t('setupExam.quantity')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t('setupExam.roomCount')}</td>
                    <td>
                      <input
                        type="number"
                        placeholder={t('setupExam.numberPlaceholder')}
                        value={roomCount}
                        onChange={(e) => handleNumberChange(e.target.value, setRoomCount)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>{t('setupExam.camera')}</td>
                    <td>
                      <input
                        type="number"
                        placeholder={t('setupExam.numberPlaceholder')}
                        value={cameraCount}
                        onChange={(e) => handleNumberChange(e.target.value, setCameraCount)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="room-exam-info-card">
                <h3 className="room-exam-info-title">{t('setupExam.roomExamInfoTitle')}</h3>
                <div className="room-info">
                  <div className="room-info-row">
                    <span className="room-info-label">{t('setupExam.examCode')}</span>
                    <div className="room-info-value">{examCode || '—'}</div>
                  </div>
                  <div className="room-info-row">
                    <span className="room-info-label">{t('setupExam.subjectCode')}</span>
                    <div className="room-info-value">{subjectCode || '—'}</div>
                  </div>
                  <div className="room-info-row">
                    <span className="room-info-label">{t('setupExam.examType')}</span>
                    <div className="room-info-value">
                      {examType === 'Cuối kì' ? t('setupExam.examTypeFinal') : examType === 'Giữa kì' ? t('setupExam.examTypeMid') : (examType || '—')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="tab-content">
            <div className="security-section">
              <h3>{t('setupExam.securityTitle')}</h3>
              <div className="security-item">
                <label>{t('setupExam.logAccess')}</label>
                <button
                  type="button"
                  className={`toggle ${logAccess ? 'toggle-on' : 'toggle-off'}`}
                  onClick={() => setLogAccess((prev) => !prev)}
                  aria-pressed={logAccess}
                >
                  {logAccess ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="security-item">
                <label>{t('setupExam.twoFactor')}</label>
                <button
                  type="button"
                  className={`toggle ${twoFactor ? 'toggle-on' : 'toggle-off'}`}
                  onClick={() => setTwoFactor((prev) => !prev)}
                  aria-pressed={twoFactor}
                >
                  {twoFactor ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="security-item">
                <label>{t('setupExam.bellOnEnd')}</label>
                <button
                  type="button"
                  className={`toggle ${bellOnEnd ? 'toggle-on' : 'toggle-off'}`}
                  onClick={() => setBellOnEnd((prev) => !prev)}
                  aria-pressed={bellOnEnd}
                >
                  {bellOnEnd ? 'ON' : 'OFF'}
                </button>
              </div>

              <h3 style={{ marginTop: '30px' }}>{t('setupExam.notification')}</h3>
              <div className="notification-buttons">
                <button type="button" className="btn-notify">{t('setupExam.notify30')}</button>
                <button type="button" className="btn-notify">{t('setupExam.notify5')}</button>
                <button type="button" className="btn-notify">{t('setupExam.notifyEnd')}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div className="setup-validation-message" role="alert">
          <strong>{t('setupExam.validationRequired')}</strong>
          <ul>
            {validationErrors.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="setup-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? '…' : t('setupExam.saveSettings')}
        </button>
        <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>
          {t('common.cancel')}
        </button>
      </div>

      {toast && (
        <div className="setup-exam-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}