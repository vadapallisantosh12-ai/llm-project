export interface SystemInfo {
  platform: string;
  python_version: string;
  os: string;
}

export interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  app_name: string;
  version: string;
  environment: string;
  database: 'connected' | 'disconnected';
  active_llm_provider: string;
  system_info: SystemInfo;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  data: HealthData;
}

export interface Project {
  id: string;
  name: string;
  root_path: string;
  description: string;
  is_active: boolean;
  indexing_status: 'not_indexed' | 'indexing' | 'indexed' | 'failed';
  file_count: number;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreatePayload {
  name: string;
  root_path: string;
  description?: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    request_id?: string;
    timestamp: string;
  };
}

export type PageView =
  | 'dashboard'
  | 'projects'
  | 'assistant'
  | 'debugger'
  | 'patches'
  | 'tests'
  | 'reviews'
  | 'agent'
  | 'settings';
