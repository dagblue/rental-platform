import type { Response } from 'express';

export const AUTH_COOKIE = {
  ACCESS: 'rp_access',
  REFRESH: 'rp_refresh',
} as const;

const ACCESS_MAX_MS = 15 * 60 * 1000;
const REFRESH_MAX_MS = 30 * 24 * 60 * 60 * 1000;

function baseCookieOptions(): {
  httpOnly: boolean;
  path: string;
  secure: boolean;
  sameSite: 'lax' | 'none' | 'strict';
} {
  const secure = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    path: '/',
    secure,
    sameSite: secure ? 'none' : 'lax',
  };
}

export function setAuthCookies(
  res: Response,
  tokens: { access_token: string; refresh_token: string }
): void {
  const base = baseCookieOptions();
  res.cookie(AUTH_COOKIE.ACCESS, tokens.access_token, { ...base, maxAge: ACCESS_MAX_MS });
  res.cookie(AUTH_COOKIE.REFRESH, tokens.refresh_token, { ...base, maxAge: REFRESH_MAX_MS });
}

export function clearAuthCookies(res: Response): void {
  const base = baseCookieOptions();
  res.clearCookie(AUTH_COOKIE.ACCESS, base);
  res.clearCookie(AUTH_COOKIE.REFRESH, base);
}

export function setAccessCookie(res: Response, accessToken: string): void {
  const base = baseCookieOptions();
  res.cookie(AUTH_COOKIE.ACCESS, accessToken, { ...base, maxAge: ACCESS_MAX_MS });
}
