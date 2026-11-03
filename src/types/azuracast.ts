export interface AzuraCastSong {
  id: string;
  text: string;
  artist: string;
  title: string;
  album: string;
  genre: string;
  lyrics?: string;
  art: string;
  custom_fields?: Record<string, any>;
}

export interface AzuraCastMount {
  id: number;
  name: string;
  url: string;
  is_default: boolean;
  bitrate?: number;
  format?: string;
  listeners?: {
    total: number;
    unique: number;
    current: number;
  };
}

export interface AzuraCastRemote {
  id: number;
  name: string;
  url: string;
  bitrate?: number;
  format?: string;
  listeners?: {
    total: number;
    unique: number;
  };
}

export interface AzuraCastStation {
  id: number;
  name: string;
  shortcode: string;
  description: string;
  frontend: string;
  backend: string;
  listen_url: string;
  url?: string;
  public_player_url?: string;
  playlist_m3u_url?: string;
  playlist_pls_url?: string;
  is_public: boolean;
  mounts: AzuraCastMount[];
  remotes: AzuraCastRemote[];
}

export interface AzuraCastNowPlaying {
  station: AzuraCastStation;
  listeners: {
    total: number;
    unique: number;
    current: number;
  };
  live: {
    is_live: boolean;
    streamer_name: string;
    broadcast_start: number | null;
  };
  now_playing: {
    elapsed: number;
    remaining: number;
    duration: number;
    played_at: number;
    song: AzuraCastSong;
  };
  song_history: Array<{
    sh_id: number;
    played_at: number;
    duration: number;
    song: AzuraCastSong;
  }>;
  is_online: boolean;
  // SiriusXM client enrichment
  channel_number?: number;
  category?: string;
  accent_color?: string;
}

export interface AzuraCastRequestSong {
  request_id: string;
  request_url: string;
  song: AzuraCastSong;
}

export interface ServerConfig {
  baseUrl: string;
  apiKey?: string;
  isDemo: boolean;
  autoReconnect: boolean;
  preferredQuality: 'auto' | 'high' | 'standard' | 'low';
}
