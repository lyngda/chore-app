import { getMonthDays, isSameDayAs, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from '../../utils/dateUtils';
import { getChoreOccurrencesInRange } from '../../utils/recurrenceUtils';
import { useChores } from '../../context/ChoreContext';
import type { Chore } from '../../types';
import { DayCell } from './DayCell';

interface MonthViewProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onChoreClick: (chore: Chore) => void;
  onChoreComplete: (choreId: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthView({ currentDate, onDateClick, onChoreClick, onChoreComplete }: MonthViewProps) {
  const { chores } = useChores();
  const days = getMonthDays(currentDate);

  // Calculate the range for the visible calendar
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const getChoresForDate = (date: Date): Chore[] => {
    return chores.filter((chore) => {
      if (chore.completed) return false;

      const occurrences = getChoreOccurrencesInRange(chore, calendarStart, calendarEnd);
      return occurrences.some((occ) => isSameDayAs(occ, date));
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-7 border-l border-t border-gray-200">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-2 py-3 text-sm font-semibold text-gray-700 text-center bg-gray-50 border-r border-b border-gray-200"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-[repeat(auto-fill,minmax(100px,1fr))] border-l border-gray-200">
        {days.map((date) => (
          <DayCell
            key={date.toISOString()}
            date={date}
            currentMonth={currentDate}
            chores={getChoresForDate(date)}
            onDateClick={onDateClick}
            onChoreClick={onChoreClick}
            onChoreComplete={onChoreComplete}
          />
        ))}
      </div>
    </div>
  );
}
