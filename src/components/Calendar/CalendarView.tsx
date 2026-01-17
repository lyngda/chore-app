import type { CalendarView as CalendarViewType, Chore } from '../../types';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';

interface CalendarViewProps {
  view: CalendarViewType;
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onChoreClick: (chore: Chore) => void;
  onChoreComplete: (choreId: string) => void;
}

export function CalendarView({
  view,
  currentDate,
  onDateClick,
  onChoreClick,
  onChoreComplete,
}: CalendarViewProps) {
  if (view === 'week') {
    return (
      <WeekView
        currentDate={currentDate}
        onDateClick={onDateClick}
        onChoreClick={onChoreClick}
        onChoreComplete={onChoreComplete}
      />
    );
  }

  return (
    <MonthView
      currentDate={currentDate}
      onDateClick={onDateClick}
      onChoreClick={onChoreClick}
      onChoreComplete={onChoreComplete}
    />
  );
}
