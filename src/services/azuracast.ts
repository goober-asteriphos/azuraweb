import { AzuraCastNowPlaying, AzuraCastRequestSong, ServerConfig } from '../types/azuracast';

const CATEGORY_MAP: Record<string, string> = {
  pop: 'Pop & Hits',
  hits: 'Pop & Hits',
  top40: 'Pop & Hits',
  rock: 'Rock',
  metal: 'Rock & Metal',
  alt: 'Alternative',
  indie: 'Alternative',
  dance: 'Electronic',
  edm: 'Electronic',
  house: 'Electronic',
  chill: 'Chill & Lounge',
  ambient: 'Chill & Lounge',
  jazz: 'Jazz & Blues',
  classical: 'Classical',
  news: 'News & Talk',
  talk: 'News & Talk',
  country: 'Country',
  decades: 'Decades',
  '80s': 'Decades',
  '90s': 'Decades',
};

const ACCENT_COLORS = [
  '#00e5ff', // cyan
  '#ff3366', // coral red
  '#00ed82', // neon green
  '#9d4edd', // purple
  '#f59e0b', // amber
  '#38bdf8', // sky blue
  '#ec4899', // pink
  '#10b981', // emerald
];

export class AzuraCastService {
  private config: ServerConfig;
  private sse: EventSource | null = null;
  private pollInterval: any = null;
  private onUpdateCallback: ((stations: AzuraCastNowPlaying[]) => void) | null = null;
  private stationsCache: AzuraCastNowPlaying[] = [];

  constructor(config: ServerConfig) {
    this.config = config;
  }

  public updateConfig(newConfig: ServerConfig) {
    this.config = newConfig;
    this.stopSync();
    if (newConfig.baseUrl) {
      this.startSync();
    }
  }

  public cleanUrl(url: string): string {
    return url.replace(/\/+$/, '');
  }

  // Enrich raw AzuraCast data with SiriusXM styling (channel numbers, categories, colors)
  public enrichStations(rawStations: any[]): AzuraCastNowPlaying[] {
    return rawStations.map((stationData, index) => {
      const channelNum = stationData.station?.id ? stationData.station.id : index + 1;
      const genre = (stationData.now_playing?.song?.genre || stationData.station?.genre || '').toLowerCase();
      
      let matchedCategory = 'Hits & Variety';
      for (const [key, categoryName] of Object.entries(CATEGORY_MAP)) {
        if (genre.includes(key)) {
          matchedCategory = categoryName;
          break;
        }
      }

      const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

      // Ensure artwork fallback
      let artUrl = stationData.now_playing?.song?.art;
      if (!artUrl || artUrl.includes('default_album_art') || artUrl.length === 0) {
        artUrl = `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80`;
      }

      // If URL is relative, prepend baseUrl
      if (artUrl && artUrl.startsWith('/') && this.config.baseUrl) {
        artUrl = `${this.cleanUrl(this.config.baseUrl)}${artUrl}`;
      }

      return {
        ...stationData,
        channel_number: channelNum,
        category: matchedCategory,
        accent_color: accent,
        now_playing: {
          ...stationData.now_playing,
          song: {
            ...stationData.now_playing?.song,
            art: artUrl,
          },
        },
      };
    });
  }

  // Fetch all stations now playing from the live instance
  public async fetchNowPlaying(): Promise<AzuraCastNowPlaying[]> {
    if (!this.config.baseUrl) {
      return [];
    }

    try {
      const baseUrl = this.cleanUrl(this.config.baseUrl);
      const headers: HeadersInit = {
        Accept: 'application/json',
      };
      if (this.config.apiKey) {
        headers['X-API-Key'] = this.config.apiKey;
      }

      const response = await fetch(`${baseUrl}/api/nowplaying`, {
        headers,
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`AzuraCast HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [data];
      const enriched = this.enrichStations(list);
      this.stationsCache = enriched;
      return enriched;
    } catch (err) {
      console.warn('Failed to fetch from AzuraCast instance:', err);
      if (this.stationsCache.length > 0) return this.stationsCache;
      return [];
    }
  }

  // Test server connectivity
  public static async testConnection(baseUrl: string, apiKey?: string): Promise<{ ok: boolean; count?: number; error?: string }> {
    try {
      const cleaned = baseUrl.replace(/\/+$/, '');
      const headers: HeadersInit = { Accept: 'application/json' };
      if (apiKey) headers['X-API-Key'] = apiKey;

      const res = await fetch(`${cleaned}/api/nowplaying`, {
        headers,
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        return { ok: false, error: `Server returned status ${res.status}` };
      }

      const json = await res.json();
      const count = Array.isArray(json) ? json.length : 1;
      return { ok: true, count };
    } catch (err: any) {
      return {
        ok: false,
        error: err.name === 'AbortError' ? 'Connection timed out' : (err.message || 'Network error or CORS restriction'),
      };
    }
  }

  // Fetch song request queue / eligible songs from the live instance
  public async fetchRequests(stationId: number): Promise<AzuraCastRequestSong[]> {
    if (!this.config.baseUrl) {
      return [];
    }

    try {
      const baseUrl = this.cleanUrl(this.config.baseUrl);
      const res = await fetch(`${baseUrl}/api/station/${stationId}/requests`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Unable to fetch requests');
      return await res.json();
    } catch (err) {
      console.warn('Requests not available for station', stationId, err);
      return [];
    }
  }

  // Submit a song request to the live instance
  public async submitRequest(requestUrl: string): Promise<{ success: boolean; message: string }> {
    if (!requestUrl || requestUrl === '#') {
      return { success: false, message: 'Invalid request URL' };
    }

    try {
      const res = await fetch(requestUrl, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, message: data.message || 'Request submitted successfully!' };
      }
      return { success: false, message: data.message || 'Failed to submit request' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error submitting request' };
    }
  }

  // Real-time synchronization (SSE with Polling fallback)
  public startSync(callback?: (stations: AzuraCastNowPlaying[]) => void) {
    if (callback) this.onUpdateCallback = callback;
    if (!this.config.baseUrl) return;

    const baseUrl = this.cleanUrl(this.config.baseUrl);

    // Try AzuraCast High-Performance SSE first
    try {
      const subsConfig = {
        subs: {
          'global:time': {},
          'station:*': {},
        },
      };
      const sseUrl = `${baseUrl}/api/live/nowplaying/sse?cf_connect=${encodeURIComponent(JSON.stringify(subsConfig))}`;

      this.sse = new EventSource(sseUrl);

      this.sse.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          const npData = raw?.pub?.data?.np;
          if (npData) {
            const list = Array.isArray(npData) ? npData : [npData];
            const updated = this.enrichStations(list);
            this.stationsCache = updated;
            if (this.onUpdateCallback) this.onUpdateCallback(updated);
          }
        } catch (e) {
          console.debug('SSE parse tick', e);
        }
      };

      this.sse.onerror = () => {
        // Fallback to polling if SSE encounters issues
        if (this.sse) {
          this.sse.close();
          this.sse = null;
        }
        this.startPolling();
      };
    } catch {
      this.startPolling();
    }
  }

  private startPolling() {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(async () => {
      try {
        const stations = await this.fetchNowPlaying();
        if (this.onUpdateCallback && stations.length > 0) {
          this.onUpdateCallback(stations);
        }
      } catch (err) {
        console.warn('Poll error:', err);
      }
    }, 8000);
  }

  public stopSync() {
    if (this.sse) {
      this.sse.close();
      this.sse = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
