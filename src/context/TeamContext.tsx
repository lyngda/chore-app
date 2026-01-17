import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { TeamMember } from '../types';

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

interface TeamContextType {
  members: TeamMember[];
  addMember: (name: string) => void;
  removeMember: (id: string) => void;
  getMember: (id: string) => TeamMember | undefined;
}

const TeamContext = createContext<TeamContextType | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useLocalStorage<TeamMember[]>('chore-app-team', []);

  const addMember = useCallback((name: string) => {
    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name,
      color: COLORS[members.length % COLORS.length],
    };
    setMembers((prev) => [...prev, newMember]);
  }, [members.length, setMembers]);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, [setMembers]);

  const getMember = useCallback((id: string) => {
    return members.find((m) => m.id === id);
  }, [members]);

  return (
    <TeamContext.Provider value={{ members, addMember, removeMember, getMember }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
