// src/pages/StreamPage.tsx
import { useEffect, useRef, useState } from 'preact/hooks';
import { getNetworkUrl } from '../lib/localIp';

export function StreamPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const isRenderingRef = useRef<boolean>(false);
  const latestFrameRef = useRef<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (!token) {
      setError('Token manquant');
      return;
    }

    // Get network URL for WebSocket connection
    const initConnection = async () => {
      try {
        // Get the current URL to extract port
        const currentUrl = new URL(window.location.href);
        const wsPort = '3001';
        
        // Get network URL and extract hostname
        const networkUrl = await getNetworkUrl();
        const wsHost = networkUrl.replace(/^https?:\/\//, '').split(':')[0];
        
        // Use local IP for WebSocket if we're on localhost
        let wsHostToUse = wsHost;
        if (currentUrl.hostname === 'localhost' || currentUrl.hostname === '127.0.0.1') {
          // Try to get local IP for WebSocket too
          const localIP = await import('../lib/localIp').then(m => m.getLocalIP());
          if (localIP) {
            wsHostToUse = localIP;
          }
        }
        
        const STREAM_SERVER_URL = `ws://${wsHostToUse}:${wsPort}`;
        const url = `${STREAM_SERVER_URL}?role=consumer&token=${token}`;
        
        console.log('Connecting to stream server:', url);
        
        const ws = new WebSocket(url);
        wsRef.current = ws;

        const renderFrame = (base64Data: string) => {
          if (!canvasRef.current) {
            return;
          }

          if (isRenderingRef.current) {
            latestFrameRef.current = base64Data;
            return;
          }

          isRenderingRef.current = true;
          const ctx = canvasRef.current.getContext('2d', { 
            alpha: false,
            desynchronized: true
          });
          
          if (!ctx) {
            isRenderingRef.current = false;
            return;
          }

          const img = new Image();
          img.onload = () => {
            if (canvasRef.current && ctx) {
              if (canvasRef.current.width !== img.width || canvasRef.current.height !== img.height) {
                canvasRef.current.width = img.width;
                canvasRef.current.height = img.height;
              }
              ctx.drawImage(img, 0, 0);
              setFrameCount(prev => prev + 1);
            }
            isRenderingRef.current = false;
            
            if (latestFrameRef.current) {
              const nextFrame = latestFrameRef.current;
              latestFrameRef.current = null;
              setTimeout(() => renderFrame(nextFrame), 0);
            }
          };
          
          img.onerror = (err) => {
            console.error('Error loading image:', err);
            isRenderingRef.current = false;
            latestFrameRef.current = null;
          };
          
          img.src = `data:image/jpeg;base64,${base64Data}`;
        };

        ws.onopen = () => {
          console.log('Connected to stream');
          setConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'frame' && message.data) {
              renderFrame(message.data);
            } else {
              console.warn('Unknown message type:', message);
            }
          } catch (err) {
            console.error('Error processing frame:', err);
          }
        };

        ws.onerror = (err) => {
          console.error('WebSocket error:', err);
          setError('Erreur de connexion au serveur de streaming. Vérifiez que le serveur WebSocket est démarré.');
          setConnected(false);
        };

        ws.onclose = (event) => {
          console.log('Stream disconnected', event.code, event.reason);
          setConnected(false);
          if (event.code !== 1000) {
            setError('Connexion fermée par le serveur');
          }
        };
      } catch (err) {
        console.error('Error initializing connection:', err);
        setError('Erreur lors de l\'initialisation de la connexion');
      }
    };

    initConnection();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      isRenderingRef.current = false;
      latestFrameRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {error && (
          <div className="bg-red-500 text-white p-4 rounded mb-4">
            <p className="font-semibold mb-1">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {!connected && !error && (
          <div className="text-white text-center mb-4">
            <p>Connexion au stream...</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full border border-gray-700 bg-black"
          style={{ imageRendering: 'pixelated' }}
        />
        {connected && (
          <div className="text-green-500 text-center mt-2 text-sm">
            <p>Stream actif</p>
            {frameCount > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {frameCount} frame(s) reçue(s)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}