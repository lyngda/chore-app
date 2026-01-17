import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Chore, CompletedChore, Priority, RecurrenceRule } from '../types';
import { getNextOccurrence } from '../utils/recurrenceUtils';

interface ChoreInput {
  title: string;
  description: string;
  assigneeId: string | null;
  priority: Priority;
  dueDate: string;
  recurrence: RecurrenceRule | null;
}

interface ChoreContextType {
  chores: Chore[];
  completedChores: CompletedChore[];
  addChore: (chore: ChoreInput) => void;
  updateChore: (id: string, updates: Partial<ChoreInput>) => void;
  deleteChore: (id: string) => void;
  completeChore: (id: string, completedBy: string | null) => void;
}

const ChoreContext = createContext<ChoreContextType | null>(null);

export function ChoreProvider({ children }: { children: ReactNode }) {
  const [chores, setChores] = useLocalStorage<Chore[]>('chore-app-chores', []);
  const [completedChores, setCompletedChores] = useLocalStorage<CompletedChore[]>('chore-app-completed', []);

  const addChore = useCallback((input: ChoreInput) => {
    const newChore: Chore = {
      id: crypto.randomUUID(),
      ...input,
      completed: false,
    };
    setChores((prev) => [...prev, newChore]);
  }, [setChores]);

  const updateChore = useCallback((id: string, updates: Partial<ChoreInput>) => {
    setChores((prev) =>
      prev.map((chore) =>
        chore.id === id ? { ...chore, ...updates } : chore
      )
    );
  }, [setChores]);

  const deleteChore = useCallback((id: string) => {
    setChores((prev) => prev.filter((chore) => chore.id !== id));
  }, [setChores]);

  const completeChore = useCallback((id: string, completedBy: string | null) => {
    setChores((prev) => {
      const chore = prev.find((c) => c.id === id);
      if (!chore) return prev;

      // Add to completed log
      const completedEntry: CompletedChore = {
        id: crypto.randomUUID(),
        choreId: chore.id,
        choreTitle: chore.title,
        completedAt: new Date().toISOString(),
        completedBy,
      };
      setCompletedChores((prevCompleted) => [completedEntry, ...prevCompleted]);

      // If recurring, update due date; otherwise mark as completed
      if (chore.recurrence) {
        return prev.map((c) =>
          c.id === id
            ? { ...c, dueDate: getNextOccurrence(c.dueDate, c.recurrence!) }
            : c
        );
      } else {
        return prev.map((c) =>
          c.id === id ? { ...c, completed: true } : c
        );
      }
    });
  }, [setChores, setCompletedChores]);

  return (
    <ChoreContext.Provider value={{ chores, completedChores, addChore, updateChore, deleteChore, completeChore }}>
      {children}
    </ChoreContext.Provider>
  );
}

export function useChores() {
  const context = useContext(ChoreContext);
  if (!context) {
    throw new Error('useChores must be used within a ChoreProvider');
  }
  return context;
}
