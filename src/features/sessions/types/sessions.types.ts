export type Session = {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt?: string;
};

export type SessionsState = {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
};

export type SessionsActions = {
  setSessions: (sessions: Session[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setTotal: (total: number) => void;
};

export type SessionsStore = SessionsState & SessionsActions;
export type SessionsStoreType = SessionsStore;
