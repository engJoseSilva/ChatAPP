import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

type Message = {
  id: number;
  user: string;
  text: string;
  timestamp: number;
};




let messages: Message[] = [];
let clients: Map<WebSocket, number> = new Map();

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
let lastId = 0;
  console.log('Client connected');

  // Assign client a lastReceivedId (0 for new users)
  clients.set(ws, 0);

  // Send full message history to new connection
  ws.send(JSON.stringify({ type: 'init', messages }));

  ws.on('message', (data) => {
    const parsed = JSON.parse(data.toString());

    if (parsed.type === 'message') {
      const newMsg: Message = {
        id:++lastId,
        user: parsed.user || 'Anonymous',
        text: parsed.text,
        timestamp: Date.now(),
      };
      messages.push(newMsg);

      // Broadcast to all connected clients
      for (const [client, _] of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'new', message: newMsg }));
        }
      }
    } else if (parsed.type === 'sync' && typeof parsed.lastReceivedId === 'number') {
      const lastId = parsed.lastReceivedId;
      const missed = messages.filter((m) => m.id > lastId);
      ws.send(JSON.stringify({ type: 'sync', messages: missed }));
      clients.set(ws, messages.length);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('WebSocket server running on ws://localhost:4000');
});