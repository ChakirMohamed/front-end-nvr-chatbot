export interface HealthResponse {
  status: string;
  indexed_frames: number;
  timestamp: string;
}

export interface Camera {
  camera_id: string;
  frame_count: number;
  first_seen: string;
  last_seen: string;
}

export interface LiveCamera {
  camera_id: string;
  connected: boolean;
}

export interface VideoEvent {
  id: number;
  camera_id: string;
  timestamp: string;
  detected_objects: string[];
  zone: string;
  score: number;
  clip_path: string | null;
  video_path: string;
}

export interface ClassificationInfo {
  ml: {
    intent: string;
    confidence: number;
    all_scores: Record<string, number>;
  };
  source: string;
  llm_intent: string | null;
}

export interface ChatResponse {
  response: string;
  events?: VideoEvent[];
  summary?: SummaryResponse;
  classification_info: ClassificationInfo;
  // Present when the agent resolves a clip_request to a playable clip.
  clip_url?: string;
  event_id?: number;
  timestamp?: string;
  detected_objects?: string[];
}

export interface SearchRequest {
  query: string;
  top_k?: number;
  camera_id?: string;
  start_time?: string;
  end_time?: string;
  object_types?: string[];
  extract_clips?: boolean;
}

export interface SearchResponse {
  query: string;
  count: number;
  results: VideoEvent[];
}

export interface SummaryResponse {
  total_events: number;
  object_counts: Record<string, number>;
  hourly_distribution: Record<string, number>;
  camera_id: string | null;
  start_time: string | null;
  end_time: string | null;
}

export interface EventsResponse {
  count: number;
  events: VideoEvent[];
}

export type Intent = 'search' | 'summary' | 'clip_request' | 'greeting' | 'unknown';

export const INTENT_LABELS: Record<string, string> = {
  search: 'Recherche',
  summary: 'Résumé',
  clip_request: 'Clip vidéo',
  greeting: 'Salutation',
  unknown: 'Inconnu',
};

export const INTENT_COLORS: Record<string, string> = {
  search: '#22d3ee',
  summary: '#34d399',
  clip_request: '#a78bfa',
  greeting: '#fbbf24',
  unknown: '#94a3b8',
};
