/**
 * Base HTTP Client for Backend Communication
 * Manages Bearer Token authentication headers, REST requests, and standardized error parsing.
 */

import { ApiResponse } from '../types/api';

const API_BASE = '/api';

async function parseResponseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text();
  let json: any = null;
  if (text && text.trim().length > 0) {
    try {
      json = JSON.parse(text);
    } catch {
      return {
        success: false,
        error: { code: `HTTP_${res.status}`, message: `Server returned non-JSON body (${res.statusText})` }
      };
    }
  }

  if (!res.ok) {
    return {
      success: false,
      error: { code: `HTTP_${res.status}`, message: json?.error?.message || json?.message || res.statusText }
    };
  }

  return json || { success: true, data: undefined as unknown as T };
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('gundamdev_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await parseResponseJson<T>(res);
    } catch (err: unknown) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'Network request failed' }
      };
    }
  }

  public async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined
      });
      return await parseResponseJson<T>(res);
    } catch (err: unknown) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'Network request failed' }
      };
    }
  }

  public async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined
      });
      return await parseResponseJson<T>(res);
    } catch (err: unknown) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'Network request failed' }
      };
    }
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return await parseResponseJson<T>(res);
    } catch (err: unknown) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'Network request failed' }
      };
    }
  }
}

export const api = new ApiClient();
