export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthState = {
  user: User | null;
  csrfToken: string | null;
  loading: boolean;
  error: string | null;
};

export type AuthActions = {
  setUser: (user: User | null) => void;
  setCsrfToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export type AuthStore = AuthState & AuthActions;
export type AuthStoreType = AuthStore;
