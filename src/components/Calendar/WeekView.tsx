import { getWeekDays, isSameDayAs, startOfWeek, endOfWeek } from '../../utils/dateUtils';
import { getChoreOccurrencesInRange } from '../../utils/recurrenceUtils';
import { useChores } from '../../context/ChoreContext';
import type { Chore } from '../../types';
import { DayCell } from './DayCell';
import { format } from 'date-fns';

interface WeekViewProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onChoreClick: (chore: Chore) => void;
  onChoreComplete: (choreId: string) => void;
}

export function WeekView({ currentDate, onDateClick, onChoreClick, onChoreComplete }: WeekViewProps) {
  const { chores } = useChores();
  const days = getWeekDays(currentDate);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  const getChoresForDate = (date: Date): Chore[] => {
    return chores.filter((chore) => {
      if (chore.completed) return false;

      const occurrences = getChoreOccurrencesInRange(chore, weekStart, weekEnd);
      return occurrences.some((occ) => isSameDayAs(occ, date));
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-7 border-l border-t border-gray-200">
        {days.map((date) => (
          <div
            key={date.toISOString()}
            className="px-2 py-3 text-center bg-gray-50 border-r border-b border-gray-200"
          >
            <div className="text-sm font-semibold text-gray-700">
              {format(date, 'EEE')}
            </div>
            <div className="text-xs text-gray-500">
              {format(date, 'MMM d')}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 border-l border-gray-200">
        {days.map((date) => (
          <DayCell
            key={date.toISOString()}
            date={date}
            currentMonth={currentDate}
            chores={getChoresForDate(date)}
            onDateClick={onDateClick}
            onChoreClick={onChoreClick}
            onChoreComplete={onChoreComplete}
            isWeekView
          />
        ))}
      </div>
    </div>
  );
}
