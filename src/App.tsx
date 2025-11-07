// src/App.tsx
import { useEffect, useRef, useState } from "react";
import {
  map,
  Map as LeafletMap,
  tileLayer,
  latLng,
  geoJSON,
  Layer,
  circleMarker,
  GeoJSON,
} from "leaflet";
import "leaflet/dist/leaflet.css";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Layers, BarChart3, Download, Filter } from "lucide-react";

import { fetchGeoData } from "./api";

/* ---------------------------
   Your existing dummy data (kept as fallback)
   --------------------------- */
const dummyData = {
  waterQuality: {
    name: "Water Quality Monitoring Points",
    color: "#1E40AF",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Haridwar Station",
            ph: 7.2,
            dissolvedOxygen: 6.8,
            temperature: 22.5,
            turbidity: 15.2,
          },
          geometry: { type: "Point", coordinates: [78.1642, 29.9457] },
        },
        {
          type: "Feature",
          properties: {
            name: "Rishikesh Station",
            ph: 7.5,
            dissolvedOxygen: 7.2,
            temperature: 20.1,
            turbidity: 12.8,
          },
          geometry: { type: "Point", coordinates: [78.2676, 30.0869] },
        },
        {
          type: "Feature",
          properties: {
            name: "Kanpur Station",
            ph: 6.8,
            dissolvedOxygen: 4.2,
            temperature: 25.3,
            turbidity: 28.5,
          },
          geometry: { type: "Point", coordinates: [80.3319, 26.4499] },
        },
      ],
    },
  },

  riverSegments: {
    name: "River Segments",
    color: "#0891B2",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Upper Ganga",
            pollutionLevel: "Low",
            flowRate: 850.2,
            length: 145.5,
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [78.1642, 29.9457],
              [78.2676, 30.0869],
              [78.9629, 29.9457],
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Middle Ganga",
            pollutionLevel: "High",
            flowRate: 1250.8,
            length: 298.7,
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [78.9629, 29.9457],
              [80.3319, 26.4499],
              [82.9739, 25.3176],
            ],
          },
        },
      ],
    },
  },

  pollutionSources: {
    name: "Pollution Sources",
    color: "#DC2626",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Industrial Discharge Point A",
            type: "Industrial",
            severity: "High",
            contaminants: ["Heavy Metals", "Chemicals"],
          },
          geometry: { type: "Point", coordinates: [80.2707, 26.4499] },
        },
        {
          type: "Feature",
          properties: {
            name: "Sewage Treatment Plant",
            type: "Municipal",
            severity: "Medium",
            contaminants: ["Organic Matter", "Pathogens"],
          },
          geometry: { type: "Point", coordinates: [78.0322, 29.9652] },
        },
      ],
    },
  },

  biodiversity: {
    name: "Biodiversity Hotspots",
    color: "#059669",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Rajaji National Park Area",
            species: 42,
            conservation: "Protected",
            threat: "Low",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [78.0322, 29.9652],
                [78.1642, 29.9457],
                [78.1842, 30.1057],
                [78.0522, 30.1252],
                [78.0322, 29.9652],
              ],
            ],
          },
        },
      ],
    },
  },
};

/* ---------------------------
   Map each frontend layer key to a backend endpoint
   (change endpoints if your API path differs)
   --------------------------- */
const layerConfig = {
  waterQuality: {
    name: "Water Quality Monitoring Points",
    color: "#1E40AF",
    endpoint: "/api/ground_water_points",
  },
  riverSegments: {
    name: "River Segments",
    color: "#0891B2",
    endpoint: "/api/hindon_stream_network",
  },
  pollutionSources: {
    name: "Pollution Sources",
    color: "#DC2626",
    endpoint: "/api/ugc_stations", // use appropriate endpoint for pollution data if different
  },
  biodiversity: {
    name: "Biodiversity Hotspots",
    color: "#059669",
    endpoint: "/api/hindon_basin",
  },
} as const;

