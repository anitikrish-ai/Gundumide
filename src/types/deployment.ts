/**
 * Deployment Provider Abstraction Contracts
 */

export type DeploymentProviderType = 'netlify' | 'cloudflare';

export type DeploymentState = 'QUEUED' | 'BUILDING' | 'DEPLOYING' | 'READY' | 'ERROR';

export interface DeploymentConfig {
  provider: DeploymentProviderType;
  environment: 'DEV' | 'PROD';
  buildCommand?: string;
  publishDirectory?: string;
  token?: string;
  siteId?: string;
}

export interface DeploymentResult {
  id: string;
  provider: DeploymentProviderType;
  status: DeploymentState;
  url?: string;
  adminUrl?: string;
  createdAt: string;
  error?: string;
}

export interface DeploymentStatus {
  id: string;
  status: DeploymentState;
  url?: string;
  logs: string[];
  updatedAt: string;
}

/**
 * Shared DeploymentProvider Interface Contract
 * Implementations: NetlifyProvider, CloudflarePagesProvider
 */
export interface DeploymentProvider {
  name: DeploymentProviderType;
  displayName: string;
  deploy(projectId: string, config: DeploymentConfig): Promise<DeploymentResult>;
  getStatus(deploymentId: string): Promise<DeploymentStatus>;
  getLogs(deploymentId: string): Promise<string[]>;
}
