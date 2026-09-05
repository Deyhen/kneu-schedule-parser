type LessonType = 'practical' | 'lab' | 'lecture';

export interface Lesson {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  lessonType?: LessonType;
  link?: string;
}

export interface GoogleCalendarResError {
  cause: { code: number; message: string };
}

export interface TokensCredentials {
  refresh_token?: string | null;
  expiry_date?: number | null;
  access_token?: string | null;
  token_type?: string | null;
  id_token?: string | null;
  scope?: string;
}
