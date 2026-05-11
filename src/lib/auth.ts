export function setAdminToken(token: string): void {
  const maxAge = 8 * 60 * 60;
  document.cookie = `admin_token=${token}; path=/; max-age=${maxAge}; samesite=strict`;
}

export function getAdminToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/admin_token=([^;]+)/);
  return match?.[1] ?? null;
}

export function clearAdminToken(): void {
  document.cookie = 'admin_token=; max-age=0; path=/';
}

export function isAdminAuthenticated(): boolean {
  return getAdminToken() !== null;
}
