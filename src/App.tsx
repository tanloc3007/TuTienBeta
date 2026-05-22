import { useEffect, useState } from "react";
import { 
  Flame, 
  ShoppingBag, 
  Zap, 
  BookOpen, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  Hourglass
} from "lucide-react";
import { SectHeader } from "./components/SectHeader";
import { StatusCard } from "./components/StatusCard";
import { SectPlayground } from "./components/SectPlayground";
import { WebhookPanel } from "./components/WebhookPanel";
import { ShopPavilion } from "./components/ShopPavilion";
import { BreakthroughTrial } from "./components/BreakthroughTrial";
import { SectLogs } from "./components/SectLogs";
import { CultivationState } from "./types";

export default function App() {
  const [state, setState] = useState<CultivationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"playground" | "webhooks" | "shop" | "breakthrough">("playground");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch character state from endpoint
  const fetchState = async (silently = false) => {
    if (!silently) setIsUpdating(true);
    try {
      const res = await fetch("/api/cultivation/character");
      if (!res.ok) {
        throw new Error("Không thể kết nối với kết nối pháp trận máy chủ.");
      }
      const data = await res.json();
      setState(data);
      setErrorMsg(null);
    } catch (err: any) {
      console.error("Error fetching state:", err);
      setErrorMsg(err.message || "Không thể tải cấu trúc cảnh giới.");
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchState();
  }, []);

  // Poll state every 4.5 seconds to sync idle progress and check focus session statuses
  useEffect(() => {
    const timer = setInterval(() => {
      fetchState(true);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleRename = async (newName: string) => {
    try {
      const res = await fetch("/api/cultivation/character/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Lỗi đổi tên pháp hiệu.");
        return;
      }
      const data = await res.json();
      setState(data);
    } catch (err: any) {
      alert("Pháp trận đổi tên thất bại: " + err.message);
    }
  };

  const handleBuyItem = async (itemId: string) => {
    try {
      setIsProcessing(true);
      const res = await fetch("/api/cultivation/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Không thể nạp vật phẩm.");
        return;
      }
      const result = await res.json();
      setState(result.state);
    } catch (err: any) {
      alert("Mua tiên dược thất bại: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheatStones = async () => {
    try {
      const res = await fetch("/api/cultivation/character/cheat-stones", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetCharacter = async () => {
    try {
      const res = await fetch("/api/cultivation/character/reset", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        setActiveTab("playground");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEvaluateBreakthrough = async (code: string) => {
    const res = await fetch("/api/cultivation/breakthrough/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Thái Thượng pháp trận lôi kiếp bị nhiễu loạn.");
    }
    const result = await res.json();
    setState(result.state);
    return result;
  };

  if (isLoading && !state) {
    return (
      <div className="w-full min-h-screen bg-[#060813] text-slate-200 flex flex-col items-center justify-center p-6 gap-3 id-loader">
        <Loader2 className="w-9 h-9 text-yellow-500 animate-spin" />
        <h2 className="font-serif font-bold text-sm tracking-widest text-slate-300 uppercase">Khởi Tạo Linh Trận IELTS Tu Tiên</h2>
        <p className="text-[11px] text-slate-500">Đang sắp xếp tịnh cốc và bài thi vạn năng...</p>
      </div>
    );
  }

  if (errorMsg && !state) {
    return (
      <div className="w-full min-h-screen bg-[#060813] text-slate-200 flex flex-col items-center justify-center p-6 gap-3 id-error">
        <AlertCircle className="w-11 h-11 text-red-500 animate-pulse" />
        <h2 className="font-serif font-bold text-sm text-red-400 tracking-wider">MẤT KẾT NỐI VỚI TIÊN ĐIỆN</h2>
        <p className="text-xs text-slate-400 text-center max-w-xs">{errorMsg}</p>
        <button
          onClick={() => fetchState()}
          className="mt-3 px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg hover:border-yellow-500/40 text-yellow-500 font-mono transition-all pointer-cursor"
        >
          🔄 Khôi Phục Đạo Mạch
        </button>
      </div>
    );
  }

  const activeChar = state!;

  return (
    <div className="min-h-screen bg-slate-950/45 relative pb-10 id-app-container font-sans text-slate-250">
      
      {/* Dynamic background stars pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-4 flex flex-col gap-4">
        
        {/* Header Component */}
        <SectHeader 
          charName={activeChar.name} 
          onRename={handleRename}
          openaiEnabled={true} // Enabled server side Gemini Evaluation
        />

        {/* Major Split Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left panel cols (4 col columns representing profile, levels, states, counts) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <StatusCard 
              state={activeChar}
              onCheatStones={handleCheatStones}
              onReset={handleResetCharacter}
              isUpdating={isUpdating}
              onForceFetch={() => fetchState(false)}
            />

            {/* Explanatory sidecard */}
            <div className="p-4 rounded-xl border border-yellow-500/5 bg-slate-950/25 text-[11px] leading-relaxed text-slate-500 font-sans">
              <span className="font-bold text-slate-400 block mb-1 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-yellow-500" />
                Vận Bản Tu Tiên IELTS Đạo Lý
              </span>
              Tu luyện không dựa trên hành vi bấm chuột (clicker) phàm tục vô ích. Đạo hữu tự động nhận được Tu Vi thụ động liên tục dựa theo độ cao của Cảnh Giới (IELTS Bands). 
              <br />
              Để duy trì linh khí lành mạnh, hãy tiến hành giải đố <strong>Từ Vựng Trắc Nghiệm</strong> hoặc tập trung thực hành <strong>Bế Quan (Pomodoro)</strong> đúng kỷ luật. Hãy đề phòng Tâm Ma xao nhãng lười nhác!
            </div>
          </div>

          {/* Right panel cols (8 col columns representing interactively selectable tabs) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Dynamic Tabs list Row selector */}
            <div className="flex bg-slate-950/60 p-1.5 rounded-xl border border-slate-900 overflow-x-auto gap-1">
              <button
                onClick={() => setActiveTab("playground")}
                className={`flex-1 min-w-[110px] py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 font-mono cursor-pointer ${
                  activeTab === "playground"
                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-yellow-500" />
                Thiền Lâm (Đố Vui)
              </button>

              <button
                onClick={() => setActiveTab("webhooks")}
                className={`flex-1 min-w-[110px] py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 font-mono cursor-pointer ${
                  activeTab === "webhooks"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Hourglass className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Bế Quan (Pomodoro)
              </button>

              <button
                onClick={() => setActiveTab("shop")}
                className={`flex-1 min-w-[110px] py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 font-mono cursor-pointer ${
                  activeTab === "shop"
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                Dựơc Tháp (Cửa Hàng)
              </button>

              <button
                onClick={() => setActiveTab("breakthrough")}
                className={`flex-1 min-w-[130px] py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 font-mono relative cursor-pointer ${
                  activeTab === "breakthrough"
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-sky-450" />
                Kiếp Lôi Đột Phá
                {activeChar.subLevel >= 9 && activeChar.tuVi >= activeChar.tuViRequired && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                )}
              </button>
            </div>

            {/* TAB CONTENT HOUSER AND LAYOUT */}
            <div className="p-5 rounded-2xl border border-yellow-500/10 bg-slate-950/70 backdrop-blur-md min-h-[350px]">
              {activeTab === "playground" && (
                <SectPlayground 
                  state={activeChar}
                  onStateUpdate={(updated) => setState(updated)}
                />
              )}

              {activeTab === "webhooks" && (
                <WebhookPanel 
                  state={activeChar}
                  onStateUpdate={(updated) => setState(updated)}
                />
              )}

              {activeTab === "shop" && (
                <ShopPavilion 
                  spiritStones={activeChar.spiritStones}
                  onBuyItem={handleBuyItem}
                  isProcessing={isProcessing}
                />
              )}

              {activeTab === "breakthrough" && (
                <BreakthroughTrial 
                  state={activeChar}
                  onEvaluateBreakthrough={handleEvaluateBreakthrough}
                />
              )}
            </div>

            {/* RECENT SECT RECORDS LOGS */}
            <div className="p-5 rounded-2xl border border-yellow-500/10 bg-slate-950/70 backdrop-blur-md">
              <SectLogs logs={activeChar.logs} />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
