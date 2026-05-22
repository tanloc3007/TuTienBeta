import { BookOpen, AlertCircle, CheckCircle, Flame, Sparkles } from "lucide-react";
import { CharacterLog } from "../types";

interface SectLogsProps {
  logs: CharacterLog[];
}

export function SectLogs({ logs }: SectLogsProps) {
  return (
    <div className="flex flex-col h-[400px] md:h-[500px] id-sect-logs">
      <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-3">
        <BookOpen className="w-4.5 h-4.5 text-amber-500" />
        <h3 className="font-serif font-bold text-slate-200 text-sm">Tông Môn Lược Ký</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-full">
        {logs && logs.length > 0 ? (
          logs.map((log) => {
            // Pick styles based on log type
            let bgStyles = "bg-slate-900/40 border-slate-900 text-slate-300";
            let icon = <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />;

            if (log.type === "success") {
              bgStyles = "bg-emerald-950/10 border-emerald-500/15 text-emerald-300/90";
              icon = <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
            } else if (log.type === "warning") {
              bgStyles = "bg-amber-950/10 border-amber-500/15 text-amber-300/95";
              icon = <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
            } else if (log.type === "danger") {
              bgStyles = "bg-red-950/10 border-red-500/15 text-red-300/90";
              icon = <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />;
            }

            return (
              <div
                key={log.id}
                className={`p-3 rounded-xl border text-xs leading-relaxed flex gap-2 w-full transition-all hover:bg-slate-950/40 ${bgStyles}`}
              >
                <div className="mt-0.5">{icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5 font-mono text-[10px] text-slate-500">
                    <span className="font-semibold uppercase tracking-wider">{log.type}</span>
                    <span>{log.time}</span>
                  </div>
                  <div className="whitespace-pre-wrap break-all">{log.message}</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-xs">
            Hồ sơ trống rỗng, đang đợi ghi nhận hoạt động...
          </div>
        )}
      </div>
    </div>
  );
}
