import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import * as scheduleApi from '../services/scheduleApi';

export type ScheduleStatus =
  | 'Nháp'
  | 'Đã lên lịch'
  | 'Đang diễn ra'
  | 'Đã hoàn thành'
  | 'Khoá';

export interface ScheduleRow {
  id: string;
  examCode: string;
  subjectCode: string;
  time: string;
  startDateTime?: string | null;
  endDateTime?: string | null;
  roomCount: number;
  examType: string;
  status: ScheduleStatus;
}

const INITIAL_ROWS: ScheduleRow[] = [];

function computeStatus(row: ScheduleRow, now: number): ScheduleStatus {
  const start = row.startDateTime ? new Date(row.startDateTime).getTime() : null;
  const end = row.endDateTime ? new Date(row.endDateTime).getTime() : null;
  if (end != null && now >= end) return 'Khoá';
  if (start != null && end != null && now >= start && now < end) return 'Đang diễn ra';
  return row.status;
}

interface ScheduleContextValue {
  scheduleRows: ScheduleRow[];
  addSchedule: (row: Omit<ScheduleRow, 'id'>) => Promise<void>;
  updateSchedule: (id: string, row: Partial<Omit<ScheduleRow, 'id'>>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  updateScheduleStatus: (id: string, status: ScheduleStatus) => void;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>(INITIAL_ROWS);
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    scheduleApi
      .fetchSchedules()
      .then((rows) => setScheduleRows(rows as ScheduleRow[]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const scheduleRowsWithComputedStatus = useMemo(() => {
    return scheduleRows.map((row) => ({
      ...row,
      status: computeStatus(row, tick),
    }));
  }, [scheduleRows, tick]);

  const addSchedule = useCallback(async (row: Omit<ScheduleRow, 'id'>) => {
    const fallbackRow: ScheduleRow = { ...row, id: String(Date.now()) };
    try {
      const created = await scheduleApi.createSchedule({
        ...row,
        startDateTime: row.startDateTime ?? null,
        endDateTime: row.endDateTime ?? null,
      });
      setScheduleRows((prev) => [created as ScheduleRow, ...prev]);
    } catch (err) {
      setScheduleRows((prev) => [fallbackRow, ...prev]);
      throw new Error('SAVED_OFFLINE');
    }
  }, []);

  const updateSchedule = useCallback(async (id: string, payload: Partial<Omit<ScheduleRow, 'id'>>) => {
    try {
      const updated = await scheduleApi.updateSchedule(id, payload);
      setScheduleRows((prev) => prev.map((r) => (r.id === id ? (updated as ScheduleRow) : r)));
    } catch (err) {
      setScheduleRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...payload } : r))
      );
      throw new Error('SAVED_OFFLINE');
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      await scheduleApi.deleteSchedule(id);
    } finally {
      setScheduleRows((prev) => prev.filter((r) => r.id !== id));
    }
  }, []);

  const updateScheduleStatus = useCallback((id: string, status: ScheduleStatus) => {
    setScheduleRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }, []);

  const value: ScheduleContextValue = {
    scheduleRows: scheduleRowsWithComputedStatus,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    updateScheduleStatus,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) {
    throw new Error('useSchedule must be used within ScheduleProvider');
  }
  return ctx;
}
