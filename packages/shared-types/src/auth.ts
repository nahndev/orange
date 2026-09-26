export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface UpdateProfileRequest {
  name?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
