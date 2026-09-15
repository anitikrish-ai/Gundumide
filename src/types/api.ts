/**
 * API Request & Response Contracts for GundamDev Backend
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface AuthResponseData {
  user: {
    id: string;
    username: string;
    email: string;
    gitHubConnected: boolean;
  };
  token: string;
}

export interface ProjectCreatePayload {
  name: string;
  description?: string;
  template: 'HTML_CSS_JS' | 'React' | 'Vite';
}

export interface BuildStatusResponse {
  jobId: string;
  projectId: string;
  status: 'QUEUED' | 'BUILDING' | 'SUCCESS' | 'FAILED';
  durationMs?: number;
  previewUrl?: string;
  errors: Array<{
    file: string;
    line: number;
    message: string;
  }>;
}
