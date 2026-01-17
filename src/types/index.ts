export interface TeamMember {
  id: string;
  name: string;
  color: string;
}

export type RecurrenceType = 'daily' | 'weekly' | 'monthly';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Chore {
  id: string;
  title: string;
  description: string;
  assigneeId: string | null;
  priority: Priority;
  dueDate: string;
  recurrence: RecurrenceRule | null;
  completed: boolean;
}

export interface CompletedChore {
  id: string;
  choreId: string;
  choreTitle: string;
  completedAt: string;
  completedBy: string | null;
}

export type CalendarView = 'week' | 'month';
