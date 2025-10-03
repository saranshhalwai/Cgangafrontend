import { useEffect, useRef, useState } from "react";
import { map, Map as LeafletMap, tileLayer, latLng, geoJSON, Layer, circleMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Layers, BarChart3, Download, Filter } from "lucide-react";

// Dummy GeoJSON data for different types of environmental data
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
            turbidity: 15.2
          },
          geometry: { type: "Point", coordinates: [78.1642, 29.9457] }
        },
        {
          type: "Feature",
          properties: {
            name: "Rishikesh Station",
            ph: 7.5,
            dissolvedOxygen: 7.2,
            temperature: 20.1,
            turbidity: 12.8
          },
          geometry: { type: "Point", coordinates: [78.2676, 30.0869] }
        },
        {
          type: "Feature",
          properties: {
            name: "Kanpur Station",
            ph: 6.8,
            dissolvedOxygen: 4.2,
            temperature: 25.3,
            turbidity: 28.5
          },
          geometry: { type: "Point", coordinates: [80.3319, 26.4499] }
        }
      ]
    }
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
            length: 145.5
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [78.1642, 29.9457],
              [78.2676, 30.0869],
              [78.9629, 29.9457]
            ]
          }
        },
        {
          type: "Feature",
          properties: {
            name: "Middle Ganga",
            pollutionLevel: "High",
            flowRate: 1250.8,
            length: 298.7
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [78.9629, 29.9457],
              [80.3319, 26.4499],
              [82.9739, 25.3176]
            ]
          }
        }
      ]
    }
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
            contaminants: ["Heavy Metals", "Chemicals"]
          },
          geometry: { type: "Point", coordinates: [80.2707, 26.4499] }
        },
        {
          type: "Feature",
          properties: {
            name: "Sewage Treatment Plant",
            type: "Municipal",
            severity: "Medium",
            contaminants: ["Organic Matter", "Pathogens"]
          },
          geometry: { type: "Point", coordinates: [78.0322, 29.9652] }
        }
      ]
    }
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
            threat: "Low"
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [78.0322, 29.9652],
              [78.1642, 29.9457],
              [78.1842, 30.1057],
              [78.0522, 30.1252],
              [78.0322, 29.9652]
            ]]
          }
        }
      ]
    }
  }
};

function App() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<LeafletMap | null>(null);
  const layersRef = useRef<{[key: string]: Layer}>({});

  const [selectedLayers, setSelectedLayers] = useState({
    waterQuality: true,
    riverSegments: true,
    pollutionSources: false,
    biodiversity: false
  });

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize map
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
  }, []);

  // Handle layer visibility changes
  useEffect(() => {
    if (!leafletMap.current) return;

    Object.entries(selectedLayers).forEach(([layerKey, isVisible]) => {
      const layer = layersRef.current[layerKey];

      if (isVisible && !layer) {
        // Add layer if visible and not yet added
        const layerData = dummyData[layerKey];
        const newLayer = geoJSON(layerData.data, {
          style: {
            color: layerData.color,
            weight: layerKey === 'riverSegments' ? 4 : 2,
            fillOpacity: layerKey === 'biodiversity' ? 0.3 : 0.8
          },
          pointToLayer: (_feature, latlng) => {
            return circleMarker(latlng, {
              radius: 8,
              color: layerData.color,
              fillColor: layerData.color,
              weight: 2,
              fillOpacity: 0.8
            });
          },
          onEachFeature: (feature, layer) => {
            layer.on('click', () => {
              setSelectedFeature({
                layerType: layerKey,
                ...feature.properties
              });
            });
          }
        });

        newLayer.addTo(leafletMap.current);
        layersRef.current[layerKey] = newLayer;

      } else if (!isVisible && layer) {
        // Remove layer if not visible
        leafletMap.current.removeLayer(layer);
        delete layersRef.current[layerKey];
      }
    });
  }, [selectedLayers]);

  const toggleLayer = (layerKey) => {
    setSelectedLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const exportData = () => {
    const activeData = Object.entries(selectedLayers)
      .filter(([_, isActive]) => isActive)
      .map(([key, _]) => ({ [key]: dummyData[key] }));

    const dataStr = JSON.stringify(activeData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cganga-data.json';
    link.click();
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
              <Button
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
                className="bg-[#34A0A4] hover:bg-[#2A8084]"
              >
                {isLoading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Layer Controls */}
            <div className="space-y-3">
              {Object.entries(dummyData).map(([key, layer]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{ backgroundColor: layer.color, borderColor: layer.color }}
                    />
                    <span className="text-sm font-medium">{layer.name}</span>
                  </div>
                  <Switch
                    checked={selectedLayers[key]}
                    onCheckedChange={() => toggleLayer(key)}
                  />
                </div>
              ))}
            </div>

            {/* Data Summary */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Active Layers
              </h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(selectedLayers)
                  .filter(([_, isActive]) => isActive)
                  .map(([key, _]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {dummyData[key].name.split(' ')[0]}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Feature Details */}
            {selectedFeature && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Selected Feature</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                  <div className="font-medium">{selectedFeature.name}</div>
                  {Object.entries(selectedFeature)
                    .filter(([key, _]) => key !== 'name' && key !== 'layerType')
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key}:</span>
                        <span>{Array.isArray(value) ? value.join(', ') : value}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-4 space-y-2">
              <Button
                onClick={exportData}
                className="w-full bg-[#52B788] hover:bg-[#40916C]"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button
                onClick={() => setSelectedFeature(null)}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map Container */}
        <Card className="h-[calc(100vh-140px)] w-screen flex-1 shadow-lg overflow-hidden">
          <div ref={mapRef} id="map" className="w-full h-[500px] rounded-lg" />
        </Card>
      </div>
    </div>
  );
}

export default App;