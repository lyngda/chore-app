import { WebSocketServer, WebSocket } from 'ws';

interface Chore {
  id: string;
  title: string;
  description: string;
  assigneeId: string | null;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  recurrence: { type: 'daily' | 'weekly' | 'monthly'; interval: number } | null;
  completed: boolean;
}

interface CompletedChore {
  id: string;
  choreId: string;
  choreTitle: string;
  completedAt: string;
  completedBy: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  color: string;
}

interface SyncMessage {
  type: 'sync';
  entity: 'chores' | 'completedChores' | 'team';
  data: Chore[] | CompletedChore[] | TeamMember[];
}

interface UpdateMessage {
  type: 'update';
  entity: 'chores' | 'completedChores' | 'team';
  data: Chore[] | CompletedChore[] | TeamMember[];
}

interface StateRequestMessage {
  type: 'request-state';
}

interface FullStateMessage {
  type: 'full-state';
  chores: Chore[];
  completedChores: CompletedChore[];
  team: TeamMember[];
}

type ClientMessage = SyncMessage | StateRequestMessage;
type ServerMessage = UpdateMessage | FullStateMessage;

// In-memory state storage
const state = {
  chores: [] as Chore[],
  completedChores: [] as CompletedChore[],
  team: [] as TeamMember[],
};

const PORT = parseInt(process.env.WS_PORT || '8080', 10);

const wss = new WebSocketServer({ port: PORT });

const clients = new Set<WebSocket>();

function broadcast(message: ServerMessage, exclude?: WebSocket) {
  const data = JSON.stringify(message);
  for (const client of clients) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

function sendFullState(client: WebSocket) {
  const message: FullStateMessage = {
    type: 'full-state',
    chores: state.chores,
    completedChores: state.completedChores,
    team: state.team,
  };
  client.send(JSON.stringify(message));
}

wss.on('connection', (ws) => {
  console.log('Client connected. Total clients:', clients.size + 1);
  clients.add(ws);

  // Send current state to new client
  sendFullState(ws);

  ws.on('message', (rawData) => {
    try {
      const message = JSON.parse(rawData.toString()) as ClientMessage;

      if (message.type === 'request-state') {
        sendFullState(ws);
        return;
      }

      if (message.type === 'sync') {
        // Update server state
        if (message.entity === 'chores') {
          state.chores = message.data as Chore[];
        } else if (message.entity === 'completedChores') {
          state.completedChores = message.data as CompletedChore[];
        } else if (message.entity === 'team') {
          state.team = message.data as TeamMember[];
        }

        console.log(`State updated: ${message.entity} (${message.data.length} items)`);

        // Broadcast to all other clients
        const updateMessage: UpdateMessage = {
          type: 'update',
          entity: message.entity,
          data: message.data,
        };
        broadcast(updateMessage, ws);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total clients:', clients.size);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
