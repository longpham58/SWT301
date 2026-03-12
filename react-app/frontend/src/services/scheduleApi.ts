export type ScheduleStatus =
  | 'Nháp'
  | 'Đã lên lịch'
  | 'Đang diễn ra'
  | 'Đã hoàn thành'
  | 'Khoá';

export interface ScheduleRowPayload {
  id?: string;
  examCode: string;
  subjectCode: string;
  time: string;
  startDateTime: string | null;
  endDateTime: string | null;
  roomCount: number;
  examType: string;
  status: ScheduleStatus;
}

const getBaseUrl = (): string => {
  const url = import.meta.env?.VITE_API_BASE_URL;
  return typeof url === 'string' && url.length > 0 ? String(url).replace(/\/$/, '') : '';
};

/** Base path for schedule API: có base URL thì dùng absolute, không thì dùng relative (Vite proxy) */
function getScheduleApiPrefix(): string {
  const base = getBaseUrl();
  return base ? `${base}/api/schedules` : '/api/schedules';
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const prefix = getScheduleApiPrefix();
  const url = `${prefix}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // ignore
    }
  }
  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string')
        ? (data as { message: string }).message
        : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

/** Luôn bật: dùng API (qua proxy khi không set VITE_API_BASE_URL) */
export function hasScheduleApi(): boolean {
  return true;
}

export async function fetchSchedules(): Promise<ScheduleRowPayload[]> {
  return request<ScheduleRowPayload[]>('');
}

export async function createSchedule(body: Omit<ScheduleRowPayload, 'id'>): Promise<ScheduleRowPayload> {
  return request<ScheduleRowPayload>('', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateSchedule(id: string, body: Partial<ScheduleRowPayload>): Promise<ScheduleRowPayload> {
  return request<ScheduleRowPayload>(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteSchedule(id: string): Promise<void> {
  await request(`/${id}`, { method: 'DELETE' });
}
