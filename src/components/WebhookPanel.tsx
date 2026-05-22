import { useState, useEffect, useRef } from "react";
import { Hourglass, Play, Flame, Volume2, VolumeX, ShieldAlert, CheckCircle, Brain, RefreshCw } from "lucide-react";
import { CultivationState } from "../types";

interface WebhookPanelProps {
  state: CultivationState;
  onStateUpdate: (updatedState: CultivationState) => void;
}

export function WebhookPanel({ state, onStateUpdate }: WebhookPanelProps) {
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // minutes
  const [timeLeft, setTimeLeft] = useState<number>(0); // seconds
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);
  
  // Web Audio Context refs for browser-synthesized meditation white-noise/rain sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const generatorRef = useRef<AudioBufferSourceNode | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = state.currentSession?.isActive || false;

  // Sync timer when state cache shows active session
  useEffect(() => {
    if (isActive && state.currentSession) {
      const now = Date.now();
      const endTime = state.currentSession.startTime + state.currentSession.durationMs;
      const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(remainingSeconds);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      
      timerIntervalRef.current = setInterval(() => {
        const currentNow = Date.now();
        const diffSecs = Math.max(0, Math.floor((endTime - currentNow) / 1000));
        setTimeLeft(diffSecs);

        if (diffSecs <= 0) {
          clearInterval(timerIntervalRef.current!);
          handleSessionSuccessCompletion();
        }
      }, 1000);
    } else {
      setTimeLeft(0);
      setShowCancelConfirm(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isActive, state.currentSession]);

  // Tab visibility detection to trigger TẨU HỎA NHẬP MA mechanism!
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        // User switched tabs or minimized! Trigger backlash penalty API!
        triggerBacklashBackplane();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive]);

  // Trigger backlash via API
  const triggerBacklashBackplane = async () => {
    try {
      const res = await fetch("/api/cultivation/be-quan/backlash", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        onStateUpdate(data.state || data);
        stopMeditationAudio();
      }
    } catch (err) {
      console.error("Backlash error:", err);
    }
  };

  // Trigger session completion
  const handleSessionSuccessCompletion = async () => {
    try {
      const res = await fetch("/api/cultivation/be-quan/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        onStateUpdate(data);
        stopMeditationAudio();
      }
    } catch (err) {
      console.error("Completion error:", err);
    }
  };

  // Start focus session API
  const startBeQuanSession = async (minutes: number) => {
    try {
      const res = await fetch("/api/cultivation/be-quan/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationMinutes: minutes })
      });
      if (res.ok) {
        const data = await res.json();
        onStateUpdate(data);
        // Start audio ambient optionally if requested
        startMeditationAudio();
      } else {
        const errData = await res.json();
        alert(errData.error || "Không khởi tạo được trận pháp bế quan.");
      }
    } catch (err) {
      console.error("Error starting focus session:", err);
    }
  };

  // Web Audio ambient synthesis (Offline Brownian wind noise)
  const startMeditationAudio = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      // Synthesis peaceful brownian low rustling noise for alpha state
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brownian noise formula
        output[i] = (lastOut + (0.012 * white)) / 1.012;
        lastOut = output[i];
        output[i] *= 5.0; // amplify
      }

      const sourceNode = ctx.createBufferSource();
      sourceNode.buffer = noiseBuffer;
      sourceNode.loop = true;

      // Filter to low relaxing frequencies like thunderstorm rain
      const biquadFilter = ctx.createBiquadFilter();
      biquadFilter.type = "lowpass";
      biquadFilter.frequency.value = 180; // deep focus hum

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.7;

      sourceNode.connect(biquadFilter);
      biquadFilter.connect(gainNode);
      gainNode.connect(ctx.destination);

      sourceNode.start();
      generatorRef.current = sourceNode;
      setIsAmbientPlaying(true);
    } catch (err) {
      console.warn("Meditative audio synthesis not supported on this browser:", err);
    }
  };

  const stopMeditationAudio = () => {
    try {
      if (generatorRef.current) {
        generatorRef.current.stop();
        generatorRef.current.disconnect();
        generatorRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {
      // ignore
    }
    setIsAmbientPlaying(false);
  };

  const toggleAmbientSound = () => {
    if (isAmbientPlaying) {
      stopMeditationAudio();
    } else {
      startMeditationAudio();
    }
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  // Progress ratio calculation
  const totalSeconds = (state.currentSession?.durationMs || 0) / 1000;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const strokeDashoffset = 282.6 * (1 - progressRatio); // Based on circle circumfrence 2 * pi * r (r=45)

  return (
    <div className="flex flex-col gap-6 id-webhook-panel">
      {/* POMODORO COVENANT Focus temple */}
      <div className="p-6 rounded-2xl border border-yellow-500/15 bg-slate-950/45 relative overflow-hidden shadow-inner">
        
        {/* Subtle geometric circle artifact background */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full border border-yellow-500/5 pulse-element pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3 justify-between">
          <div className="flex items-center gap-2">
            <Hourglass className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-[14px] text-slate-200 uppercase tracking-widest font-serif">
              Bế Quan Tịnh Pháp (Focus Pomodoro)
            </h3>
          </div>
          
          <button
            onClick={toggleAmbientSound}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              isAmbientPlaying 
                ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-400" 
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
            }`}
            title="Kích phát sóng não beta tĩnh tâm"
          >
            {isAmbientPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span className="text-[10px] uppercase font-mono font-bold">Ambient On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-mono">Ambient Off</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Tương truyền bế quan là biện pháp hiệu quả nhất để tẩy tủy luyện cốt, đẩy lùi lo âu lười biếng. Lựa chọn thời gian tịnh niệm và đóng chặt linh quan. 
          <span className="text-red-400 font-semibold block mt-1">
            ⚠️ TUYỆT ĐỐI NGHIÊM CẤM: Rời tab/thoát trò chơi trong lúc bế quan sẽ bị Tâm Ma phẫn phát dội phản chấn thảm thương (Trực tiếp trừ Tu Vi và tăng bạo Tâm Ma).
          </span>
        </p>

        {/* TIMER DISPLAY AREA */}
        <div className="flex flex-col items-center justify-center p-6 border border-slate-900 bg-slate-950/60 rounded-2xl mb-5">
          <div className="relative w-44 h-44 flex items-center justify-center">
            
            {/* SVG Progress Circle Ring */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="70"
                className="stroke-slate-900 stroke-[5] fill-none"
              />
              <circle
                cx="88"
                cy="88"
                r="70"
                className={`stroke-[5] fill-none transition-all duration-1000 ${
                  isActive ? "stroke-yellow-500" : "stroke-slate-800"
                }`}
                strokeDasharray="439.8"
                strokeDashoffset={isActive ? 439.8 * (1 - progressRatio) : 439.8}
                strokeLinecap="round"
              />
            </svg>

            {/* Micro Timer text */}
            <div className="text-center z-10">
              {isActive ? (
                <>
                  <div className="text-2xl font-bold font-mono text-slate-100 animate-pulse">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-yellow-500 font-mono mt-1 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></span>
                    Đang Nhập Định...
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold font-serif text-slate-400 flex items-center justify-center gap-1 hover:text-slate-300">
                    <span>{selectedDuration}m</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono mt-1">
                    Chờ khởi pháp trận
                  </div>
                </>
              )}
            </div>
          </div>

          {/* DURATION PICKERS (Visible only when inactive) */}
          {!isActive ? (
            <div className="flex flex-wrap items-center gap-1.5 mt-5 justify-center">
              {[10, 15, 25, 45].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSelectedDuration(mins)}
                  className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    selectedDuration === mins
                      ? "bg-yellow-500/15 border border-yellow-500/40 text-yellow-400"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                  }`}
                >
                  {mins}Phút
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 w-full flex flex-col items-center">
              {showCancelConfirm ? (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-center flex flex-col items-center gap-3 w-full animate-fade-in">
                  <span className="text-[11px] text-red-400 font-bold leading-relaxed">
                    ⚙️ PHÁ KHẢO CẢNH GIỚI: Đạo hữu dứt khoát chấm dứt Bế Quan giữa chừng? Tâm ma phản phệ sẽ trực tiếp dội phá tu vi cực nguy cấp!
                  </span>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        triggerBacklashBackplane();
                        setShowCancelConfirm(false);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-[10.5px] font-bold uppercase cursor-pointer"
                    >
                      Xác Nhận Bẻ Trận
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-400 text-[10.5px] font-mono cursor-pointer"
                    >
                      Bảo Trì Định Định
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-1.5 text-[10px] font-mono text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 animate-bounce" />
                  <span>Phá Trận (Chấp nhận Tẩu Hỏa)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* START TRIGGER */}
        {!isActive ? (
          <button
            onClick={() => startBeQuanSession(selectedDuration)}
            className="w-full py-3 px-4 rounded-xl font-serif text-sm font-bold bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(245,158,11,0.2)] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>KHỞI ĐỘNG CỰC LẠC BẾ QUAN ({selectedDuration} PHÚT)</span>
          </button>
        ) : (
          <div className="p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/20 text-center flex flex-col items-center justify-center">
            <span className="text-[11px] text-yellow-400 animate-pulse font-sans">
              🧘 <strong>Mắt nhìn thẳng, tai nghe tịnh thanh.</strong> Hãy chăm chú làm bài, tuyệt đối KHÔNG ĐƯỢC lướt Facebook hoặc nhảy sang các tab khác!
            </span>
          </div>
        )}
      </div>

      {/* DISCIPLINE LAW OF THE SACRED SECT */}
      <div className="p-4 rounded-2xl border border-slate-900 bg-slate-950/40 text-xs text-slate-400 space-y-3 font-sans leading-relaxed">
        <h4 className="font-serif font-bold text-slate-300 tracking-wider text-[11px] uppercase flex items-center gap-1 border-b border-slate-900 pb-2">
          <Brain className="w-3.5 h-3.5 text-yellow-500" />
          Kỷ Luật Tông Môn Qui Định
        </h4>
        <div className="space-y-2 text-[11px]">
          <p className="flex items-start gap-1.5">
            <span className="text-yellow-500 font-bold shrink-0">1.</span>
            <span><strong>Cấm sùng bái u muội:</strong> Khi nhập thiền (Bế Quan), màng lọc Thần Thức tiên môn tự khóa. Nếu rời mắt tịnh độ (Tab), linh áp rối loạn đan dược dội phát thảm hai.</span>
          </p>
          <p className="flex items-start gap-1.5">
            <span className="text-yellow-500 font-bold shrink-0">2.</span>
            <span><strong>Xây móng đan điền dồi dào:</strong> Hoàn thành tịnh thiền bế quan đem lại bão lượng Tu Vi trực tiếp cùng lượng Linh Thạch hào phóng cải thọ thể cốt.</span>
          </p>
          <p className="flex items-start gap-1.5">
            <span className="text-yellow-500 font-bold shrink-0">3.</span>
            <span><strong>Giải trừ Tâm Ma:</strong> Tu vi cao đến mấy mà Tâm Ma vượt ngưỡng 100% sẽ tẩu hỏa nhập ma, đóng băng 95% tu vi thụ động. Hãy chăm chỉ bế quan để mài mòn bóng tối nghiệp lực.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
