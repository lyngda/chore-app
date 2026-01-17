import { createContext, useContext, type ReactNode } from 'react';
import { useWebSocketSync } from '../hooks/useWebSocketSync';
import type { Chore, CompletedChore, TeamMember } from '../types';

interface WebSocketSyncContextType {
  chores: Chore[];
  setChores: (value: Chore[] | ((prev: Chore[]) => Chore[])) => void;
  completedChores: CompletedChore[];
  setCompletedChores: (value: CompletedChore[] | ((prev: CompletedChore[]) => CompletedChore[])) => void;
  team: TeamMember[];
  setTeam: (value: TeamMember[] | ((prev: TeamMember[]) => TeamMember[])) => void;
  isConnected: boolean;
}

const WebSocketSyncContext = createContext<WebSocketSyncContextType | null>(null);

export function WebSocketSyncProvider({ children }: { children: ReactNode }) {
  const { state, setChores, setCompletedChores, setTeam, isConnected } = useWebSocketSync();

  return (
    <WebSocketSyncContext.Provider
      value={{
        chores: state.chores,
        setChores,
        completedChores: state.completedChores,
        setCompletedChores,
        team: state.team,
        setTeam,
        isConnected,
      }}
    >
      {children}
    </WebSocketSyncContext.Provider>
  );
}

export function useWebSocketSyncContext() {
  const context = useContext(WebSocketSyncContext);
  if (!context) {
    throw new Error('useWebSocketSyncContext must be used within a WebSocketSyncProvider');
  }
  return context;
}
