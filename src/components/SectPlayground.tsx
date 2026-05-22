import { useState, useEffect } from "react";
import { BookOpen, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, HelpCircle, GraduationCap, ChevronRight } from "lucide-react";
import { CultivationState, PracticeQuestion } from "../types";

interface SectPlaygroundProps {
  state: CultivationState;
  onStateUpdate: (updatedState: CultivationState) => void;
}

export function SectPlayground({ state, onStateUpdate }: SectPlaygroundProps) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch practice questions from API
  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/cultivation/practice/questions");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Submit Answer
  const handleSubmitAnswer = async (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsLoading(true);

    const question = questions[currentQuestionIndex];
    if (!question) return;

    try {
      const res = await fetch("/api/cultivation/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          answerIndex: index
        })
      });

      if (res.ok) {
        const data = await res.json();
        setIsAnswered(true);
        setFeedback({
          success: data.success,
          message: data.success 
            ? `Chính xác! Bạn được cộng Tu Vi và Linh thạch. Thần thức khai sáng!`
            : `Sai rồi! Đan điền xao động. Hãy nhớ: ${question.hint}`
        });
        onStateUpdate(data.state);
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Next Question with rotation
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setFeedback(null);
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

  // Change Pathway Handler
  const handleChangePathway = async (path: 'vocabulary' | 'speaking' | 'writing') => {
    try {
      const res = await fetch("/api/cultivation/character/change-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daoPath: path })
      });
      if (res.ok) {
        const data = await res.json();
        onStateUpdate(data);
      }
    } catch (err) {
      console.error("Error changing pathway:", err);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col gap-6 id-sect-playground">
      
      {/* CHOOSE CULTIVATION PATH */}
      <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 relative">
        <h4 className="font-serif font-bold text-slate-200 tracking-wider text-[12px] uppercase mb-3 flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-yellow-500" />
          Lựa Chọn Đại Đạo Học Tập (Study Pathway)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <button
            onClick={() => handleChangePathway("vocabulary")}
            className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
              state.daoPath === "vocabulary"
                ? "border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_12px_rgba(245,158,11,0.05)] text-slate-100"
                : "border-slate-850 hover:border-slate-800 bg-slate-900/40 text-slate-400"
            }`}
          >
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-yellow-500">PHƯƠNG PHÁP 01</span>
              <h5 className="font-bold text-xs mt-0.5 text-slate-200">Từ Vựng Đại Đạo</h5>
              <p className="text-[10px] text-slate-400 leading-normal mt-1">
                Linh hoạt tích lũy từ vựng học thuật thông qua trắc nghiệm linh khí.
              </p>
            </div>
            {state.daoPath === "vocabulary" && (
              <span className="absolute top-2.5 right-2 text-xs text-yellow-400 font-mono animate-pulse">● Khai mở</span>
            )}
          </button>

          <button
            onClick={() => handleChangePathway("speaking")}
            className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
              state.daoPath === "speaking"
                ? "border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_12px_rgba(245,158,11,0.05)] text-slate-100"
                : "border-slate-850 hover:border-slate-800 bg-slate-900/40 text-slate-400"
            }`}
          >
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-yellow-500">PHƯƠNG PHÁP 02</span>
              <h5 className="font-bold text-xs mt-0.5 text-slate-200">Khẩu Âm Thần Thông</h5>
              <p className="text-[10px] text-slate-400 leading-normal mt-1">
                Luyện rèn phản xạ Nói và Phát âm (Speaking Part 1 & 3).
              </p>
            </div>
            {state.daoPath === "speaking" && (
              <span className="absolute top-2.5 right-2 text-xs text-yellow-400 font-mono">● Khai mở</span>
            )}
          </button>

          <button
            onClick={() => handleChangePathway("writing")}
            className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
              state.daoPath === "writing"
                ? "border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_12px_rgba(245,158,11,0.05)] text-slate-100"
                : "border-slate-850 hover:border-slate-800 bg-slate-900/40 text-slate-400"
            }`}
          >
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-yellow-500">PHƯƠNG PHÁP 03</span>
              <h5 className="font-bold text-xs mt-0.5 text-slate-200">Thiên Thần Bút Pháp</h5>
              <p className="text-[10px] text-slate-400 leading-normal mt-1">
                Khai bút viết luận, nắm vững liên từ nâng cao (Writing Task 2).
              </p>
            </div>
            {state.daoPath === "writing" && (
              <span className="absolute top-2.5 right-2 text-xs text-yellow-400 font-mono">● Khai mở</span>
            )}
          </button>

        </div>
      </div>

      {/* CORE INTERACTIVE PLAYGROUND AREA */}
      <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/45">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-950 pb-3 justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-500" />
            <h3 className="font-serif font-bold text-[13px] text-slate-200 uppercase tracking-wider">
              Thiền Lâm Học Thuật (Interactive Study Arena)
            </h3>
          </div>
          <span className="px-2 py-0.5 text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono rounded">
            Đường hướng: {state.daoPath === "vocabulary" ? "TỪ VỰNG" : state.daoPath === "speaking" ? "HỒN PHÁT" : "BÚT PHÁP"}
          </span>
        </div>

        {/* CASE A: VOCABULARY PATH (ACTIVE INTERACTIVE MCQ TRIVIA) */}
        {state.daoPath === "vocabulary" && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-400 leading-relaxed mb-1">
              Học nghĩa của từ vựng học thuật thực tế để tích lũy chân linh. Bấm chọn đáp án đại diện cho chân lý từ học:
            </p>

            {currentQuestion ? (
              <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-900/80 flex flex-col gap-4">
                
                {/* Topic and clue indicators */}
                <div className="flex justify-between items-center text-[11px] border-b border-slate-900 pb-2">
                  <span className="text-yellow-500 font-mono">Chủ đề: {currentQuestion.topic}</span>
                  <span className="text-slate-500">Đề số: {currentQuestionIndex + 1}/{questions.length}</span>
                </div>

                {/* The actual question */}
                <p className="text-xs font-medium text-slate-200 leading-relaxed font-sans">
                  {currentQuestion.question}
                </p>

                {/* MCQ Options list */}
                <div className="flex flex-col gap-2 mt-2">
                  {currentQuestion.options?.map((option, idx) => {
                    // Styles based on answer status
                    let btnStyle = "border-slate-850 hover:bg-slate-900 text-slate-300";
                    if (selectedAnswer === idx) {
                      if (isAnswered) {
                        btnStyle = idx === currentQuestion.answerIndex 
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-bold"
                          : "border-red-500/50 bg-red-500/10 text-red-300 font-bold";
                      } else {
                        btnStyle = "border-yellow-500/60 bg-yellow-500/5 text-yellow-300 font-semibold";
                      }
                    } else if (isAnswered && idx === currentQuestion.answerIndex) {
                      // Highlight correct answer if incorrect option was chosen
                      btnStyle = "border-emerald-500/40 bg-emerald-500/5 text-emerald-400 font-semibold";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSubmitAnswer(idx)}
                        disabled={isAnswered || isLoading}
                        className={`w-full py-2.5 px-3 rounded-lg text-left text-xs transition-colors border flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span className="flex-1 text-slate-200">{option}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>

                {/* Explanatory annotation context */}
                {currentQuestion.context && (
                  <p className="text-[10px] text-slate-500 italic border-t border-slate-900 pt-3">
                    📖 Kinh chú: "{currentQuestion.context}"
                  </p>
                )}

                {/* Feedback with animations */}
                {feedback && (
                  <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
                    feedback.success 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-yellow-500/10 border-yellow-500/25 text-yellow-400/90"
                  }`}>
                    {feedback.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    )}
                    <div>{feedback.message}</div>
                  </div>
                )}

                {/* Next button */}
                {isAnswered && (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full mt-2 py-2 px-3 border border-yellow-500/20 hover:border-yellow-500/40 bg-yellow-500/15 text-yellow-400 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>TIẾP TỤC ĐỌC KINH MỤC KHÁC</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-600 italic text-xs">
                Đang triệu hồi linh kiếm trắc nghiệm...
              </div>
            )}
          </div>
        )}

        {/* CASE B: SPEAKING OR WRITING PATHWAYS (PROMPT FOR REAL TRIALS) */}
        {state.daoPath !== "vocabulary" && (
          <div className="flex flex-col gap-4 text-xs font-sans">
            <p className="text-slate-400 leading-relaxed">
              Con đường tu hành {state.daoPath === "speaking" ? "Speaking" : "Writing"} đòi hỏi sự thử thách thần niệm thâm hậu tại <strong>Cảnh Giới Đột Phá Điện</strong> ở tab kế tiếp.
            </p>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 flex flex-col gap-3">
              <h5 className="font-serif font-bold text-slate-300 text-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                Hướng Dẫn Luyện Tập Tập Trung
              </h5>
              <div className="space-y-2 text-[11px] text-slate-400">
                <p>
                  1. Hãy bấm chọn <strong>Bế Quan</strong> ở hộp thoại bên phải và thiết lập thời gian biểu tập trung học tập.
                </p>
                <p>
                  2. Suốt quá trình bế quan, hãy viết các bài luận TOEFL/IELTS của bạn, luyện nói trên giấy nháp hoặc làm bài tập ngoại ngữ thực thụ ở một thiết bị khác để biến thời gian phong tỏa thành thọ tủy đại lục.
                </p>
                <p>
                  3. Khi đã tích lũy đủ 100% Linh khí ở tầng cao nhất (SubLevel 9), hãy di chuyển vào tịnh thất <strong>Đột Phá Điện</strong>, soạn áng văn hoặc phát huy khẩu ngữ để <strong>Thái Thượng Trưởng Lão AI</strong> kiểm duyệt học lực và nâng cảnh giới (IELTS Bands)!
                </p>
              </div>
            </div>

            <button
              onClick={() => handleChangePathway("vocabulary")}
              className="w-full py-2.5 px-3 text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-yellow-500/30 rounded-xl transition-all cursor-pointer"
            >
              Chuyển Về Từ Vựng Để Chơi Trắc Nghiệm Tích Luỹ Thụ Động
            </button>
          </div>
        )}
      </div>

      {/* FOOTER ADVICE WRITING */}
      <div className="p-4 rounded-xl border border-yellow-500/5 bg-slate-950/20 text-[10px] text-slate-500 leading-relaxed font-mono flex items-start gap-1.5 justify-center">
        <HelpCircle className="w-3.5 h-3.5 text-yellow-500/50 shrink-0" />
        <span>Lời Sư Phụ: "Chớ thèm dùng tà đạo lừa dối trí tuệ. Mỗi câu chữ đúc kết hôm nay đem lại trái ngọt tương lai."</span>
      </div>
    </div>
  );
}
