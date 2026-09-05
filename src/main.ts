// import 'dotenv/config';
import { getScheduleHtml } from './modules/client';
import { saveLessonsToCalendar } from './modules/google/calendar';
import { parseScheduleHtml } from './modules/parser';

async function main() {
  const schedule = await getScheduleHtml();
  const lessons = parseScheduleHtml(schedule);
  await saveLessonsToCalendar(lessons);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
