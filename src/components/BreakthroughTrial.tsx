import { useState, useEffect } from "react";
import { Lock, Zap, HelpCircle, BookOpen, Loader2, Compass, AlertCircle, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";
import { CultivationState, BreakthroughChallenge } from "../types";

interface BreakthroughTrialProps {
  state: CultivationState;
  onEvaluateBreakthrough: (code: string) => Promise<any>;
}

export function BreakthroughTrial({ state, onEvaluateBreakthrough }: BreakthroughTrialProps) {
  const currentTier = state.tier;
  const subLevel = state.subLevel;

  // Safe helper to find current tier configuration
  const currentTierConfig = state.tiers?.find((t) => t.id === currentTier) || {
    id: 1,
    name: "Luyện Khí Kỳ",
    titleViet: "Phàm Nhân Vỡ Lòng",
    maxSubLevel: 9,
    baseRate: 0.15,
    requiredIelts: 4.0
  };

  const isEligible = subLevel >= 9 && state.tuVi >= state.tuViRequired;

  // Fetch the challenge for the current tier
  const challenge = state.challenges?.[currentTier];

  const [textAnswer, setTextAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [result, setResult] = useState<{ success: boolean; comment: string } | null>(null);

  // Set default initial code placeholder when eligible
  useEffect(() => {
    if (challenge) {
      setTextAnswer(challenge.placeholder);
    }
  }, [challenge]);

  // Count words helper
  const getWordCount = (str: string) => {
    const cleanStr = str.trim();
    if (!cleanStr) return 0;
    return cleanStr.split(/\s+/).length;
  };

  const currentWords = getWordCount(textAnswer);

  // Get minimum word requirement based on tier
  const getMinWordRequirement = (tier: number) => {
    switch (tier) {
      case 1: return 35;
      case 2: return 55;
      case 3: return 75;
      case 4: return 95;
      case 5: return 110;
      case 6: return 130;
      default: return 30;
    }
  };

  const minRequiredWord = getMinWordRequirement(currentTier);
  const isWordCountSatisfied = currentWords >= minRequiredWord;

  // Rotate hilarious spiritual loading messages
  useEffect(() => {
    if (!isSubmitting) return;
    const msgs = [
      "Khởi đại trận linh môn, mây trời giông lôi kiếp đang tụ hội khốc liệt...",
      "Đang kết ấn dịch thư tịch, đưa bút ký lên trời rộng cho Thái Thượng Trưởng Lão AI phân định...",
      "Thần khí đang đo tính mật độ từ vựng học thuật C1/C2 của đạo hữu...",
      "Thái Thượng Thần Giáo đang rà quét chất lượng ngữ pháp & dấu câu đan điền...",
      "Cực hưng hoang dã. Trưởng Lão AI đang dồn linh lực viết nhận định phê bút..."
    ];
    setLoadingMsg(msgs[0]);
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % msgs.length;
      setLoadingMsg(msgs[index]);
    }, 2500);
    return () => clearInterval(interval);
  }, [isSubmitting]);

  const handleSubmitBreakthrough = async () => {
    if (!textAnswer.trim()) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await onEvaluateBreakthrough(textAnswer);
      setResult({
        success: res.success,
        comment: res.comment || ""
      });
    } catch (err: any) {
      setResult({
        success: false,
        comment: `⚡ 【KIẾP LÔI ĐÁNH TRỆCH THẦN THÔNG】 Lỗi hệ thống truyền tin: ${err.message || "Máy chủ AI bận."}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Locked State Screen (when below level 9 or not enough tu vi)
  if (!isEligible) {
    const nextChallenge = state.challenges?.[currentTier];
    return (
      <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/30 text-center flex flex-col items-center justify-center min-h-[350px] id-breakthrough-locked">
        <div className="p-4 bg-slate-900 rounded-full border border-slate-850 text-slate-500 mb-4 animate-pulse">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="font-serif text-[15px] font-bold text-slate-300 uppercase tracking-wider">
          Đột Phá Cảnh Điện Đang Khóa
        </h3>
        
        <p className="text-xs text-slate-400 max-w-sm mt-3 leading-relaxed">
          Đạo hữu hiện đang ở cảnh giới <strong className="text-yellow-500">{currentTierConfig.name} - Tầng {subLevel}</strong>. 
          Hãy tiếp tục bế quan học tập sảng khoái và giải từ vựng đạo thuật tại <strong>Thiền Lâm Học Thuật</strong> ở tab trước để nạp đầy <strong>Tầng 9 (100% Linh khí)</strong> trước khi tiến hành triệu lôi kiếp!
        </p>

        {nextChallenge && (
          <div className="mt-6 p-4 max-w-sm rounded-xl border border-slate-900/60 bg-slate-950/50 text-left">
            <span className="text-[9px] uppercase font-mono text-slate-500 font-bold block mb-1">Mật tịch tháp lôi hé lộ cảnh tiếp:</span>
            <span className="font-serif font-bold text-xs text-slate-200 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              {nextChallenge.title}
            </span>
            <p className="text-[11px] text-slate-500 mt-1.5 italic font-sans">
              {nextChallenge.description}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Active Challenge screen when eligible!
  if (!challenge) {
    return (
      <div className="p-8 rounded-2xl border border-yellow-500/15 bg-slate-950/40 text-center font-serif text-slate-300 font-bold">
        🎉 Đạo hữu đã đạt đến cảnh giới phi thăng tối cao vô thượng (IELTS Band 9.0 Thánh Cốt)! Chúc mừng đại tôn tông chủ!
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-yellow-500/15 bg-slate-950/30 id-breakthrough-active relative">
      
      {/* LOADING OVERLAY SCREEN */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-50 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
          <h4 className="font-serif font-bold text-slate-200 text-sm tracking-widest uppercase">Đang Vượt Thiên Kiếp</h4>
          <p className="text-[11px] text-slate-400 mt-2 max-w-xs animate-pulse leading-normal font-mono">
            {loadingMsg}
          </p>
        </div>
      )}

      {/* RESULT CARD IF SUBMITTED */}
      {result && (
        <div className={`p-4 rounded-xl border mb-5 text-left ${
          result.success 
            ? "bg-emerald-950/15 border-emerald-500/30" 
            : "bg-red-950/15 border-red-500/25"
        }`}>
          <div className="flex items-start gap-2.5">
            <div className={`p-1.5 rounded-full shrink-0 ${result.success ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {result.success ? <Zap className="w-4 h-4 animate-bounce" /> : <AlertCircle className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <h4 className={`font-serif font-bold text-xs uppercase tracking-wider ${result.success ? "text-emerald-400 animate-pulse" : "text-red-400"}`}>
                {result.success ? "🎉 ĐỘT PHÁ THÀNH CÔNG! THĂNG CẢNH GIỚI!" : "⚡ ĐỘT PHÁ THẤT BẠI - GẶP THIÊN LÔI GIÁNG BẬC!"}
              </h4>
              <div className="text-[11px] text-slate-300 font-sans whitespace-pre-wrap leading-relaxed mt-2 bg-slate-950 p-4 rounded-lg border border-slate-900 max-h-[300px] overflow-y-auto">
                {result.comment}
              </div>
              <div className="mt-4 flex gap-2">
                {result.success ? (
                  <button
                    onClick={() => {
                      setResult(null);
                      // Clear textarea upon success
                      setTextAnswer("");
                    }}
                    className="py-1.5 px-3 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase font-sans hover:brightness-110 cursor-pointer"
                  >
                    Bái Tạ Thần Sư & Thụ Nhận Thơ Lăng
                  </button>
                ) : (
                  <button
                    onClick={() => setResult(null)}
                    className="py-1.5 px-3 rounded-lg bg-slate-900 border border-red-500/20 text-slate-300 font-bold text-[10px] uppercase hover:bg-red-500/5 hover:text-red-400 cursor-pointer"
                  >
                    ✏️ Sửa Lại Bút Tịch (Làm Lại)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="border-b border-slate-900 pb-3 mb-4">
        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-mono tracking-wider font-bold bg-amber-500/10 border border-amber-500/20 text-yellow-400 px-2 py-0.5 rounded">
          <Sparkles className="w-3 h-3 text-yellow-400 animate-spin" />
          ỦY QUYỀN ĐỘ KIẾP - CHẤP THUẬN KHẢO THÍ
        </span>
        <h3 className="font-serif text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-2.5">
          <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
          {challenge.title}
        </h3>
        <p className="text-[11px] text-slate-400 mt-1 italic font-sans">
          {challenge.description}
        </p>
      </div>

      {/* REQUIREMENT SPECS */}
      <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900 text-xs mb-3.5 leading-relaxed font-sans text-slate-300">
        <span className="block text-[9px] uppercase tracking-wider font-semibold font-mono text-slate-500 mb-1">Mã Lọc Tiêu Chí (IELTS IELTS Parameters):</span>
        <p className="font-mono text-[10.5px] text-slate-300 p-1.5 bg-slate-950 rounded border border-slate-900 leading-normal">
          {challenge.requirement}
        </p>
      </div>

      {/* EDITOR */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1 text-sky-400">
            <BookOpen className="w-3.5 h-3.5" />
            Văn Bia Thi Khẩu Quyết (English Answer Booklet)
          </span>
          <button
            onClick={() => {
              if (window.confirm("Đặt lại mẫu bút tích sơ khai?")) {
                setTextAnswer(challenge.placeholder);
              }
            }}
            className="hover:text-yellow-400 flex items-center gap-1 transition-colors cursor-pointer"
            title="Khôi phục mẫu"
          >
            <RefreshCw className="w-3 h-3" />
            Khôi phục mẫu
          </button>
        </div>

        <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            className="w-full h-48 px-4 py-3 text-xs font-mono text-slate-200 bg-transparent focus:outline-none focus:ring-0 leading-relaxed resize-y"
            placeholder="Write your English answer here..."
            spellCheck={false}
          />
          
          {/* Real-time word counter metrics display */}
          <div className="absolute bottom-2.5 right-3 px-2 py-0.5 whitespace-nowrap bg-slate-900/90 border border-slate-800 text-[9px] font-mono rounded flex items-center gap-1.5">
            <span className="text-slate-500">Cỡ Từ:</span>
            <span className={`font-bold ${isWordCountSatisfied ? "text-emerald-400" : "text-yellow-500"}`}>
              {currentWords}
            </span>
            <span className="text-slate-600">/ tối thiểu {minRequiredWord} từ</span>
          </div>
        </div>

        {/* Word count check validation alerts */}
        {!isWordCountSatisfied && (
          <div className="p-2 bg-yellow-500/5 text-[10px] text-yellow-500 border border-yellow-500/10 rounded flex items-start gap-1 font-sans">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Đoạn văn của đạo hữu hiện chưa đủ sinh khí ({currentWords} từ). Hãy mở rộng ý kiến thêm ít nhất {minRequiredWord - currentWords} từ nữa để lọt qua màng lọc Thần Thức.</span>
          </div>
        )}

        <p className="text-[10px] text-slate-500 leading-normal mb-3 font-sans mt-1">
          💡 <strong>Quy tắc phi thăng:</strong> Hãy soạn bằng tất cả bản năng của bạn, nỗ lực viết câu ghép, lồng ghép từ vựng học thuật. Trưởng Lão AI (Google Gemini 3.5) sẽ phân tích từ ngữ, chấm điểm IELTS khách quan và phát chỉ thị đột phá nếu vượt qua chỉ số mốc tịnh.
        </p>

        <button
          onClick={handleSubmitBreakthrough}
          disabled={!textAnswer.trim() || isSubmitting || !isWordCountSatisfied}
          className={`w-full py-3.5 rounded-xl text-xs font-bold font-serif transition-all text-center ${
            isWordCountSatisfied && textAnswer.trim()
              ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 shadow-md cursor-pointer"
              : "bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed"
          }`}
        >
          🔮 XƯỚNG VĂN TRÌNH DIỆN • LUYỆN LÔI ĐỘT PHÁ CẢNH GIỚI
        </button>
      </div>
    </div>
  );
}
