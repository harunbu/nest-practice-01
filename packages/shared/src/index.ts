export type HealthStatus = {
  service: string;
  status: 'ok';
  timestamp: string;
};

export type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type NoteTag = {
  id: string;
  name: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: NoteTag[];
  createdAt: string;
  updatedAt: string;
};
