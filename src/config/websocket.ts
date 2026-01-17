export const WEBSOCKET_CONFIG = {
  url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
};
