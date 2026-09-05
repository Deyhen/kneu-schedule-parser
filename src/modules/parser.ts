import * as cheerio from 'cheerio';
import crypto from 'node:crypto';
import { Lesson } from '../types';

export function parseScheduleHtml(client: string) {
  const lessonsResult: Lesson[] = [];
  const $ = cheerio.load(client);

  const parsedLessonsData = $('tbody').children('tr');

  let currentDate;

  for (const lesson of parsedLessonsData) {
    const data = $(lesson).children('td');
    if (!data.length) {
      continue;
    }
    const firstRow = $(data[0]);
    const newDay = !!firstRow.attr('rowspan');
    const offset = newDay ? 1 : 0;
    if (newDay) {
      const [day, month, year] = firstRow.contents().last().text().trim().split('.').map(Number);

      currentDate = new Date(year, month - 1, day);
    }
    if (!currentDate) {
      throw new Error('invalid data structure');
    }
    const time = $(data[1 + offset]);
    const startTime = parseTime(currentDate, time.contents().first().text().trim());
    const endTime = parseTime(currentDate, time.contents().last().text().trim());

    const teacherAndSubject = $(data[2 + offset]);
    const subject = teacherAndSubject.find('strong').text().trim();
    const teacher = teacherAndSubject.find('a').text().trim();

    const link =
      $(data[3 + offset])
        .find('a')
        .attr('href') || '';

    const id = crypto.hash('sha256', `${subject} ${teacher} ${startTime} ${endTime}`);

    lessonsResult.push({ id, date: currentDate, startTime, endTime, subject, teacher, link });
  }

  return lessonsResult;
}

function parseTime(date: Date, time: string) {
  const updatedDate = new Date(date);
  const hours = time.split(':')[0];
  const minutes = time.split(':')[1];
  updatedDate.setHours(Number(hours));
  updatedDate.setMinutes(Number(minutes));
  return updatedDate.toISOString();
}
