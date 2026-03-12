import { LoginResponse, ApiError } from '../types/auth.types';

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE_URL;
  return typeof url === 'string' && url.length > 0 ? url.replace(/\/$/, '') : '';
};
const DEV_ADMIN_USERNAME = 'admin';
const DEV_ADMIN_PASSWORD = 'admin123';
const DEV_TOKEN = 'dev-no-backend-token';

function devLogin(username: string, _password: string): LoginResponse {
  return {
    accessToken: DEV_TOKEN,
    user: {
      id: '1',
      username: username,
      name: 'Quản trị viên',
    },
  };
}

async function handleResponse<T>(res: Response, parseJson = true): Promise<T> {
  const text = await res.text();
  let data: unknown = null;
  if (parseJson && text) {
    try {
      data = JSON.parse(text);
    } catch {
      // leave data null
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string')
        ? (data as { message: string }).message
        : res.status === 401
          ? 'Username hoặc mật khẩu không đúng'
          : res.status >= 500
            ? 'Lỗi server, vui lòng thử lại sau'
            : 'Đăng nhập thất bại';
    const error: ApiError = { message };
    throw error;
  }

  return (data ?? text) as T;
}

function mapUser(raw: { id?: unknown; username?: string; name?: string; full_name?: string }): LoginResponse['user'] {
  const id = raw.id != null ? String(raw.id) : '';
  const name = raw.name ?? raw.full_name ?? '';
  return {
    id,
    username: raw.username ?? '',
    name,
  };
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const base = getBaseUrl();

  if (!base) {
    if (username === DEV_ADMIN_USERNAME && password === DEV_ADMIN_PASSWORD) {
      return Promise.resolve(devLogin(username, password));
    }
    throw {
      message: 'Chưa cấu hình API. Dùng username "admin" và mật khẩu "password" khi chạy không backend.',
    } as ApiError;
  }

  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await handleResponse<{ accessToken?: string; token?: string; user?: unknown }>(res);
  const token = data.accessToken ?? data.token ?? '';
  const user = data.user && typeof data.user === 'object' ? mapUser(data.user as Record<string, unknown>) : null;

  if (!token || !user) {
    throw { message: 'Phản hồi đăng nhập không hợp lệ' } as ApiError;
  }

  return { accessToken: token, user };
}

export async function verifyUsernameForReset(username: string): Promise<{ valid: boolean }> {
  const base = getBaseUrl();
  if (!base) {
    return Promise.resolve({ valid: username === DEV_ADMIN_USERNAME });
  }

  const res = await fetch(`${base}/api/auth/forgot/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  const data = await handleResponse<{ valid?: boolean }>(res);
  return { valid: data.valid === true };
}

export async function resetPassword(username: string, newPassword: string): Promise<{ message: string }> {
  const base = getBaseUrl();
  if (!base) {
    if (username?.trim() && newPassword?.trim()) {
      return Promise.resolve({ message: 'Mật khẩu đã được thay đổi thành công (chế độ không backend)' });
    }
    throw { message: 'Thông tin không đầy đủ' } as ApiError;
  }

  if (!username?.trim() || !newPassword?.trim()) {
    throw { message: 'Thông tin không đầy đủ' } as ApiError;
  }

  const res = await fetch(`${base}/api/auth/forgot/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), newPassword }),
  });

  const data = await handleResponse<{ message?: string }>(res);
  return { message: data.message ?? 'Mật khẩu đã được thay đổi thành công' };
}
