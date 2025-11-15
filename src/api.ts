// src/api.ts
import axios from "axios";

export const API_BASE = "http://127.0.0.1:8000";

export async function fetchGeoData(endpoint: string) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
  return res.json();
}

export async function addGroundwaterPoint(lat: number, lon: number, water_level: number, district: string) {
    return axios.post(
        "http://127.0.0.1:8000/api/add_groundwater_point",
        {},
        {
            params: { lat, lon, water_level, district }
        }
    );
}



export async function updateStream(id: number, name: string, remarks = "") {
  const url = `${API_BASE}/api/update_stream?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&remarks=${encodeURIComponent(
    remarks
  )}`;

  const res = await fetch(url, { method: "PUT" });
  if (!res.ok) throw new Error(`Failed to update stream: ${res.status} ${res.statusText}`);
  return res.json();
}

async function uploadShapefile(endpoint: string, file: File) {
  const fd = new FormData();
  fd.append("file", file, file.name);

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) throw new Error(`Failed to upload shapefile: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function uploadStreamShapefile(file: File) {
  return uploadShapefile("/api/upload_stream_shapefile", file);
}

export async function uploadBasinShapefile(file: File) {
  return uploadShapefile("/api/upload_basin_shapefile", file);
}
