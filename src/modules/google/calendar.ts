import { GaxiosError } from 'gaxios';
import { google } from 'googleapis';
import { EnvController } from '../../controllers/EnvController';
import { Lesson } from '../../types';
import { AuthService } from './auth';

const GOOGLE_CALENDAR_ID_ENV = EnvController.init().get('GOOGLE_CALENDAR_ID') || '';

export async function saveLessonsToCalendar(lessons: Lesson[]) {
  const authService = new AuthService();
  const auth = await authService.getGoogleAuth();

  const calendarService = google.calendar({
    version: 'v3',
    auth,
  });

  for (const lesson of lessons) {
    const requestBody = {
      calendarId: GOOGLE_CALENDAR_ID_ENV,
      requestBody: {
        id: lesson.id,
        locked: true,
        colorId: '2',
        summary: lesson.subject,
        description: `${lesson.teacher} ${lesson.link}`,
        start: {
          dateTime: lesson.startTime,
          timeZone: 'Europe/Kyiv',
        },
        end: {
          dateTime: lesson.endTime,
          timeZone: 'Europe/Kyiv',
        },
      },
    };

    try {
      await calendarService.events.insert({ ...requestBody });
    } catch (error) {
      if (error instanceof GaxiosError) {
        const status = error.response?.status;

        if (status === 409) {
          await calendarService.events.update({ ...requestBody, eventId: lesson.id });
          continue;
        }

        if (status === 401) {
          await authService.generateAndSaveTokens();
          await calendarService.events.insert({ ...requestBody });
          continue;
        }
      }
      throw error;
    }
  }
}
