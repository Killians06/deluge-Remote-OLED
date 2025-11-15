// src/lib/streamService.ts
import { signal } from '@preact/signals';
import { getNetworkUrl, getLocalIP } from './localIp';

export const streamActive = signal<boolean>(false);
export const streamUrl = signal<string | null>(null);
export const streamToken = signal<string | null>(null);
export const streamError = signal<string | null>(null);

let ws: WebSocket | null = null;
let frameInterval: number | null = null;
let lastFrameTime = 0;
let cachedNetworkUrl: string | null = null;

const STREAM_SERVER_URL = import.meta.env.VITE_STREAM_SERVER_URL || 'ws://localhost:3001';
const FRAME_RATE = 25;
const JPEG_QUALITY = 0.6;
const MAX_STREAM_WIDTH = 640;

/**
 * Generate a unique token for this streaming session
 */
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Downscale canvas if too large for streaming
 */
function prepareCanvasForStream(canvas: HTMLCanvasElement): HTMLCanvasElement {
  if (canvas.width <= MAX_STREAM_WIDTH) {
    return canvas;
  }

  const scale = MAX_STREAM_WIDTH / canvas.width;
  const streamCanvas = document.createElement('canvas');
  streamCanvas.width = MAX_STREAM_WIDTH;
  streamCanvas.height = canvas.height * scale;
  
  const ctx = streamCanvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, streamCanvas.width, streamCanvas.height);
  }
  
  return streamCanvas;
}

/**
 * Update stream URL with detected local IP
 */
async function updateStreamUrl(token: string): Promise<void> {
  const currentUrl = new URL(window.location.href);
  const port = parseInt(currentUrl.port, 10) || (currentUrl.protocol === 'https:' ? 443 : 5173);
  
  // Force detection of local IP
  console.log('[streamService] Detecting local IP for stream URL...');
  const networkUrl = await getNetworkUrl(port);
  
  // If we got localhost, try to get IP directly
  if (networkUrl.includes('localhost') || networkUrl.includes('127.0.0.1')) {
    console.log('[streamService] Still got localhost, trying direct IP detection...');
    const localIP = await getLocalIP();
    if (localIP) {
      const newUrl = `${currentUrl.protocol}//${localIP}:${port}/stream?token=${token}`;
      console.log('[streamService] Using detected IP:', newUrl);
      streamUrl.value = newUrl;
      cachedNetworkUrl = `${currentUrl.protocol}//${localIP}:${port}`;
      return;
    }
  }
  
  const streamPageUrl = `${networkUrl}/stream?token=${token}`;
  console.log('[streamService] Stream URL generated:', streamPageUrl);
  streamUrl.value = streamPageUrl;
  cachedNetworkUrl = networkUrl;
}

/**
 * Start streaming canvas frames to WebSocket server
 */
export async function startStreaming(canvas: HTMLCanvasElement): Promise<void> {
  if (streamActive.value) {
    console.warn('Streaming already active');
    return;
  }

  const token = generateToken();
  streamToken.value = token;
  streamError.value = null;
  lastFrameTime = 0;
  
  console.log('Attempting to connect to stream server:', STREAM_SERVER_URL);
  
  // Connect to WebSocket server as producer
  const url = `${STREAM_SERVER_URL}?role=producer&token=${token}`;
  ws = new WebSocket(url);

  ws.onopen = async () => {
    console.log('Stream connection established');
    streamActive.value = true;
    streamError.value = null;
    
    // Generate stream URL for QR code - wait for IP detection
    await updateStreamUrl(token);
    
    const targetFrameTime = 1000 / FRAME_RATE;
    
    const captureFrame = () => {
      if (!ws || ws.readyState !== WebSocket.OPEN || !canvas) {
        return;
      }

      try {
        const streamCanvas = prepareCanvasForStream(canvas);
        const dataUrl = streamCanvas.toDataURL('image/jpeg', JPEG_QUALITY);
        const base64Data = dataUrl.split(',')[1];
        
        if (base64Data && ws.readyState === WebSocket.OPEN) {
          ws.send(base64Data);
        }
      } catch (err) {
        console.error('Error capturing frame:', err);
      }
    };
    
    frameInterval = window.setInterval(captureFrame, targetFrameTime) as unknown as number;
  };

  ws.onerror = (error) => {
    console.error('Stream connection error:', error);
    streamError.value = 'Impossible de se connecter au serveur de streaming. Assurez-vous que le serveur est démarré (yarn dev:server).';
    stopStreaming();
  };

  ws.onclose = (event) => {
    console.log('Stream connection closed', event.code, event.reason);
    if (event.code !== 1000) {
      if (!streamError.value) {
        streamError.value = 'Connexion fermée. Vérifiez que le serveur WebSocket est démarré.';
      }
    }
    stopStreaming();
  };
}

/**
 * Stop streaming
 */
export function stopStreaming(): void {
  if (frameInterval !== null) {
    window.clearInterval(frameInterval);
    frameInterval = null;
  }
  
  if (ws) {
    ws.close();
    ws = null;
  }
  
  streamActive.value = false;
  streamUrl.value = null;
  streamToken.value = null;
  lastFrameTime = 0;
  cachedNetworkUrl = null;
}