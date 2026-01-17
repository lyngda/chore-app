import { isToday, isSameMonth } from 'date-fns';
import type { Chore } from '../../types';
import { ChoreCard } from '../Chores/ChoreCard';

interface DayCellProps {
  date: Date;
  currentMonth: Date;
  chores: Chore[];
  onDateClick: (date: Date) => void;
  onChoreClick: (chore: Chore) => void;
  onChoreComplete: (choreId: string) => void;
  isWeekView?: boolean;
}

export function DayCell({
  date,
  currentMonth,
  chores,
  onDateClick,
  onChoreClick,
  onChoreComplete,
  isWeekView = false,
}: DayCellProps) {
  const today = isToday(date);
  const inCurrentMonth = isSameMonth(date, currentMonth);
  const dayNumber = date.getDate();

  const maxChores = isWeekView ? 10 : 3;
  const visibleChores = chores.slice(0, maxChores);
  const hiddenCount = chores.length - maxChores;

  return (
    <div
      className={`min-h-[100px] border-r border-b border-gray-200 p-1 ${
        inCurrentMonth ? 'bg-white' : 'bg-gray-50'
      } ${isWeekView ? 'min-h-[400px]' : ''}`}
    >
      <button
        onClick={() => onDateClick(date)}
        className={`w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full mb-1 hover:bg-gray-100 transition-colors ${
          today
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : inCurrentMonth
            ? 'text-gray-900'
            : 'text-gray-400'
        }`}
      >
        {dayNumber}
      </button>
      <div className="space-y-1">
        {visibleChores.map((chore) => (
          <ChoreCard
            key={chore.id}
            chore={chore}
            onClick={() => onChoreClick(chore)}
            onComplete={() => onChoreComplete(chore.id)}
            compact
          />
        ))}
        {hiddenCount > 0 && (
          <button
            onClick={() => onDateClick(date)}
            className="w-full text-xs text-gray-500 hover:text-gray-700 py-0.5"
          >
            +{hiddenCount} more
          </button>
        )}
      </div>
    </div>
  );
}
