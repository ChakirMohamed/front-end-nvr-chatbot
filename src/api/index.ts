import { apiFetch } from './client';
import type {
  HealthResponse,
  Camera,
  LiveCamera,
  ChatResponse,
  SearchRequest,
  SearchResponse,
  SummaryResponse,
  EventsResponse,
} from '../types';

export const api = {
  health: () =>
    apiFetch<HealthResponse>('/health'),

  cameras: () =>
    apiFetch<{ cameras: Camera[] }>('/cameras'),

  liveCameras: () =>
    apiFetch<{ cameras: LiveCamera[] }>('/live/cameras'),

  // MJPEG stream URL — used directly as <img src>. cacheBust forces the browser
  // to reopen the stream when remounting instead of reusing a closed connection.
  liveUrl: (camera_id: string, cacheBust?: number) =>
    `/api/live/${camera_id}${cacheBust ? `?t=${cacheBust}` : ''}`,

  chat: (message: string, session_id = 'default') =>
    apiFetch<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id }),
    }),

  search: (req: SearchRequest) =>
    apiFetch<SearchResponse>('/search', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  events: (params?: {
    camera_id?: string;
    start_time?: string;
    end_time?: string;
    object_type?: string;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.camera_id) qs.set('camera_id', params.camera_id);
    if (params?.start_time) qs.set('start_time', params.start_time);
    if (params?.end_time) qs.set('end_time', params.end_time);
    if (params?.object_type) qs.set('object_type', params.object_type);
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiFetch<EventsResponse>(`/events${q ? `?${q}` : ''}`);
  },

  summary: (params?: {
    camera_id?: string;
    start_time?: string;
    end_time?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.camera_id) qs.set('camera_id', params.camera_id);
    if (params?.start_time) qs.set('start_time', params.start_time);
    if (params?.end_time) qs.set('end_time', params.end_time);
    const q = qs.toString();
    return apiFetch<SummaryResponse>(`/summary${q ? `?${q}` : ''}`);
  },

  clipUrl: (event_id: number) => `/api/clip/${event_id}`,
};
