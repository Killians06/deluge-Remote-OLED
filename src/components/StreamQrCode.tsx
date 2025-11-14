// src/components/StreamQrCode.tsx
import { useRef, useState, useEffect } from 'preact/hooks';
import { useSignalEffect } from '@preact/signals';
import { streamUrl, streamActive, streamError } from '../lib/streamService';
import { midiOut } from '../state';
import QRCode from 'qrcode';

export function StreamQrCode() {
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [qrCodeError, setQrCodeError] = useState<string | null>(null);
  const lastUrlRef = useRef<string | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  const copyToDisplayCanvas = () => {
    if (!hiddenCanvasRef.current || !displayCanvasRef.current) {
      console.log('[StreamQrCode] Cannot copy - canvas not available', {
        hasHidden: !!hiddenCanvasRef.current,
        hasDisplay: !!displayCanvasRef.current
      });
      // Retry after a short delay
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        copyToDisplayCanvas();
      }, 100);
      return;
    }

    const hiddenCtx = hiddenCanvasRef.current.getContext('2d');
    const displayCtx = displayCanvasRef.current.getContext('2d');
    
    if (hiddenCtx && displayCtx) {
      // S'assurer que le canvas d'affichage a la même taille
      displayCanvasRef.current.width = hiddenCanvasRef.current.width;
      displayCanvasRef.current.height = hiddenCanvasRef.current.height;
      
      // Copier l'image
      displayCtx.drawImage(hiddenCanvasRef.current, 0, 0);
      console.log('[StreamQrCode] QR code copied to display canvas');
      setQrCodeVisible(true);
    } else {
      console.warn('[StreamQrCode] Could not get canvas contexts');
    }
  };

  const generateQRCode = () => {
    const url = streamUrl.value;
    if (!url || !hiddenCanvasRef.current) {
      console.log('[StreamQrCode] Cannot generate QR - missing url or canvas', {
        hasUrl: !!url,
        hasCanvas: !!hiddenCanvasRef.current
      });
      return;
    }

    // Skip if URL hasn't changed and QR is already visible
    if (lastUrlRef.current === url && qrCodeVisible) {
      console.log('[StreamQrCode] QR code already generated for this URL');
      return;
    }

    // Clear any pending retries
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }

    console.log('[StreamQrCode] Generating QR code for:', url);
    lastUrlRef.current = url;
    
    // Générer le QR code sur le canvas caché
    QRCode.toCanvas(
      hiddenCanvasRef.current,
      url,
      {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      },
      (error) => {
        if (error) {
          console.error('[StreamQrCode] QR code generation error:', error);
          setQrCodeError(error.message || 'Erreur lors de la génération du QR code');
          setQrCodeVisible(false);
          
          // Retry after a delay
          retryTimeoutRef.current = window.setTimeout(() => {
            if (streamUrl.value && streamActive.value && midiOut.value && hiddenCanvasRef.current) {
              generateQRCode();
            }
          }, 500);
        } else {
          console.log('[StreamQrCode] QR code generated successfully');
          setQrCodeError(null);
          
          // Copier le contenu du canvas caché vers le canvas d'affichage
          // Utiliser un petit délai pour s'assurer que le canvas est disponible
          copyTimeoutRef.current = window.setTimeout(() => {
            copyToDisplayCanvas();
          }, 50);
        }
      },
    );
  };

  // Observer les changements des signaux streamUrl, streamActive et midiOut
  useSignalEffect(() => {
    const url = streamUrl.value;
    const active = streamActive.value;
    const midiConnected = midiOut.value !== null;

    console.log('[StreamQrCode] State check:', {
      url: !!url,
      active,
      midiConnected,
      hasHiddenCanvas: !!hiddenCanvasRef.current,
      hasDisplayCanvas: !!displayCanvasRef.current,
      urlValue: url,
      qrCodeVisible
    });

    if (url && active && midiConnected) {
      if (!hiddenCanvasRef.current) {
        console.log('[StreamQrCode] Hidden canvas not ready yet, will retry...');
        retryTimeoutRef.current = window.setTimeout(() => {
          if (hiddenCanvasRef.current && streamUrl.value && streamActive.value && midiOut.value) {
            generateQRCode();
          }
        }, 200);
        return;
      }

      // Only generate if URL changed or QR is not visible
      if (lastUrlRef.current !== url || !qrCodeVisible) {
        generateQRCode();
      }
    } else {
      // Only hide if it was visible
      if (qrCodeVisible) {
        console.log('[StreamQrCode] Hiding QR code - conditions not met');
        setQrCodeVisible(false);
        setQrCodeError(null);
        lastUrlRef.current = null;
      }
    }
  });

  // Vérifier à nouveau quand le canvas devient disponible
  useEffect(() => {
    if (hiddenCanvasRef.current && streamUrl.value && streamActive.value && midiOut.value && !qrCodeVisible) {
      console.log('[StreamQrCode] Canvas now available, generating QR code');
      generateQRCode();
    }
  }, [qrCodeVisible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Conditions pour afficher le QR code
  const shouldShow = qrCodeVisible && streamUrl.value && streamActive.value && midiOut.value;
  
  return (
    <>
      {/* Canvas caché pour la génération - toujours présent */}
      <canvas
        ref={hiddenCanvasRef}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {!shouldShow && streamError.value && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <p className="text-sm font-semibold mb-1">Erreur de streaming</p>
          <p className="text-xs">{streamError.value}</p>
          <button
            onClick={() => {
              streamError.value = null;
            }}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* QR Code Popup - le canvas est toujours dans le DOM mais la div est cachée si shouldShow est false */}
      <div 
        className={`fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 ${shouldShow ? '' : 'hidden'}`}
      >
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Scanner pour voir sur mobile
          </h3>
          {qrCodeError && (
            <div className="text-red-500 text-xs mb-2 text-center max-w-[200px]">
              {qrCodeError}
            </div>
          )}
          {/* Canvas d'affichage - toujours présent dans le DOM pour que le ref fonctionne */}
          <canvas
            ref={displayCanvasRef}
            className="border border-gray-300 dark:border-gray-600"
            aria-label="QR Code pour le streaming mobile"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center max-w-[200px]">
            Scannez ce code avec votre téléphone pour voir l'écran du Deluge en temps réel
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-center max-w-[200px] break-all">
            {streamUrl.value}
          </p>
          <button
            onClick={() => {
              streamUrl.value = null;
              setQrCodeVisible(false);
              lastUrlRef.current = null;
            }}
            className="mt-2 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline hover:no-underline"
          >
            Fermer
          </button>
        </div>
      </div>

      {shouldShow && streamError.value && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm mb-4" style={{ marginBottom: '280px' }}>
          <p className="text-sm font-semibold mb-1">Erreur de streaming</p>
          <p className="text-xs">{streamError.value}</p>
          <button
            onClick={() => {
              streamError.value = null;
            }}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Fermer
          </button>
        </div>
      )}
    </>
  );
}