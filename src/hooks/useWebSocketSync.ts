import { useState, useEffect, useRef, useCallback } from 'react';
import { WEBSOCKET_CONFIG } from '../config/websocket';
import type { Chore, CompletedChore, TeamMember } from '../types';

type EntityType = 'chores' | 'completedChores' | 'team';
type EntityData = Chore[] | CompletedChore[] | TeamMember[];

interface SyncMessage {
  type: 'sync';
  entity: EntityType;
  data: EntityData;
}

interface UpdateMessage {
  type: 'update';
  entity: EntityType;
  data: EntityData;
}

interface FullStateMessage {
  type: 'full-state';
  chores: Chore[];
  completedChores: CompletedChore[];
  team: TeamMember[];
}

type ServerMessage = UpdateMessage | FullStateMessage;

interface WebSocketSyncState {
  chores: Chore[];
  completedChores: CompletedChore[];
  team: TeamMember[];
}

interface WebSocketSyncReturn {
  state: WebSocketSyncState;
  setChores: (value: Chore[] | ((prev: Chore[]) => Chore[])) => void;
  setCompletedChores: (value: CompletedChore[] | ((prev: CompletedChore[]) => CompletedChore[])) => void;
  setTeam: (value: TeamMember[] | ((prev: TeamMember[]) => TeamMember[])) => void;
  isConnected: boolean;
}

const STORAGE_KEYS = {
  chores: 'chore-app-chores',
  completedChores: 'chore-app-completed',
  team: 'chore-app-team',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error(`Error saving to localStorage key "${key}"`);
  }
}

export function useWebSocketSync(): WebSocketSyncReturn {
  const [state, setState] = useState<WebSocketSyncState>(() => ({
    chores: loadFromStorage<Chore[]>(STORAGE_KEYS.chores, []),
    completedChores: loadFromStorage<CompletedChore[]>(STORAGE_KEYS.completedChores, []),
    team: loadFromStorage<TeamMember[]>(STORAGE_KEYS.team, []),
  }));

  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stateRef = useRef(state);

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const sendSync = useCallback((entity: EntityType, data: EntityData) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: SyncMessage = { type: 'sync', entity, data };
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendSyncRef = useRef(sendSync);
  useEffect(() => {
    sendSyncRef.current = sendSync;
  }, [sendSync]);

  const setChores = useCallback((value: Chore[] | ((prev: Chore[]) => Chore[])) => {
    setState((prev) => {
      const newChores = typeof value === 'function' ? value(prev.chores) : value;
      saveToStorage(STORAGE_KEYS.chores, newChores);
      sendSync('chores', newChores);
      return { ...prev, chores: newChores };
    });
  }, [sendSync]);

  const setCompletedChores = useCallback((value: CompletedChore[] | ((prev: CompletedChore[]) => CompletedChore[])) => {
    setState((prev) => {
      const newCompleted = typeof value === 'function' ? value(prev.completedChores) : value;
      saveToStorage(STORAGE_KEYS.completedChores, newCompleted);
      sendSync('completedChores', newCompleted);
      return { ...prev, completedChores: newCompleted };
    });
  }, [sendSync]);

  const setTeam = useCallback((value: TeamMember[] | ((prev: TeamMember[]) => TeamMember[])) => {
    setState((prev) => {
      const newTeam = typeof value === 'function' ? value(prev.team) : value;
      saveToStorage(STORAGE_KEYS.team, newTeam);
      sendSync('team', newTeam);
      return { ...prev, team: newTeam };
    });
  }, [sendSync]);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(WEBSOCKET_CONFIG.url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Send current local state to server on connect
        // Server will merge with existing state (last-write-wins)
        const localChores = loadFromStorage<Chore[]>(STORAGE_KEYS.chores, []);
        const localCompleted = loadFromStorage<CompletedChore[]>(STORAGE_KEYS.completedChores, []);
        const localTeam = loadFromStorage<TeamMember[]>(STORAGE_KEYS.team, []);

        if (localChores.length > 0) {
          sendSyncRef.current('chores', localChores);
        }
        if (localCompleted.length > 0) {
          sendSyncRef.current('completedChores', localCompleted);
        }
        if (localTeam.length > 0) {
          sendSyncRef.current('team', localTeam);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as ServerMessage;

          if (message.type === 'full-state') {
            // Received full state from server - use it if it has data
            const currentState = stateRef.current;
            const newState: WebSocketSyncState = {
              chores: message.chores.length > 0 ? message.chores : currentState.chores,
              completedChores: message.completedChores.length > 0 ? message.completedChores : currentState.completedChores,
              team: message.team.length > 0 ? message.team : currentState.team,
            };
            setState(newState);
            saveToStorage(STORAGE_KEYS.chores, newState.chores);
            saveToStorage(STORAGE_KEYS.completedChores, newState.completedChores);
            saveToStorage(STORAGE_KEYS.team, newState.team);
          } else if (message.type === 'update') {
            // Received update from another client
            setState((prev) => {
              const newState = { ...prev };
              if (message.entity === 'chores') {
                newState.chores = message.data as Chore[];
                saveToStorage(STORAGE_KEYS.chores, newState.chores);
              } else if (message.entity === 'completedChores') {
                newState.completedChores = message.data as CompletedChore[];
                saveToStorage(STORAGE_KEYS.completedChores, newState.completedChores);
              } else if (message.entity === 'team') {
                newState.team = message.data as TeamMember[];
                saveToStorage(STORAGE_KEYS.team, newState.team);
              }
              return newState;
            });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt reconnection
        if (reconnectAttemptsRef.current < WEBSOCKET_CONFIG.maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting... (attempt ${reconnectAttemptsRef.current})`);
          reconnectTimeoutRef.current = setTimeout(connect, WEBSOCKET_CONFIG.reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    state,
    setChores,
    setCompletedChores,
    setTeam,
    isConnected,
  };
}
