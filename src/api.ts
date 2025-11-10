// src/api.ts
export const API_BASE = "http://127.0.0.1:8000";

export async function fetchGeoData(endpoint: string) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
}
