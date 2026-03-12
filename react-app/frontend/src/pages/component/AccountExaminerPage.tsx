import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/AccountExaminerPage.css';

type ExaminerStatus = 'Active' | 'Inactive' | 'Lock';

interface ExaminerRow {
  id: string;
  examinerId: string;
  fullName: string;
  userName: string;
  status: ExaminerStatus;
}

interface TimeLimitRow {
  id: string;
  userName: string;
  hours: number;
  minutes: number;
  applyAt: string;
}

interface TimeLimitForm {
  userName: string;
  hours: string;
  minutes: string;
  applyAt: string;
}

const INITIAL_EXAMINERS: ExaminerRow[] = [
  { id: '1', examinerId: 'EX001', fullName: 'Nguyen Van A', userName: 'Ex01', status: 'Active' },
  { id: '2', examinerId: 'EX002', fullName: 'Tran Thi B', userName: 'Ex02', status: 'Active' },
  { id: '3', examinerId: 'EX003', fullName: 'Le Van C', userName: 'Ex03', status: 'Inactive' },
];

export function AccountExaminerPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'account' | 'timeLimit'>('account');
  const [examiners, setExaminers] = useState<ExaminerRow[]>(INITIAL_EXAMINERS);
  const [openActionsId, setOpenActionsId] = useState<string | null>(null);
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [timeLimitModalOpen, setTimeLimitModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [addForm, setAddForm] = useState({
    examinerId: '',
    fullName: '',
    userName: '',
    password: '',
    confirmPassword: '',
    status: 'Active' as ExaminerStatus,
  });
  const [timeLimitForm, setTimeLimitForm] = useState<TimeLimitForm>({
    userName: '',
    hours: '',
    minutes: '',
    applyAt: '',
  });
  const [timeLimits, setTimeLimits] = useState<TimeLimitRow[]>([]);

  const passwordMatch = addForm.password && addForm.password === addForm.confirmPassword;
  const passwordLongEnough = addForm.password.length >= 6;

  const handleStatusChange = (rowId: string, status: ExaminerStatus) => {
    setExaminers((prev) => prev.map((r) => (r.id === rowId ? { ...r, status } : r)));
    setOpenStatusId(null);
  };

  const handleDeleteClick = (rowId: string) => {
    setOpenActionsId(null);
    setDeleteConfirmId(rowId);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;
    setExaminers((prev) => prev.filter((r) => r.id !== deleteConfirmId));
    setDeleteConfirmId(null);
    setDeleteMessage({ type: 'success', text: t('accountExaminer.deleteSuccess') });
    setTimeout(() => setDeleteMessage(null), 3000);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const handleEdit = (row: ExaminerRow) => {
    setOpenActionsId(null);
    setAddForm({
      examinerId: row.examinerId,
      fullName: row.fullName,
      userName: row.userName,
      password: '',
      confirmPassword: '',
      status: row.status,
    });
    setAddModalOpen(true);
  };

  const formatDateTime = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value.replace('T', ' ');
    }
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getEndDateTime = (row: TimeLimitRow) => {
    if (!row.applyAt) return '';
    const start = new Date(row.applyAt);
    if (Number.isNaN(start.getTime())) return '';
    const totalMinutes = row.hours * 60 + row.minutes;
    const end = new Date(start.getTime() + totalMinutes * 60_000);
    return formatDateTime(end.toISOString());
  };

  const handleSaveTimeLimit = () => {
    if (!timeLimitForm.userName || !timeLimitForm.applyAt) {
      return;
    }

    const hours = Number(timeLimitForm.hours || '0');
    const minutes = Number(timeLimitForm.minutes || '0');

    setTimeLimits((prev) => {
      const existingIndex = prev.findIndex((t) => t.userName === timeLimitForm.userName);
      const updated: TimeLimitRow = {
        id: existingIndex >= 0 ? prev[existingIndex].id : String(Date.now()),
        userName: timeLimitForm.userName,
        hours,
        minutes,
        applyAt: timeLimitForm.applyAt,
      };

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = updated;
        return next;
      }

      return [...prev, updated];
    });

    setTimeLimitModalOpen(false);
  };

  return (
    <div className="account-examiner-page">
      {deleteMessage && (
        <div className={`account-message account-message-${deleteMessage.type}`} role="alert">
          {deleteMessage.text}
        </div>
      )}
      <header className="account-header">
        <h1 className="account-title">{t('accountExaminer.title')}</h1>
      </header>

      <div className="account-tabs">
        <button
          type="button"
          className={`account-tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          {t('accountExaminer.tabAccount')}
        </button>
        <button
          type="button"
          className={`account-tab ${activeTab === 'timeLimit' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeLimit')}
        >
          {t('accountExaminer.tabTimeLimit')}
        </button>
      </div>

      {activeTab === 'account' && (
        <div className="account-tab-panel">
          <div className="account-toolbar">
            <button type="button" className="btn-add-examiner" onClick={() => setAddModalOpen(true)}>
              {t('accountExaminer.addExaminer')}
            </button>
          </div>
          <div className="account-table-wrap">
            <table className="account-table">
              <thead>
                <tr>
                  <th>{t('accountExaminer.examinerId')}</th>
                  <th>{t('accountExaminer.fullName')}</th>
                  <th>{t('accountExaminer.userName')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('accountExaminer.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {examiners.map((row) => (
                  <tr key={row.id}>
                    <td>{row.examinerId}</td>
                    <td>{row.fullName}</td>
                    <td>{row.userName}</td>
                    <td>
                      <div className="cell-dropdown-wrap">
                        <button
                          type="button"
                          className="cell-dropdown-trigger status-trigger"
                          onClick={() => {
                            setOpenActionsId(null);
                            setOpenStatusId(openStatusId === row.id ? null : row.id);
                          }}
                        >
                          {row.status}
                          <span className="dropdown-arrow">▼</span>
                        </button>
                        {openStatusId === row.id && (
                          <div className="cell-dropdown-menu">
                            {(['Active', 'Inactive', 'Lock'] as const).map((s) => (
                              <button
                                key={s}
                                type="button"
                                className="cell-dropdown-item"
                                onClick={() => handleStatusChange(row.id, s)}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="cell-dropdown-wrap">
                        <button
                          type="button"
                          className="cell-dropdown-trigger actions-trigger"
                          onClick={() => {
                            setOpenStatusId(null);
                            setOpenActionsId(openActionsId === row.id ? null : row.id);
                          }}
                        >
                          {t('accountExaminer.actions')}
                          <span className="dropdown-arrow">▼</span>
                        </button>
                        {openActionsId === row.id && (
                          <div className="cell-dropdown-menu">
                            <button type="button" className="cell-dropdown-item" onClick={() => handleEdit(row)}>
                              {t('common.edit')}
                            </button>
                            <button type="button" className="cell-dropdown-item danger" onClick={() => handleDeleteClick(row.id)}>
                              {t('common.delete')}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'timeLimit' && (
        <div className="account-tab-panel">
          <p className="account-hint">{t('accountExaminer.timeLimitHint')}</p>
          <button type="button" className="btn-add-examiner" onClick={() => setTimeLimitModalOpen(true)}>
            {t('accountExaminer.setupTimeLimit')}
          </button>
          {timeLimits.length > 0 && (
            <div className="account-table-wrap time-limit-table-wrap">
              <table className="account-table">
                <thead>
                  <tr>
                    <th>{t('accountExaminer.accountExaminerCol')}</th>
                    <th>{t('accountExaminer.startDateTime')}</th>
                    <th>{t('accountExaminer.endDateTime')}</th>
                  </tr>
                </thead>
                <tbody>
                  {timeLimits.map((row) => (
                    <tr key={row.id}>
                      <td>{row.userName}</td>
                      <td>{formatDateTime(row.applyAt)}</td>
                      <td>{getEndDateTime(row)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Examiner */}
      {addModalOpen && (
        <div className="modal-overlay" onClick={() => setAddModalOpen(false)}>
          <div className="modal-dialog add-examiner-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{t('accountExaminer.modalAddTitle')}</h2>
            <section className="modal-section">
              <h3 className="modal-section-title">{t('accountExaminer.accountInfo')}</h3>
              <div className="modal-fields">
                <div className="modal-field">
                  <label>{t('accountExaminer.examinerId')}</label>
                  <input
                    type="text"
                    value={addForm.examinerId}
                    onChange={(e) => setAddForm((f) => ({ ...f, examinerId: e.target.value }))}
                    placeholder="Null"
                  />
                </div>
                <div className="modal-field">
                  <label>{t('accountExaminer.fullName')}</label>
                  <input
                    type="text"
                    value={addForm.fullName}
                    onChange={(e) => setAddForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder="Null"
                  />
                </div>
                <div className="modal-field">
                  <label>{t('accountExaminer.userName')}</label>
                  <input
                    type="text"
                    value={addForm.userName}
                    onChange={(e) => setAddForm((f) => ({ ...f, userName: e.target.value }))}
                    placeholder="Null"
                  />
                </div>
                <div className="modal-field">
                  <label>{t('login.password')}</label>
                  <input
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Null"
                  />
                  <span className={`field-hint ${passwordLongEnough ? 'pass' : 'not-pass'}`}>
                    {addForm.password ? (passwordLongEnough ? t('common.pass') : t('accountExaminer.passwordMinHint')) : ''}
                  </span>
                </div>
                <div className="modal-field">
                  <label>{t('accountExaminer.confirmPassword')}</label>
                  <input
                    type="password"
                    value={addForm.confirmPassword}
                    onChange={(e) => setAddForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Null"
                  />
                  <span className={`field-hint ${passwordMatch ? 'pass' : 'not-pass'}`}>
                    {addForm.confirmPassword ? (passwordMatch ? t('common.pass') : t('common.notPass')) : ''}
                  </span>
                </div>
                <div className="modal-field">
                  <label>{t('common.status')}:</label>
                  <div className="status-options">
                    {(['Active', 'Inactive', 'Lock'] as const).map((s) => (
                      <label key={s} className="status-option">
                        <input
                          type="radio"
                          name="addStatus"
                          checked={addForm.status === s}
                          onChange={() => setAddForm((f) => ({ ...f, status: s }))}
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <div className="modal-actions">
              <button type="button" className="btn-modal-cancel" onClick={() => setAddModalOpen(false)}>
                {t('common.cancel')}
              </button>
              <button type="button" className="btn-modal-primary">
                {t('common.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Xác nhận xóa */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-dialog delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{t('accountExaminer.confirmDeleteTitle')}</h2>
            <p className="delete-confirm-text">{t('accountExaminer.confirmDeleteText')}</p>
            <div className="modal-actions">
              <button type="button" className="btn-modal-cancel" onClick={handleDeleteCancel}>
                {t('common.cancel')}
              </button>
              <button type="button" className="btn-modal-primary btn-modal-danger" onClick={handleDeleteConfirm}>
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Time Limit */}
      {timeLimitModalOpen && (
        <div className="modal-overlay" onClick={() => setTimeLimitModalOpen(false)}>
          <div className="modal-dialog time-limit-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{t('accountExaminer.timeLimitModalTitle')}</h2>
            <div className="modal-fields">
              <div className="modal-field">
                <label>{t('accountExaminer.setupTimeLimitFor')}</label>
                <select
                  value={timeLimitForm.userName}
                  onChange={(e) => setTimeLimitForm((f) => ({ ...f, userName: e.target.value }))}
                >
                  <option value="">{t('accountExaminer.userNamePlaceholder')}</option>
                  {examiners.map((ex) => (
                    <option key={ex.id} value={ex.userName}>
                      {ex.userName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-field">
                <label>{t('accountExaminer.totalTimeLabel')}</label>
                <div className="time-limit-inputs">
                  <input
                    type="number"
                    min={0}
                    max={24}
                    value={timeLimitForm.hours}
                    onChange={(e) => setTimeLimitForm((f) => ({ ...f, hours: e.target.value }))}
                    placeholder={t('accountExaminer.hoursPlaceholder')}
                  />
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={timeLimitForm.minutes}
                    onChange={(e) => setTimeLimitForm((f) => ({ ...f, minutes: e.target.value }))}
                    placeholder={t('accountExaminer.minutesPlaceholder')}
                  />
                </div>
              </div>
              <div className="modal-field">
                <label>{t('accountExaminer.applyAtLabel')}</label>
                <input
                  type="datetime-local"
                  value={timeLimitForm.applyAt}
                  onChange={(e) => setTimeLimitForm((f) => ({ ...f, applyAt: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-modal-cancel" onClick={() => setTimeLimitModalOpen(false)}>
                {t('common.cancel')}
              </button>
              <button type="button" className="btn-modal-primary" onClick={handleSaveTimeLimit}>
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
