import { addDays, addWeeks, addMonths, parseISO, isAfter, isBefore, isSameDay } from 'date-fns';
import type { Chore, RecurrenceRule } from '../types';

export function getNextOccurrence(baseDate: string, rule: RecurrenceRule): string {
  const date = parseISO(baseDate);
  let nextDate: Date;

  switch (rule.type) {
    case 'daily':
      nextDate = addDays(date, rule.interval);
      break;
    case 'weekly':
      nextDate = addWeeks(date, rule.interval);
      break;
    case 'monthly':
      nextDate = addMonths(date, rule.interval);
      break;
  }

  return nextDate.toISOString().split('T')[0];
}

export function getChoreOccurrencesInRange(
  chore: Chore,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  if (chore.completed && !chore.recurrence) {
    return [];
  }

  const occurrences: Date[] = [];
  let currentDate = parseISO(chore.dueDate);

  // If no recurrence, just check if the due date falls within range
  if (!chore.recurrence) {
    if (
      (isAfter(currentDate, rangeStart) || isSameDay(currentDate, rangeStart)) &&
      (isBefore(currentDate, rangeEnd) || isSameDay(currentDate, rangeEnd))
    ) {
      occurrences.push(currentDate);
    }
    return occurrences;
  }

  // For recurring chores, generate occurrences
  // Start from before the range to catch occurrences that start earlier
  while (isBefore(currentDate, rangeStart)) {
    currentDate = parseISO(getNextOccurrence(currentDate.toISOString().split('T')[0], chore.recurrence));
  }

  // Add occurrences within the range
  while (isBefore(currentDate, rangeEnd) || isSameDay(currentDate, rangeEnd)) {
    occurrences.push(new Date(currentDate));
    currentDate = parseISO(getNextOccurrence(currentDate.toISOString().split('T')[0], chore.recurrence));
  }

  return occurrences;
}
