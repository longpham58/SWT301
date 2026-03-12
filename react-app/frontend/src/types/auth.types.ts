export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface ApiError {
  message: string;
}
