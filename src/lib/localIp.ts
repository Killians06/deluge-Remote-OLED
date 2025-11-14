/**
 * Check if an IP address is a private/local IP
 */
function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;
  
  // 192.168.0.0 - 192.168.255.255
  if (parts[0] === 192 && parts[1] === 168) return true;
  
  // 10.0.0.0 - 10.255.255.255
  if (parts[0] === 10) return true;
  
  // 172.16.0.0 - 172.31.255.255
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  
  return false;
}

/**
 * Get the local IP address using WebRTC
 * This allows mobile devices on the same network to access the stream
 */
export async function getLocalIP(): Promise<string | null> {
  // Check environment variable first (highest priority)
  const envIP = import.meta.env.VITE_LOCAL_IP;
  if (envIP && isPrivateIP(envIP)) {
    console.log('[getLocalIP] Using environment variable IP:', envIP);
    return envIP;
  }

  // Check localStorage for manually configured IP
  const manualIP = localStorage.getItem('deluge_local_ip');
  if (manualIP && isPrivateIP(manualIP)) {
    console.log('[getLocalIP] Using manually configured IP:', manualIP);
    return manualIP;
  }

  return new Promise((resolve) => {
    const RTCPeerConnection = 
      window.RTCPeerConnection || 
      (window as any).webkitRTCPeerConnection || 
      (window as any).mozRTCPeerConnection;

    if (!RTCPeerConnection) {
      console.warn('[getLocalIP] WebRTC not supported');
      resolve(null);
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 0
    });

    pc.createDataChannel('', { ordered: true });
    
    const candidates: string[] = [];
    let resolved = false;
    
    const resolveOnce = (ip: string | null) => {
      if (!resolved) {
        resolved = true;
        try {
          pc.close();
        } catch (e) {
          // Ignore close errors
        }
        resolve(ip);
      }
    };
    
    // Improved candidate parsing
    const parseCandidate = (candidateString: string): string | null => {
      // Try multiple patterns to extract IP
      // Pattern 1: candidate:... host ... (standard format)
      let match = candidateString.match(/host\s+([0-9]{1,3}(\.[0-9]{1,3}){3})/i);
      if (match) {
        return match[1];
      }
      
      // Pattern 2: candidate:... raddr ... (relay address)
      match = candidateString.match(/raddr\s+([0-9]{1,3}(\.[0-9]{1,3}){3})/i);
      if (match) {
        return match[1];
      }
      
      // Pattern 3: Just look for IP pattern anywhere
      match = candidateString.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
      if (match) {
        return match[1];
      }
      
      return null;
    };
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate.candidate;
        console.log('[getLocalIP] ICE candidate:', candidate);
        
        const ip = parseCandidate(candidate);
        if (ip) {
          // Only collect private IPs, exclude localhost
          if (ip !== '127.0.0.1' && ip !== '0.0.0.0' && isPrivateIP(ip)) {
            if (!candidates.includes(ip)) {
              candidates.push(ip);
              console.log('[getLocalIP] Found private IP candidate:', ip);
            }
          } else {
            console.log('[getLocalIP] Ignored IP (not private):', ip);
          }
        }
      } else {
        // All candidates have been gathered
        console.log('[getLocalIP] All candidates gathered, found:', candidates.length);
        if (candidates.length > 0 && !resolved) {
          // Prefer 192.168.x.x over others
          const preferred = candidates.find(ip => ip.startsWith('192.168.')) || candidates[0];
          console.log('[getLocalIP] Selected local IP:', preferred, 'from candidates:', candidates);
          resolveOnce(preferred);
        } else if (!resolved) {
          console.warn('[getLocalIP] No private IP found in candidates');
        }
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log('[getLocalIP] ICE gathering state:', pc.iceGatheringState);
      if (pc.iceGatheringState === 'complete' && !resolved) {
        if (candidates.length > 0) {
          const preferred = candidates.find(ip => ip.startsWith('192.168.')) || candidates[0];
          console.log('[getLocalIP] Gathering complete - Selected:', preferred);
          resolveOnce(preferred);
        } else {
          console.warn('[getLocalIP] Gathering complete but no candidates found');
        }
      }
    };

    pc.createOffer({ offerToReceiveAudio: false, offerToReceiveVideo: false })
      .then(offer => {
        return pc.setLocalDescription(offer);
      })
      .catch(err => {
        console.warn('[getLocalIP] Failed to create offer:', err);
        resolveOnce(null);
      });

    // Timeout after 5 seconds (increased from 3)
    setTimeout(() => {
      if (candidates.length > 0 && !resolved) {
        const preferred = candidates.find(ip => ip.startsWith('192.168.')) || candidates[0];
        console.log('[getLocalIP] Timeout - Selected local IP:', preferred);
        resolveOnce(preferred);
      } else if (!resolved) {
        console.warn('[getLocalIP] Timeout - No private IP found');
        resolveOnce(null);
      }
    }, 5000);
  });
}

