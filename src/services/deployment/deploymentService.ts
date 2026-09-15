/**
 * Multi-Provider Deployment Orchestration Service
 * Interacts with the secure backend deployment endpoints.
 */

import { DeploymentProvider, DeploymentConfig, DeploymentResult, DeploymentStatus, DeploymentProviderType } from '../../types/deployment';
import { NetlifyProvider } from './netlifyProvider';
import { CloudflarePagesProvider } from './cloudflareProvider';
import { AuthService } from '../authService';

export class DeploymentService {
  private static providers: Map<DeploymentProviderType, DeploymentProvider> = new Map<DeploymentProviderType, DeploymentProvider>([
    ['netlify', new NetlifyProvider()],
    ['cloudflare', new CloudflarePagesProvider()]
  ]);

  private static apiHeaders(): HeadersInit {
    return AuthService.authHeaders();
  }

  public static getAvailableProviders(): { type: DeploymentProviderType; name: string }[] {
    return [
      { type: 'netlify', name: 'Netlify' },
      { type: 'cloudflare', name: 'Cloudflare Pages' }
    ];
  }

  public static async triggerDeploy(projectId: string, config: DeploymentConfig): Promise<DeploymentResult> {
    const res = await fetch(`/api/deploy/${projectId}`, {
      method: 'POST',
      headers: this.apiHeaders(),
      body: JSON.stringify(config)
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || 'Deployment trigger failed');
    }
    return {
      id: json.data.id,
      provider: json.data.provider,
      status: json.data.status,
      url: json.data.url,
      adminUrl: json.data.admin_url,
      createdAt: json.data.created_at
    };
  }

  public static async getDeploymentHistory(projectId: string): Promise<DeploymentResult[]> {
    const res = await fetch(`/api/deploy/${projectId}/history`, { headers: this.apiHeaders() });
    const json = await res.json();
    if (!json.success) return [];
    return json.data.map((d: any) => ({
      id: d.id,
      provider: d.provider,
      status: d.status,
      url: d.url,
      adminUrl: d.admin_url,
      createdAt: d.created_at
    }));
  }

  public static async getDeploymentStatus(providerType: DeploymentProviderType, deploymentId: string): Promise<DeploymentStatus> {
    const provider = this.providers.get(providerType);
    if (!provider) {
      throw new Error(`Unsupported deployment provider: ${providerType}`);
    }
    return provider.getStatus(deploymentId);
  }
}
