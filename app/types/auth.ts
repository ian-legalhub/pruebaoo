export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