type LayerKey = keyof typeof layerConfig;

function App() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<LeafletMap | null>(null);
  // Leaflet layer instances by key
  const layersRef = useRef<Record<string, Layer | GeoJSON>>({});
  // Cache GeoJSON data returned for each layer key
  const dataCacheRef = useRef<Record<string, any>>({});

  const [selectedLayers, setSelectedLayers] = useState<Record<LayerKey, boolean>>({
    waterQuality: true,
    riverSegments: true,
    pollutionSources: false,
    biodiversity: false,
  });

  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Init Leaflet map once
  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      leafletMap.current = map(mapRef.current, {
        center: latLng(27.8467, 79.9462),
        zoom: 7,
      });

      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(leafletMap.current);
    }

    // cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Helper: create and add a geoJSON layer to the map
  const addGeoJsonLayer = (key: string, geojsonData: any, color: string) => {
    if (!leafletMap.current) return;
    // remove old instance if exists
    if (layersRef.current[key]) {
      try {
        leafletMap.current.removeLayer(layersRef.current[key] as Layer);
      } catch {}
      delete layersRef.current[key];
    }

    const newLayer = geoJSON(geojsonData, {
      style: {
        color,
        weight: key === "riverSegments" ? 4 : 2,
        fillOpacity: key === "biodiversity" ? 0.3 : 0.8,
      },
      pointToLayer: (_feature, latlng) =>
        circleMarker(latlng, {
          radius: 8,
          color,
          fillColor: color,
          weight: 2,
          fillOpacity: 0.8,
        }),
      onEachFeature: (feature: any, layer: any) => {
        layer.on("click", () => {
          setSelectedFeature({
            layerType: (layerConfig as any)[key].name,
            ...feature.properties,
          });
        });
      },
    });

    newLayer.addTo(leafletMap.current);
    layersRef.current[key] = newLayer;

    // optionally fit to bounds of this layer for a better view (commented out)
    // try {
    //   const bounds = newLayer.getBounds();
    //   if (bounds.isValid()) leafletMap.current.fitBounds(bounds, { maxZoom: 12 });
    // } catch {}
  };

  // Helper: remove a layer from the map
  const removeLayer = (key: string) => {
    const inst = layersRef.current[key];
    if (inst && leafletMap.current) {
      try {
        leafletMap.current.removeLayer(inst as Layer);
      } catch {}
      delete layersRef.current[key];
    }
    // remove cached feature selection if it belonged to this layer
    if (selectedFeature?.layerType === (layerConfig as any)[key].name) {
      setSelectedFeature(null);
    }
  };

  // Load data for one layer key: try API, fallback to dummy
  const loadLayerData = async (key: LayerKey) => {
    const cfg = layerConfig[key];
    setIsLoading(true);
    try {
      const fetched = await fetchGeoData(cfg.endpoint);
      // Expecting GeoJSON from backend
      dataCacheRef.current[key] = fetched;
      addGeoJsonLayer(key, fetched, cfg.color);
    } catch (err) {
      console.warn(`Failed to fetch ${cfg.endpoint}, using dummy data.`, err);
      // fallback to bundled dummyData if available
      if ((dummyData as any)[key]?.data) {
        dataCacheRef.current[key] = (dummyData as any)[key].data;
        addGeoJsonLayer(key, (dummyData as any)[key].data, cfg.color);
      } else {
        console.error("No dummy data found for", key);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Effect: watch selectedLayers and add/remove layers accordingly
  useEffect(() => {
    if (!leafletMap.current) return;

    // for each layerKey: add if selected and not present; remove if not selected but present
    (Object.keys(selectedLayers) as LayerKey[]).forEach((key) => {
      const visible = selectedLayers[key];
      const isAdded = !!layersRef.current[key];

      if (visible && !isAdded) {
        // If already cached, use cache, otherwise fetch
        if (dataCacheRef.current[key]) {
          addGeoJsonLayer(key, dataCacheRef.current[key], layerConfig[key].color);
        } else {
          // load async
          loadLayerData(key).catch((e) => {
            console.error("Error loading layer", key, e);
          });
        }
      } else if (!visible && isAdded) {
        removeLayer(key);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLayers]);

  // Toggle handler
  const toggleLayer = (layerKey: LayerKey) => {
    setSelectedLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Refresh: re-fetch all active layers from backend (overwrite cache & re-add)
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const activeKeys = (Object.keys(selectedLayers) as LayerKey[]).filter((k) => selectedLayers[k]);
      await Promise.all(
        activeKeys.map(async (key) => {
          // clear existing cached data and remove layer before reloading
          delete dataCacheRef.current[key];
          removeLayer(key);
          await loadLayerData(key);
        })
      );
    } catch (err) {
      console.error("Error refreshing data", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Export active layers as a JSON file
  const exportData = () => {
    const active = (Object.keys(selectedLayers) as LayerKey[]).filter((k) => selectedLayers[k]);
    const exportObj: Record<string, any> = {};
    active.forEach((k) => {
      exportObj[k] = dataCacheRef.current[k] ?? (dummyData as any)[k]?.data ?? null;
    });

    const dataStr = JSON.stringify(exportObj, null, 2);
    const b = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cganga-active-layers.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gradient-to-b from-[#34A0A4] to-[#52B788] min-h-screen">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#99D98C] to-[#B5E48C]">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="h-6 w-6 text-[#34A0A4]" />
              <h1 className="text-2xl font-bold text-gray-800">CGanga Data Visualizer</h1>
            </div>
            <p className="text-gray-600">Interactive visualization platform for Ganga river ecosystem data</p>
          </CardHeader>
        </Card>
      </div>

      <div className="flex gap-4 p-4 h-[calc(100vh-140px)]">
        {/* Control Panel */}
        <Card className="w-80 shadow-lg overflow-y-auto">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Data Layers
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={refreshData}
                  disabled={isLoading}
                  className="bg-[#34A0A4] hover:bg-[#2A8084]"
                >
                  {isLoading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Layer Controls */}
            <div className="space-y-3">
              {(Object.keys(layerConfig) as LayerKey[]).map((key) => {
                const cfg = layerConfig[key];
                return (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2"
                        style={{ backgroundColor: cfg.color, borderColor: cfg.color }}
                      />
                      <span className="text-sm font-medium">{cfg.name}</span>
                    </div>
                    <Switch checked={!!selectedLayers[key]} onCheckedChange={() => toggleLayer(key)} />
                  </div>
                );
              })}
            </div>

            {/* Data Summary */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Active Layers
              </h4>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(selectedLayers) as LayerKey[])
                  .filter((k) => selectedLayers[k])
                  .map((k) => (
                    <Badge key={k} variant="secondary" className="text-xs">
                      {(layerConfig as any)[k].name.split(" ")[0]}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Feature Details */}
            {selectedFeature && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Selected Feature</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                  <div className="font-medium">{selectedFeature.name ?? "Unnamed feature"}</div>
                  {Object.entries(selectedFeature)
                    .filter(([k]) => k !== "name" && k !== "layerType")
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{k}:</span>
                        <span>{Array.isArray(v) ? v.join(", ") : String(v)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-4 space-y-2">
              <Button onClick={exportData} className="w-full bg-[#52B788] hover:bg-[#40916C]" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button onClick={() => setSelectedFeature(null)} variant="outline" className="w-full" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map Container */}
        <Card className="h-[calc(100vh-140px)] w-[calc(100vw-320px)] flex-1 shadow-lg overflow-hidden">
          <div ref={mapRef} id="map" className="w-full h-[500px] rounded-lg" />
        </Card>
      </div>
    </div>
  );
}

export default App;
