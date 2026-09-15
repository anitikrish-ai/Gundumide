/**
 * Authentication & Multi-User Session Management Service
 * Calls the real backend API for register/login/logout.
 * Handles response parsing safely to prevent JSON parsing crashes.
 */

import { UserProfile } from '../types';

const TOKEN_KEY = 'gundamdev_auth_token';

async function safeParseResponse(res: Response, fallbackErrorMsg: string): Promise<any> {
  const text = await res.text();
  let json: any = null;

  if (text && text.trim().length > 0) {
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Server connection error (${res.status} ${res.statusText}). Ensure backend server is running.`);
    }
  } else if (!res.ok) {
    throw new Error(`Server returned HTTP ${res.status} ${res.statusText}`);
  }

  if (!res.ok || (json && json.success === false)) {
    const errorMsg = json?.error?.message || json?.message || fallbackErrorMsg;
    throw new Error(errorMsg);
  }

  return json;
}

export class AuthService {
  // ─── Token helpers ───────────────────────────────────────────────────────

  public static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private static storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  public static clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // ─── Auth headers helper ─────────────────────────────────────────────────

  public static authHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  // ─── Register ────────────────────────────────────────────────────────────

  public static async register(email: string, pass: string, username: string): Promise<UserProfile> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: pass, username: username.trim() })
    });

    const json = await safeParseResponse(res, 'Registration failed');
    this.storeToken(json.data.token);
    return json.data.user as UserProfile;
  }

  // ─── Login ───────────────────────────────────────────────────────────────

  public static async login(email: string, pass: string): Promise<UserProfile> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: pass })
    });

    const json = await safeParseResponse(res, 'Login failed');
    this.storeToken(json.data.token);
    return json.data.user as UserProfile;
  }

  // ─── Restore session from token ───────────────────────────────────────────

  public static async restoreSession(): Promise<UserProfile | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        this.clearToken();
        return null;
      }
      const json = await safeParseResponse(res, 'Session restoration failed');
      return json.data as UserProfile;
    } catch {
      this.clearToken();
      return null;
    }
  }

  // ─── Logout ──────────────────────────────────────────────────────────────

  public static logout(): void {
    this.clearToken();
  }

  public static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * @deprecated — Legacy compatibility shim.
   * Use restoreSession() instead for async server-verified session restoration.
   */
  public static getCurrentUser(): null {
    return null;
  }
}
