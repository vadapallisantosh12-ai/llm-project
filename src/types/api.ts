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

export interface AppSettings {
  active_llm_provider: 'ollama' | 'hosted' | 'mock';
  ollama_base_url: string;
  ollama_default_model: string;
  command_timeout_seconds: number;
  max_file_size_mb: number;
  db_status: 'connected' | 'disconnected';
}

export interface BugItem {
  id: string;
  title: string;
  traceback: string;
  culprit: string;
  status: 'open' | 'resolved';
  projectId?: string;
  createdAt: string;
}

export interface PatchItem {
  id: string;
  targetFile: string;
  description: string;
  status: 'pending_review' | 'applied' | 'rejected';
  diff: string;
  author: string;
  sha256: string;
  projectId?: string;
  timestamp: string;
}

export interface TestCase {
  id: string;
  name: string;
  file: string;
  category: 'unit' | 'security' | 'integration';
  status: 'passed' | 'failed' | 'idle' | 'running';
  duration?: string;
  projectId?: string;
}

export interface ProjectStatistics {
  openBugs: number;
  pendingPatches: number;
  totalTests: number;
}
