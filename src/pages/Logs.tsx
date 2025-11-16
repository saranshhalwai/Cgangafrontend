import { useEffect, useMemo, useState } from "react";
import type {ColumnDef} from "@tanstack/react-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";

interface LogRecord {
  username: string;
  timestamp: string; // ISO string or similar
  action: string;
}

// Assumption: the logs endpoint is available at http://127.0.0.1:8000/logs
// If your API uses a different path (for example /api/logs), change LOGS_URL accordingly.
const LOGS_URL = "http://127.0.0.1:8000/logs";

export default function LogsPage() {
  const [data, setData] = useState<LogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(LOGS_URL);
      const txt = await res.text();
      let json: unknown;
      try {
        json = txt ? JSON.parse(txt) : null;
      } catch {
        // ignore parse error, json remains undefined
        json = undefined;
      }

      if (!res.ok) {
        const msg = typeof json === "object" && json !== null && "message" in (json as Record<string, unknown>)
          ? String((json as Record<string, unknown>)["message"]) : (txt || res.statusText || "Request failed");
        throw new Error(msg);
      }

      // Expecting either an array or { data: [...] }
      let records: unknown = json;
      if (records == null) {
        // try parsing from response body as JSON if initial parse failed
        try {
          records = await res.json();
        } catch {
          records = undefined;
        }
      }

      // Normalize to array of unknown items, then map to LogRecord
      let arr: unknown[] = [];
      if (Array.isArray(records)) {
        arr = records;
      } else if (records && typeof records === "object") {
        const recObj = records as Record<string, unknown>;
        if (Array.isArray(recObj.data)) arr = recObj.data as unknown[];
        else if (Array.isArray(recObj.logs)) arr = recObj.logs as unknown[];
      }

      if (arr.length === 0 && Array.isArray(json)) arr = json as unknown[];

      const normalized: LogRecord[] = arr.map((it: unknown) => {
        const o = (it ?? {}) as Record<string, unknown>;
        return {
          username: String(o.username ?? o.user ?? ""),
          timestamp: String(o.timestamp ?? o.time ?? o.created_at ?? ""),
          action: String(o.action ?? o.activity ?? ""),
        };
      });

      setData(normalized);
    } catch (err: unknown) {
      setError((err as Error)?.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, []);

  const columns = useMemo<ColumnDef<LogRecord, unknown>[]>(
    () => [
      {
        header: "Username",
        accessorKey: "username",
      },
      {
        header: "Timestamp",
        accessorKey: "timestamp",
        cell: ({ getValue }) => {
          const v = String(getValue() ?? "");
          try {
            const d = new Date(v);
            if (!Number.isNaN(d.getTime())) return d.toLocaleString();
          } catch {
            // ignore
          }
          return v;
        },
      },
      {
        header: "Action",
        accessorKey: "action",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center p-6 bg-gradient-to-b from-[#D9ED92] via-[#76C893] to-[#1E6091] dark:bg-gradient-to-b dark:from-[#184E77] dark:via-[#1A759F] dark:to-[#168AAD]">
      <Card className="max-w-4xl w-full mx-4 md:mx-auto bg-white/90 dark:bg-[#062a3a] shadow-2xl rounded-xl overflow-hidden min-w-0">
        <CardHeader className="bg-gradient-to-r from-[#B5E48C] to-[#34A0A4] dark:from-[#1A759F] dark:to-[#168AAD] text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Logs</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => void fetchLogs()}>Reload</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading && <div className="mb-2 text-slate-800 dark:text-slate-200">Loading...</div>}
          {error && <div className="mb-2 text-red-700 dark:text-red-300">{error}</div>}

          <DataTable columns={columns} data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
