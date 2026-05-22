import { GraduationCap, Sparkles, BookOpen, User, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface SectHeaderProps {
  charName: string;
  onRename: (newName: string) => void;
  openaiEnabled: boolean;
}

export function SectHeader({ charName, onRename, openaiEnabled }: SectHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState(charName);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setNameValue(charName);
  }, [charName]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    if (nameValue.trim()) {
      onRename(nameValue.trim());
      setIsEditing(false);
    }
  };

  return (
    <header className="relative w-full max-w-7xl mx-auto mb-2 flex flex-col md:flex-row items-center justify-between p-4 rounded-2xl border border-yellow-500/15 bg-slate-950/60 backdrop-blur-md gap-4 id-sect-header">
      {/* Decorative subtle top gold glow */}
      <div className="absolute top-0 left-1/3 w-48 h-10 bg-yellow-400/5 rounded-full filter blur-xl pointer-events-none"></div>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-yellow-500/15 to-amber-600/5 rounded-xl border border-yellow-500/20">
          <GraduationCap className="w-8 h-8 text-yellow-500 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold tracking-wider font-serif text-slate-150 uppercase flex items-center gap-1.5">
              IELTS <span className="text-yellow-400 font-serif">Tu Tiên Tông</span>
            </h1>
            <span className="px-2 py-0.5 text-[9px] uppercase font-mono tracking-widest bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20 shrink-0">
              V2.0 Core
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Duy trì kỷ luật bế quan học tập • Chấm dứt sự u muội • Độ kiếp băng qua các cảnh giới (IELTS Bands)
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-yellow-500/30 transition-colors cursor-pointer"
          onClick={() => {
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
        >
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") {
                    setNameValue(charName);
                    setIsEditing(false);
                  }
                }}
                className="bg-slate-950 text-slate-200 border border-yellow-500/40 px-2 py-0.5 rounded text-xs focus:outline-none"
                onClick={(e) => e.stopPropagation()}
                maxLength={24}
                autoFocus
                id="edit-name-input"
              />
              <span className="text-yellow-400 font-bold" onClick={handleSave}>[Lưu]</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] text-slate-500">Đạo Hiệu:</span>
              <span className="font-semibold text-slate-200 hover:text-yellow-400 transition-colors">{charName}</span>
              <span className="text-[9px] text-yellow-500/60 hover:text-yellow-400">✏️ Đổi</span>
            </div>
          )}
        </button>

        {/* Gemini AI Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800">
          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-slate-400">Thái Thượng Nhân (AI):</span>
          {openaiEnabled ? (
            <span className="flex items-center gap-1.5 font-bold text-emerald-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              GEMINI-3.5
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-500 font-bold font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              BẮT BUỘC (LOCAL)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-yellow-500/90" />
          <span className="text-slate-400 font-mono">Giờ Tông:</span>
          <span className="font-mono font-medium text-slate-300">{currentTime}</span>
        </div>
      </div>
    </header>
  );
}
