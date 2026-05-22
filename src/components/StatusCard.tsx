import { Brain, Sparkles, Zap, Coins, Hourglass, CheckCircle2, ShieldAlert, RefreshCw, Trophy } from "lucide-react";
import { CultivationState, CultivationTier } from "../types";

interface StatusCardProps {
  state: CultivationState;
  onCheatStones: () => void;
  onReset: () => void;
  isUpdating: boolean;
  onForceFetch: () => void;
}

export function StatusCard({ state, onCheatStones, onReset, isUpdating, onForceFetch }: StatusCardProps) {
  // Safe helper to find current tier configuration
  const currentTierConfig = state.tiers?.find((t) => t.id === state.tier) || {
    id: 1,
    name: "Luyện Khí Kỳ",
    titleViet: "Phàm Nhân Vỡ Lòng",
    maxSubLevel: 9,
    baseRate: 0.15,
    requiredIelts: 4.0
  };

  // Calculate percentage of Tu Vi progress
  const progressPercent = Math.min(100, Math.max(0, (state.tuVi / state.tuViRequired) * 100));

  // Determine multiplier from active buffs
  let activeMultiplier = 1.0;
  const now = Date.now();
  const elixirBuff = state.activeBuffs?.find((b) => b.type === "elixir" && b.expireTime > now);
  const teaBuff = state.activeBuffs?.find((b) => b.type === "tea" && b.expireTime > now);
  const focusBuff = state.activeBuffs?.find((b) => b.type === "focus" && b.expireTime > now);

  if (elixirBuff) activeMultiplier *= 1.8;
  if (teaBuff) activeMultiplier *= 1.5;
  if (focusBuff) activeMultiplier *= 3.0; // Massive multiplier from successful Pomodoro

  // Real-time passive gain rates
  const baseRate = currentTierConfig.baseRate * (1 + (state.subLevel - 1) * 0.12) * 2;
  const tamMaFactor = Math.max(0.05, 1 - (state.tamMa / 100) * 0.95);
  const currentPassiveRate = baseRate * activeMultiplier * tamMaFactor;

  // Format buff timers
  const getBuffTimeLeft = (expireTime: number) => {
    const diff = expireTime - now;
    if (diff <= 0) return "";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Heart devil state description (Tâm ma)
  const getTamMaStatus = (val: number) => {
    if (val === 0) return { name: "Bồ Đề Vô Thụ (Sạch Bóng Nghiệp Lười)", color: "text-emerald-400 font-bold", desc: "Thần thức tịnh tâm tuyệt diệu, tốc độ hấp tụ linh lực đạt cực đại!" };
    if (val <= 20) return { name: "Thanh Tịnh Cảnh (Kỷ Luật Thượng Phẩm)", color: "text-green-400", desc: "Đan điền yên ả, tinh thần bế quan khỏe mạnh mượt mà." };
    if (val <= 50) return { name: "Xao Nhãng Phàm Trần (Xao Động Khí Hải)", color: "text-yellow-400", desc: "Dính mầm mống xao nhãng nhẹ, linh thức bị mây mù che bớt." };
    if (val <= 80) return { name: "Tâm Ma Hoành Hành (Báo Động Nghiệp Lực)", color: "text-orange-500 font-bold animate-pulse", desc: "Rong chơi mất tập trung! Thần lực tu thụ bị kiệt quệ nghiêm trọng." };
    return { name: "TẢU HỎA NHẬP MA (ĐAN ĐIỀN PHÁT NỔ)", color: "text-red-500 font-extrabold animate-pulse", desc: "Cực hạn u muội do liên tục thoát tab! Hấp thụ linh khí bị khóa 95%!" };
  };

  const tamMaStatus = getTamMaStatus(state.tamMa);

  // IELTS equivalent band indicator based on tier
  const getIeltsBandLevel = (tier: number) => {
    switch (tier) {
      case 1: return "Band 3.0 - 4.0";
      case 2: return "Band 4.5 - 5.0";
      case 3: return "Band 5.5 - 6.0";
      case 4: return "Band 6.5 - 7.0";
      case 5: return "Band 7.5 - 8.0";
      case 6: return "Band 8.5";
      case 7: return "Band 9.0";
      default: return "Band vô cực";
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 id-status-card">
      {/* Principal Profile Card */}
      <div className={`relative p-5 rounded-2xl border bg-slate-950/75 backdrop-blur-md transition-all duration-300 ${
        state.tamMa > 50 
          ? "border-red-500/25 shadow-[0_0_20px_rgba(239,68,68,0.08)]" 
          : "border-yellow-500/15 shadow-[0_0_20px_rgba(245,158,11,0.06)]"
      }`}>
        {/* Absolute Glowing Orb background */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full filter blur-3xl opacity-10 pointer-events-none transition-colors duration-500 ${
          state.tamMa > 50 ? "bg-red-500" : "bg-amber-400"
        }`}></div>

        <div className="flex justify-between items-start mb-5 gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`relative p-3 rounded-xl flex items-center justify-center ${
              state.tamMa > 80 
                ? "bg-red-500/10 text-red-500 border border-red-500/30 animate-bounce" 
                : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
            }`}>
              <Brain className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Tu Vi Cảnh Giới</span>
              </div>
              <h2 className="text-md md:text-lg font-bold text-slate-100 font-serif flex items-center gap-1">
                {currentTierConfig.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-amber-400 font-mono">
                  Tầng {state.subLevel} / 9
                </span>
                <span className="inline-block px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400/90 text-[10px] uppercase font-mono border border-yellow-500/20 rounded">
                  {getIeltsBandLevel(state.tier)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <button
                className="p-1 text-slate-500 hover:text-yellow-400 rounded-md hover:bg-slate-900 transition-colors cursor-pointer"
                onClick={onForceFetch}
                disabled={isUpdating}
                title="Thu hoạch linh đơn phát sinh"
              >
                <RefreshCw className={`w-3 h-3 ${isUpdating ? "animate-spin text-yellow-500" : ""}`} />
              </button>
              <span className="font-sans">Hầu bao Linh Thạch</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-amber-400 font-mono text-base font-bold bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Coins className="w-3.5 h-3.5" />
              <span>{Math.floor(state.spiritStones).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* TU VI PROGRESS BAR */}
        <div className="flex flex-col gap-1.5 mb-5">
          <div className="flex justify-between items-end text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin duration-3000" />
              Linh Khí Học Thức (Tu Vi)
            </span>
            <span className="text-slate-300 text-[11px]">
              {Math.floor(state.tuVi).toLocaleString()} / {state.tuViRequired.toLocaleString()}{" "}
              <span className="text-slate-500">({progressPercent.toFixed(1)}%)</span>
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-350 ${
                state.subLevel >= 9 && state.tuVi >= state.tuViRequired
                  ? "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  : "bg-gradient-to-r from-amber-500 to-yellow-400"
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          {state.subLevel >= 9 && state.tuVi >= state.tuViRequired && (
            <div className="text-[10px] text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-2 mt-1 px-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500 shrink-0 animate-bounce" />
              <span>
                <strong>Linh lực đại cực tầng!</strong> Mau di chuyển vào <strong>Đột Phá Điện</strong> để vượt ải, kiểm định thực lực cùng Trưởng Lão AI lên cảnh giới mới!
              </span>
            </div>
          )}
        </div>

        {/* CULTIVATION RATE DYNAMICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900/60 pt-4 text-xs">
          <div className="flex flex-col gap-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
            <span className="text-[10px] uppercase text-slate-500 tracking-wider font-semibold font-sans">Tốc Độ Thấp Thu Linh Khí</span>
            <div className="flex items-center gap-1 font-mono text-sm font-bold text-slate-100">
              <Zap className="w-3.5 h-3.5 text-yellow-500" />
              <span>+{currentPassiveRate.toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 font-sans">Tu Vi/giây</span>
            </div>
            
            {/* Active Buff Badges */}
            <div className="flex flex-col gap-1 mt-1.5 border-t border-slate-900/40 pt-1.5">
              {elixirBuff && (
                <span className="inline-flex items-center gap-1 text-[9px] bg-red-950/30 text-red-400 px-1.5 py-0.5 rounded border border-red-500/15">
                  💊 Thần dược (+80%): {getBuffTimeLeft(elixirBuff.expireTime)}
                </span>
              )}
              {teaBuff && (
                <span className="inline-flex items-center gap-1 text-[9px] bg-amber-950/30 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/15">
                  ☕ Trà vạn hương (+50%): {getBuffTimeLeft(teaBuff.expireTime)}
                </span>
              )}
              {focusBuff && (
                <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-950/30 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 animate-pulse">
                  🔮 Hộ điện tụ linh (3.0x): {getBuffTimeLeft(focusBuff.expireTime)}
                </span>
              )}
              {!elixirBuff && !teaBuff && !focusBuff && (
                <span className="text-[9px] text-slate-600 italic">Không có dược hiệu linh trợ</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
            <span className="text-[10px] uppercase text-slate-500 tracking-wider font-semibold font-sans flex items-center justify-between">
              Tâm Ma Nghiệp Lười
              <span className="text-red-400 font-mono font-bold text-[11px] bg-red-500/5 px-1 rounded">
                {state.tamMa}%
              </span>
            </span>
            <span className={`text-[11px] font-bold ${tamMaStatus.color} mt-0.5`}>
              {tamMaStatus.name}
            </span>
            <p className="text-[9px] text-slate-400 leading-normal mt-1 italic">
              {tamMaStatus.desc}
            </p>
          </div>
        </div>
      </div>

      {/* CUMULATIVE STATS BOARD */}
      <div className="p-4 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3.5 font-sans">Kỷ Lục Điển Sách</h3>
        
        <div className="grid grid-cols-4 gap-2 mb-3 px-1 text-center">
          <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-900 flex flex-col items-center">
            <Hourglass className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[8.5px] text-slate-500 truncate w-full">Bế Quan Phút</span>
            <span className="text-xs font-bold font-mono text-slate-200 mt-0.5">
              {state.studyMinutes || 0}m
            </span>
          </div>
          <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-900 flex flex-col items-center">
            <CheckCircle2 className="w-4 h-4 text-sky-400 mb-1" />
            <span className="text-[8.5px] text-slate-500 truncate w-full">Thành Pháp</span>
            <span className="text-xs font-bold font-mono text-slate-200 mt-0.5">
              {state.beQuanCount || 0}
            </span>
          </div>
          <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-900 flex flex-col items-center">
            <ShieldAlert className="w-4 h-4 text-red-400 mb-1 animate-pulse" />
            <span className="text-[8.5px] text-slate-500 truncate w-full">Nhập Ma Lần</span>
            <span className="text-xs font-bold font-mono text-red-400 mt-0.5">
              {state.backlashCount || 0}
            </span>
          </div>
          <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-900 flex flex-col items-center">
            <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[8.5px] text-slate-500 truncate w-full">Khai Từ Vựng</span>
            <span className="text-xs font-bold font-mono text-slate-200 mt-0.5">
              {state.answeredCount || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-between">
          <button
            onClick={onCheatStones}
            className="flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/15 transition-all text-center cursor-pointer"
          >
            🎁 Sư mẫu tặng Linh Thạch
          </button>
          
          <button
            onClick={() => {
              if (window.confirm("Bản tôn có thực sự muốn tịch diệt toàn bộ thọ cốt, phá sụp tu vi phàm trần để luân hồi lại từ đầu?")) {
                onReset();
              }
            }}
            className="py-1.5 px-3 rounded-lg text-[9px] text-slate-600 hover:text-red-400 border border-transparent hover:border-red-500/10 hover:bg-red-500/5 transition-all font-mono cursor-pointer"
            title="Tái Khởi Luân Hồi"
          >
            Nghịch Thiên Trùng Sinh
          </button>
        </div>
      </div>
    </div>
  );
}
