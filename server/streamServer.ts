// server/streamServer.ts
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { parse } from 'url';

const PORT = 3001;
const server = createServer();
const wss = new WebSocketServer({ 
  server,
  perMessageDeflate: false,
});

// Store active connections
const clients = new Set<WebSocket>();
let latestFrame: string | null = null;
let frameCounter = 0;

wss.on('connection', (ws: WebSocket, req) => {
  const { query } = parse(req.url || '', true);
  
  // Client producer (desktop app)
  if (query.role === 'producer') {
    console.log('Producer connected');
    
    ws.on('message', (data: Buffer) => {
      latestFrame = data.toString('utf-8');
      frameCounter++;
      
      const frameMessage = JSON.stringify({ 
        type: 'frame', 
        data: latestFrame,
        timestamp: Date.now(),
        frameId: frameCounter
      });
      
      let sentCount = 0;
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          try {
            client.send(frameMessage, { binary: false });
            sentCount++;
          } catch (err) {
            console.error('Error sending frame to client:', err);
            clients.delete(client);
          }
        }
      });
      
      // Log toutes les 25 frames
      if (frameCounter % 25 === 0) {
        console.log(`Frame ${frameCounter} broadcasted to ${sentCount} consumers (total clients: ${clients.size})`);
      }
    });
    
    ws.on('close', () => {
      console.log('Producer disconnected');
      latestFrame = null;
      frameCounter = 0;
    });
    
    ws.on('error', (error) => {
      console.error('Producer error:', error);
    });
  } 
  // Client consumer (mobile)
  else if (query.role === 'consumer') {
    console.log('Consumer connected, total consumers:', clients.size + 1);
    clients.add(ws);
    
    // Envoyer la dernière frame immédiatement si disponible
    if (latestFrame) {
      try {
        ws.send(JSON.stringify({ 
          type: 'frame', 
          data: latestFrame,
          timestamp: Date.now(),
          frameId: frameCounter
        }));
        console.log('Sent initial frame to consumer (frameId:', frameCounter, ')');
      } catch (err) {
        console.error('Error sending initial frame:', err);
      }
    } else {
      console.log('No frame available yet for consumer');
    }
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('Consumer disconnected, remaining:', clients.size);
    });
    
    ws.on('error', (error) => {
      console.error('Consumer error:', error);
      clients.delete(ws);
    });
  }
});

// Écouter sur toutes les interfaces réseau (0.0.0.0)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Stream server running on ws://0.0.0.0:${PORT}`);
  console.log(`Accessible from network at ws://192.168.1.98:${PORT}`);
});

export { server, PORT };