/**
 * Get the network URL (using local IP if available, otherwise current hostname)
 */
export async function getNetworkUrl(port?: number): Promise<string> {
  const currentUrl = new URL(window.location.href);
  const portToUse = port || parseInt(currentUrl.port, 10) || (currentUrl.protocol === 'https:' ? 443 : 5173);
  
  // Check environment variable first (highest priority)
  const envIP = import.meta.env.VITE_LOCAL_IP;
  if (envIP && isPrivateIP(envIP)) {
    const url = `${currentUrl.protocol}//${envIP}:${portToUse}`;
    console.log('[getNetworkUrl] Using environment variable IP:', url);
    return url;
  }
  
  // Check for manually configured IP in localStorage
  const manualIP = localStorage.getItem('deluge_local_ip');
  if (manualIP && isPrivateIP(manualIP)) {
    const url = `${currentUrl.protocol}//${manualIP}:${portToUse}`;
    console.log('[getNetworkUrl] Using manually configured IP:', url);
    return url;
  }

  // If already using a private IP address, use it
  if (currentUrl.hostname.match(/^[0-9]{1,3}(\.[0-9]{1,3}){3}$/)) {
    if (isPrivateIP(currentUrl.hostname)) {
      console.log('[getNetworkUrl] Already using private IP:', currentUrl.hostname);
      return `${currentUrl.protocol}//${currentUrl.hostname}:${portToUse}`;
    }
  }

  // If using localhost, try to get local IP
  if (currentUrl.hostname === 'localhost' || currentUrl.hostname === '127.0.0.1') {
    console.log('[getNetworkUrl] Detecting local IP for localhost...');
    const localIP = await getLocalIP();
    if (localIP) {
      const url = `${currentUrl.protocol}//${localIP}:${portToUse}`;
      console.log('[getNetworkUrl] Using detected local IP:', url);
      return url;
    } else {
      console.warn('[getNetworkUrl] Could not detect local IP, falling back to localhost');
      console.warn('[getNetworkUrl] You can manually set your IP by running: localStorage.setItem("deluge_local_ip", "192.168.1.X")');
    }
  }

  // Fallback to current hostname
  const fallback = `${currentUrl.protocol}//${currentUrl.hostname}:${portToUse}`;
  console.log('[getNetworkUrl] Fallback to:', fallback);
  return fallback;
}

/**
 * Set the local IP manually (useful if WebRTC detection fails)
 * Call this in the browser console: setLocalIP('192.168.1.100')
 */
export function setLocalIP(ip: string): void {
  if (isPrivateIP(ip)) {
    localStorage.setItem('deluge_local_ip', ip);
    console.log('[setLocalIP] Local IP set to:', ip);
  } else {
    console.error('[setLocalIP] Invalid private IP:', ip);
  }
}

/**
 * Clear manually set local IP
 */
export function clearLocalIP(): void {
  localStorage.removeItem('deluge_local_ip');
  console.log('[clearLocalIP] Manual IP cleared');
}
