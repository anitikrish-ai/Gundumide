/**
 * Encrypted Secret Vault Service
 * Interacts with the secure backend API for AES-256-GCM encrypted secret management.
 */

import { SecretVariable } from '../types';
import { AuthService } from './authService';

export class SecretService {
  private static apiHeaders(): HeadersInit {
    return AuthService.authHeaders();
  }

  public static async getSecrets(projectId: string): Promise<SecretVariable[]> {
    const res = await fetch(`/api/secrets/${projectId}`, { headers: this.apiHeaders() });
    const json = await res.json();
    if (!json.success) return [];
    return json.data.map((s: any) => ({
      id: s.id,
      key: s.key,
      value: s.value, // Masked representation returned by backend
      environment: s.environment,
      updatedAt: s.updatedAt
    }));
  }

  public static async addOrUpdateSecret(
    projectId: string,
    keyName: string,
    value: string,
    environment: 'DEV' | 'PROD'
  ): Promise<SecretVariable> {
    const res = await fetch(`/api/secrets/${projectId}`, {
      method: 'POST',
      headers: this.apiHeaders(),
      body: JSON.stringify({ key: keyName, value, environment })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Failed to save secret');
    return {
      id: json.data.id,
      key: json.data.key,
      value: '••••••••••••••••',
      environment: json.data.environment,
      updatedAt: new Date().toISOString()
    };
  }

  public static async deleteSecret(projectId: string, id: string): Promise<void> {
    const res = await fetch(`/api/secrets/${projectId}/${id}`, {
      method: 'DELETE',
      headers: this.apiHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Failed to delete secret');
  }
}
