import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSchedule, type ScheduleStatus, type ScheduleRow } from '../../contexts/ScheduleContext';
import '../../styles/ExamSchedulePage.css';

export function ExamSchedulePage() {
  const { t } = useTranslation();
  const { scheduleRows, updateScheduleStatus, deleteSchedule } = useSchedule();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterExamCode, setFilterExamCode] = useState('');
  const [filterSubjectCode, setFilterSubjectCode] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const rows = useMemo(() => {
    let list = scheduleRows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.examCode.toLowerCase().includes(q) ||
          r.subjectCode.toLowerCase().includes(q)
      );
    }
    if (filterExamCode) list = list.filter((r) => r.examCode === filterExamCode);
    if (filterSubjectCode) list = list.filter((r) => r.subjectCode.includes(filterSubjectCode));
    if (filterStatus) list = list.filter((r) => r.status === filterStatus);
    if (filterDate) {
      const [y, m, d] = filterDate.split('-');
      const ddmmyyyy = d && m && y ? `${d}/${m}/${y}` : '';
      if (ddmmyyyy) list = list.filter((r) => r.time.startsWith(ddmmyyyy));
    }
    return list;
  }, [scheduleRows, search, filterExamCode, filterSubjectCode, filterStatus, filterDate]);

  const getStatusClass = (status: ScheduleStatus) => {
    const map: Record<ScheduleStatus, string> = {
      'Nháp': 'status-nhap',
      'Đã lên lịch': 'status-scheduled',
      'Đang diễn ra': 'status-running',
      'Đã hoàn thành': 'status-done',
      'Khoá': 'status-locked',
    };
    return map[status] ?? '';
  };

  const handleEdit = (row: ScheduleRow) => {
    navigate('/dashboard/setup-exam', { state: { editSchedule: row } });
  };

  const handleDelete = (row: ScheduleRow) => {
    if (window.confirm(t('examSchedule.deleteConfirm', { examCode: row.examCode, subjectCode: row.subjectCode }))) {
      deleteSchedule(row.id);
    }
  };

  const handleStatusChange = (id: string, status: ScheduleStatus) => {
    updateScheduleStatus(id, status);
  };

  return (
    <div className="exam-schedule-page">
      <div className="schedule-header">
        <h1 className="schedule-title">{t('examSchedule.title')}</h1>
        <div className="schedule-actions">
          <Link to="/dashboard/setup-exam" className="btn-setup-exam">
            {t('examSchedule.setupNewExam')}
          </Link>
          <button type="button" className="btn-export">
            {t('examSchedule.exportExcel')}
          </button>
        </div>
      </div>

      <div className="schedule-search">
        <label className="search-label">{t('examSchedule.searchLabel')}</label>
        <input
          type="text"
          className="search-input"
          placeholder={t('examSchedule.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="schedule-filters">
        <div className="filter-group">
          <label>{t('examSchedule.filterExamCode')}</label>
          <select
            value={filterExamCode}
            onChange={(e) => setFilterExamCode(e.target.value)}
            className="filter-select"
          >
            <option value="">{t('common.all')}</option>
            <option value="OCSE001-M01">OCSE001-M01</option>
            <option value="OCSE002-M02">OCSE002-M02</option>
            <option value="OCSE003-M03">OCSE003-M03</option>
          </select>
        </div>
        <div className="filter-group">
          <label>{t('examSchedule.filterSubjectCode')}</label>
          <select
            value={filterSubjectCode}
            onChange={(e) => setFilterSubjectCode(e.target.value)}
            className="filter-select"
          >
            <option value="">{t('common.all')}</option>
            <option value="LSTM01">LSTM01</option>
            <option value="NK01">NK01</option>
            <option value="NGK01">NGK01</option>
          </select>
        </div>
        <div className="filter-group">
          <label>{t('examSchedule.filterStatus')}</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">{t('common.all')}</option>
            <option value="Nháp">{t('examSchedule.statusDraft')}</option>
            <option value="Đã lên lịch">{t('examSchedule.statusScheduled')}</option>
            <option value="Đang diễn ra">{t('examSchedule.statusRunning')}</option>
            <option value="Đã hoàn thành">{t('examSchedule.statusDone')}</option>
            <option value="Khoá">{t('examSchedule.statusLocked')}</option>
          </select>
        </div>
        <div className="filter-group">
          <label>{t('examSchedule.filterDate')}</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-date"
          />
        </div>
      </div>

      <div className="schedule-table-wrap">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>{t('examSchedule.colExamCode')}</th>
              <th>{t('examSchedule.colSubjectCode')}</th>
              <th>{t('examSchedule.colTime')}</th>
              <th>{t('examSchedule.colRoomCount')}</th>
              <th>{t('examSchedule.colExamType')}</th>
              <th>{t('examSchedule.colStatus')}</th>
              <th>{t('examSchedule.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.examCode}</td>
                <td>{row.subjectCode}</td>
                <td>{row.time}</td>
                <td>{row.roomCount}</td>
                <td>{row.examType}</td>
                <td>
                  <select
                    value={row.status}
                    onChange={(e) =>
                      handleStatusChange(row.id, e.target.value as ScheduleStatus)
                    }
                    className={`status-select ${getStatusClass(row.status)}`}
                    disabled={row.status === 'Khoá' || row.status === 'Đang diễn ra'}
                  >
                    <option value="Nháp">{t('examSchedule.statusDraft')}</option>
                    <option value="Đã lên lịch">{t('examSchedule.statusScheduled')}</option>
                    <option value="Đang diễn ra">{t('examSchedule.statusRunning')}</option>
                    <option value="Đã hoàn thành">{t('examSchedule.statusDone')}</option>
                    <option value="Khoá">{t('examSchedule.statusLocked')}</option>
                  </select>
                </td>
                <td>
                  <div className="schedule-actions-cell">
                    <button
                      type="button"
                      className="btn-edit-schedule"
                      onClick={() => handleEdit(row)}
                      disabled={row.status === 'Khoá' || row.status === 'Đang diễn ra'}
                      title={t('examSchedule.editTitle')}
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      type="button"
                      className="btn-delete-schedule"
                      onClick={() => handleDelete(row)}
                      title={t('common.delete')}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
