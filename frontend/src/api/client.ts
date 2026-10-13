import { ApiError, HealthResponse, Project, ProjectCreatePayload } from '../types/api';

const API_BASE = '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return {} as T;
  }
  
  if (!res.ok) {
    let errorData: ApiError;
    try {
      errorData = await res.json();
    } catch {
      errorData = {
        error: {
          code: 'HTTP_ERROR',
          message: `Request failed with status ${res.status}: ${res.statusText}`,
          timestamp: new Date().toISOString(),
        },
      };
    }
    const err = new Error(errorData.error?.message || 'API request failed');
    (err as unknown as { apiError: ApiError }).apiError = errorData;
    throw err;
  }
  
  return res.json();
}

export const apiClient = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<HealthResponse>(res);
  },

  async getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`);
  const result = await handleResponse<unknown>(res);

  // Standard API response: an array of projects
  if (Array.isArray(result)) {
    return result as Project[];
  }

  // Support APIs that wrap the array in an object
  if (result && typeof result === 'object') {
    const data = result as Record<string, unknown>;

    if (Array.isArray(data.data)) {
      return data.data as Project[];
    }

    if (Array.isArray(data.projects)) {
      return data.projects as Project[];
    }
  }

  console.error('Unexpected projects API response:', result);
  return [];
},

  async createProject(payload: ProjectCreatePayload): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<Project>(res);
  },

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },
};
