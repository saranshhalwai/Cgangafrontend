// src/api.ts
export const API_BASE = "http://10.203.6.180:8000";

export async function fetchGeoData(endpoint: string) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
}
