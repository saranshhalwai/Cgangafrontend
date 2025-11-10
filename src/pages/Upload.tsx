import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Mode = "point" | "update" | "stream_shapefile" | "basin_shapefile";

export default function UploadPage() {
  const [mode, setMode] = useState<Mode>("point");

  // common UI state
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Groundwater point
  const [lat, setLat] = useState<string>("");
  const [lon, setLon] = useState<string>("");
  const [waterLevel, setWaterLevel] = useState<string>("");
  const [district, setDistrict] = useState<string>("");

  // Update stream
  const [streamId, setStreamId] = useState<string>("");
  const [streamName, setStreamName] = useState<string>("");
  const [streamRemarks, setStreamRemarks] = useState<string>("");

  // File uploads
  const [file, setFile] = useState<File | null>(null);

  const resetMessages = () => {
    setStatusMsg(null);
    setError(null);
  };

  const postJson = async (url: string, body: unknown) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const txt = await res.text();
    let json: unknown;
    try {
      json = txt ? JSON.parse(txt) : null;
    } catch (parseErr) {
      // ignore parse error, we'll surface textual response instead
      json = null;
      void parseErr;
    }
    if (!res.ok) {
      let errorMsg = txt || res.statusText || "Request failed";
      if (typeof json === "object" && json !== null && "message" in (json as Record<string, unknown>)) {
        const m = (json as Record<string, unknown>)["message"];
        errorMsg = typeof m === "string" ? m : String(m);
      }
      throw new Error(errorMsg);
    }
    return (json ?? { message: "ok" }) as unknown;
  };

  const putJson = async (url: string, body: unknown) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const txt = await res.text();
    let json: unknown;
    try {
      json = txt ? JSON.parse(txt) : null;
    } catch (parseErr) {
      json = null;
      void parseErr;
    }
    if (!res.ok) {
      let errorMsg = txt || res.statusText || "Request failed";
      if (typeof json === "object" && json !== null && "message" in (json as Record<string, unknown>)) {
        const m = (json as Record<string, unknown>)["message"];
        errorMsg = typeof m === "string" ? m : String(m);
      }
      throw new Error(errorMsg);
    }
    return (json ?? { message: "ok" }) as unknown;
  };

  const postFile = async (url: string, f: File) => {
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetch(url, { method: "POST", body: fd });
    const txt = await res.text();
    let json: unknown;
    try {
      json = txt ? JSON.parse(txt) : null;
    } catch (parseErr) {
      json = null;
      void parseErr;
    }
    if (!res.ok) {
      let errorMsg = txt || res.statusText || "Upload failed";
      if (typeof json === "object" && json !== null && "message" in (json as Record<string, unknown>)) {
        const m = (json as Record<string, unknown>)["message"];
        errorMsg = typeof m === "string" ? m : String(m);
      }
      throw new Error(errorMsg);
    }
    return (json ?? { message: "ok" }) as unknown;
  };

  const submitPoint = async () => {
    resetMessages();
    const latNum = Number(lat);
    const lonNum = Number(lon);
    const wlNum = Number(waterLevel);
    if (Number.isNaN(latNum) || Number.isNaN(lonNum) || Number.isNaN(wlNum)) {
      setError("Latitude, longitude and water level must be valid numbers");
      return;
    }
    setIsUploading(true);
    try {
      const res = await postJson("/api/add_groundwater_point", {
        lat: latNum,
        lon: lonNum,
        water_level: wlNum,
        district: district || "",
      });
      // try to extract message from response if available
      const msg = typeof res === "object" && res !== null && "message" in (res as Record<string, unknown>) ? String((res as Record<string, unknown>)["message"]) : "Point added successfully";
      setStatusMsg(msg);
      // optionally navigate back
      // window.location.href = "/";
    } catch (err: unknown) {
      setError((err as Error)?.message || String(err));
    } finally {
      setIsUploading(false);
    }
  };

  const submitUpdateStream = async () => {
    resetMessages();
    const idNum = Number(streamId);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      setError("Stream id must be a positive integer");
      return;
    }
    if (!streamName) {
      setError("Stream name is required");
      return;
    }
    setIsUploading(true);
    try {
      const res = await putJson("/api/update_stream", {
        id: idNum,
        name: streamName,
        remarks: streamRemarks || "",
      });
      const msg = typeof res === "object" && res !== null && "message" in (res as Record<string, unknown>) ? String((res as Record<string, unknown>)["message"]) : "Stream updated successfully";
      setStatusMsg(msg);
    } catch (err: unknown) {
      setError((err as Error)?.message || String(err));
    } finally {
      setIsUploading(false);
    }
  };

  const submitShapefile = async (url: string) => {
    resetMessages();
    if (!file) {
      setError("No file selected");
      return;
    }
    setIsUploading(true);
    try {
      const res = await postFile(url, file);
      const msg = typeof res === "object" && res !== null && "message" in (res as Record<string, unknown>) ? String((res as Record<string, unknown>)["message"]) : "Upload successful";
      setStatusMsg(msg);
    } catch (err: unknown) {
      setError((err as Error)?.message || String(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center p-6 bg-gradient-to-b from-[#D9ED92] via-[#76C893] to-[#1E6091] dark:bg-gradient-to-b dark:from-[#184E77] dark:via-[#1A759F] dark:to-[#168AAD]">
      <Card className="max-w-3xl w-full mx-4 md:mx-auto bg-white/90 dark:bg-[#062a3a] shadow-2xl rounded-xl overflow-hidden min-w-0">
        <CardHeader className="bg-gradient-to-r from-[#B5E48C] to-[#34A0A4] dark:from-[#1A759F] dark:to-[#168AAD] text-white p-4 rounded-t-xl">
           <div className="flex items-center justify-between">
             <h2 className="text-xl font-semibold">Upload / Data operations</h2>
             <div className="text-sm text-slate-700 dark:text-slate-200">Choose operation and submit</div>
           </div>
         </CardHeader>
         <CardContent className="p-6 space-y-4">
           <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start overflow-x-auto py-1 max-w-full min-w-0">
            <Button variant={mode === "point" ? undefined : "outline"} onClick={() => setMode("point")} className={`${mode === "point" ? "bg-[#34A0A4] text-white hover:bg-[#1E6091]" : ""} whitespace-nowrap`}>Add Groundwater Point</Button>
            <Button variant={mode === "update" ? undefined : "outline"} onClick={() => setMode("update")} className={`${mode === "update" ? "bg-[#34A0A4] text-white hover:bg-[#1E6091]" : ""} whitespace-nowrap`}>Update Stream</Button>
            <Button variant={mode === "stream_shapefile" ? undefined : "outline"} onClick={() => setMode("stream_shapefile")} className={`${mode === "stream_shapefile" ? "bg-[#34A0A4] text-white hover:bg-[#1E6091]" : ""} whitespace-nowrap`}>Upload Stream Shapefile</Button>
            <Button variant={mode === "basin_shapefile" ? undefined : "outline"} onClick={() => setMode("basin_shapefile")} className={`${mode === "basin_shapefile" ? "bg-[#34A0A4] text-white hover:bg-[#1E6091]" : ""} whitespace-nowrap`}>Upload Basin Shapefile</Button>
           </div>

           {statusMsg && <div className="mb-2 text-green-700 dark:text-green-300">{statusMsg}</div>}
           {error && <div className="mb-2 text-red-700 dark:text-red-300">{error}</div>}

           {mode === "point" && (
             <div className="space-y-3">
               <div className="grid grid-cols-2 gap-2">
                <input className="p-2 border rounded bg-white/60 dark:bg-[#0b2a36] dark:border-[#184E77] focus:outline-none focus:ring-2 focus:ring-[#34A0A4]" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
                <input className="p-2 border rounded bg-white/60 dark:bg-[#0b2a36] dark:border-[#184E77] focus:outline-none focus:ring-2 focus:ring-[#34A0A4]" placeholder="Longitude" value={lon} onChange={(e) => setLon(e.target.value)} />
                <input className="p-2 border rounded bg-white/60 dark:bg-[#0b2a36] dark:border-[#184E77] focus:outline-none focus:ring-2 focus:ring-[#34A0A4]" placeholder="Water level" value={waterLevel} onChange={(e) => setWaterLevel(e.target.value)} />
                <input className="p-2 border rounded bg-white/60 dark:bg-[#0b2a36] dark:border-[#184E77] focus:outline-none focus:ring-2 focus:ring-[#34A0A4]" placeholder="District (optional)" value={district} onChange={(e) => setDistrict(e.target.value)} />
               </div>
               <div className="flex gap-2">
                <Button onClick={() => window.history.back()} variant="outline">Back</Button>
                <Button onClick={submitPoint} disabled={isUploading} className="bg-[#34A0A4] hover:bg-[#1E6091] text-white">{isUploading ? "Submitting..." : "Submit Point"}</Button>
               </div>
             </div>
           )}

           {mode === "update" && (
             <div className="space-y-3">
               <div className="grid grid-cols-1 gap-2">
                <input className="p-2 border rounded bg-white/60 dark:bg-[#0b2a36] dark:border-[#184E77] focus:outline-none focus:ring-2 focus:ring-[#34A0A4]" placeholder="Stream id" value={streamId} onChange={(e) => setStreamId(e.target.value)} />
                <input className="p-2 border rounded bg-white/60 dark:bg-[#0b2a36] dark:border-[#184E77] focus:outline-none focus:ring-2 focus:ring-[#34A0A4]" placeholder="Stream name" value={streamName} onChange={(e) => setStreamName(e.target.value)} />
                <input className="p-2 border rounded bg-white/60 dark:bg-[#0b2a36] dark:border-[#184E77] focus:outline-none focus:ring-2 focus:ring-[#34A0A4]" placeholder="Remarks (optional)" value={streamRemarks} onChange={(e) => setStreamRemarks(e.target.value)} />
               </div>
               <div className="flex gap-2">
                <Button onClick={() => window.history.back()} variant="outline">Back</Button>
                <Button onClick={submitUpdateStream} disabled={isUploading} className="bg-[#34A0A4] hover:bg-[#1E6091] text-white">{isUploading ? "Updating..." : "Update"}</Button>
               </div>
             </div>
           )}

           {mode === "stream_shapefile" && (
             <div className="space-y-3">
               <div>
                <input type="file" accept=".zip,.shp,.dbf,.prj" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm text-slate-700 dark:text-slate-200" />
               </div>
               <div className="flex gap-2">
                <Button onClick={() => window.history.back()} variant="outline">Back</Button>
                <Button onClick={() => submitShapefile("/api/upload_stream_shapefile")} disabled={isUploading || !file} className="bg-[#34A0A4] hover:bg-[#1E6091] text-white">{isUploading ? "Uploading..." : "Upload Stream Shapefile"}</Button>
               </div>
             </div>
           )}

           {mode === "basin_shapefile" && (
             <div className="space-y-3">
               <div>
                <input type="file" accept=".zip,.shp,.dbf,.prj" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm text-slate-700 dark:text-slate-200" />
               </div>
               <div className="flex gap-2">
                <Button onClick={() => window.history.back()} variant="outline">Back</Button>
                <Button onClick={() => submitShapefile("/api/upload_basin_shapefile")} disabled={isUploading || !file} className="bg-[#34A0A4] hover:bg-[#1E6091] text-white">{isUploading ? "Uploading..." : "Upload Basin Shapefile"}</Button>
               </div>
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }
