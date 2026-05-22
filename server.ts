import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini SDK with User-Agent header
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

app.use(express.json());

// Path to persist cultivation state
const STATE_FILE = path.join(process.cwd(), "cultivation_state.json");

// IELTS Tiers with high-concept Tu Tien Vietnamese naming
const CULTIVATION_TIERS = [
  { id: 1, name: "Luyện Khí Kỳ", titleViet: "Phàm Nhân Vỡ Lòng", maxSubLevel: 9, baseRate: 0.15, requiredIelts: 4.0 }, 
  { id: 2, name: "Trúc Cơ Kỳ", titleViet: "Sơ Cấp Scholar", maxSubLevel: 9, baseRate: 0.35, requiredIelts: 5.0 },
  { id: 3, name: "Kết Đan Kỳ", titleViet: "Trung Cấp Đạo Sĩ", maxSubLevel: 9, baseRate: 0.85, requiredIelts: 6.0 },
  { id: 4, name: "Nguyên Anh Kỳ", titleViet: "Khá Giả Thần Thức", maxSubLevel: 9, baseRate: 1.85, requiredIelts: 7.0 },
  { id: 5, name: "Hóa Thần Kỳ", titleViet: "Cao Cấp Giáo Chủ", maxSubLevel: 9, baseRate: 3.85, requiredIelts: 8.0 },
  { id: 6, name: "Luyện Hư Kỳ", titleViet: "Đại Sư Lão Tổ", maxSubLevel: 9, baseRate: 7.50, requiredIelts: 8.5 },
  { id: 7, name: "Hợp Thể Kỳ", titleViet: "Chí Tôn học giả", maxSubLevel: 1, baseRate: 18.00, requiredIelts: 9.0 }
];

// Vocabulary practice database to allow client-side fast study
const PRACTICE_QUESTIONS = [
  {
    id: "vocab1",
    category: "vocabulary",
    topic: "Work & Education",
    question: "Which of the following words is a formal academic synonym for 'important' or 'essential'?",
    options: ["Trivial (Phàm tục)", "Crucial (Vô cùng hệ trọng)", "Superficial (Nông cạn)", "Redundant (Dư thừa)"],
    answerIndex: 1,
    hint: "'Crucial' carries extreme weight in academic writing and spiritual breakthroughs.",
    context: "Sử dụng 'Crucial' để thăng hoa ngôn từ khí môn thay cho 'important' phàm tục."
  },
  {
    id: "vocab2",
    category: "vocabulary",
    topic: "Technology & Innovation",
    question: "Choose the word that means 'to completely transform or drastically change an industry':",
    options: ["Hinder (Cản trở)", "Revolutionize (Cách mạng hóa)", "Suppress (Đàn áp)", "Stagnate (Trì trệ)"],
    answerIndex: 1,
    hint: "'Revolutionize' means to bring total and dynamic positive transformation.",
    context: "Mỗi nỗ lực tích hợp trí tuệ nhân tạo sẽ revolutionize bộ mặt học tập của đạo hữu."
  },
  {
    id: "vocab3",
    category: "vocabulary",
    topic: "Environment & Ecosystems",
    question: "What is the correct term for 'the variety of plant and animal life in a particular habitat'?",
    options: ["Monoculture (Khu biệt canh)", "Biosphere (Sinh quyển)", "Biodiversity (Đa dạng sinh học)", "Homogeneity (Tính đồng nhất)"],
    answerIndex: 2,
    hint: "Think of bio-diversity (variety of biological living organisms).",
    context: "Biodiversity là mạch đan điền tự nhiên nuôi dưỡng linh khí linh thú của tông môn."
  },
  {
    id: "vocab4",
    category: "vocabulary",
    topic: "Society & Mindset",
    question: "If a tradition is 'deeply ingrained' in a community, it means the tradition is...",
    options: ["Weakly respected", "Firmly established and very difficult to change", "Newly invented by a sect", "Universally despised"],
    answerIndex: 1,
    hint: "'Ingrained' represents something woven deeply into the roots of culture.",
    context: "Deeply ingrained tựa như tâm ma bám rễ sâu thẳm, cực kỳ nan giải để trục xuất."
  },
  {
    id: "vocab5",
    category: "vocabulary",
    topic: "Academic English",
    question: "Select the most appropriate verb that means 'to accumulate or gather knowledge/skills over time':",
    options: ["Acquire (Thụ nhận/Đạt được)", "Renounce (Từ bỏ)", "Squander (Hao phí)", "Overlook (Bỏ sót)"],
    answerIndex: 0,
    hint: "'To acquire language' is a natural and holy study progression.",
    context: "Acquire tri thức chính là quá trình thổ nạp chân tài linh khí vào tiên điện!"
  },
  {
    id: "vocab6",
    category: "vocabulary",
    topic: "Economy & Development",
    question: "When some resources are 'scarce', it means they are...",
    options: ["Abundant and overflowing", "Extremely limited or in short supply", "Infinitely cheap", "Useless and toxic"],
    answerIndex: 1,
    hint: "Think about 'scarcity', when demand exceeds supply.",
    context: "Linh thạch thượng phẩm luôn là tài nguyên 'scarce' chốn tu đạo."
  },
  {
    id: "vocab7",
    category: "vocabulary",
    topic: "Academic Verb",
    question: "Which verb means 'to support, encourage, or bring about the development of something'?",
    options: ["Foster (Nuôi dưỡng/Thúc đẩy)", "Deter (Ngăn chặn)", "Jeopardize (Gây nguy hại)", "Nullify (Vô hiệu hóa)"],
    answerIndex: 0,
    hint: "'Foster' is commonly used with creativity, relationships, and learning environments.",
    context: "Trận pháp bế quan này nhằm mục đích 'foster' tính kỷ luật tuyệt đỉnh của đạo hữu."
  },
  {
    id: "vocab8",
    category: "vocabulary",
    topic: "Sociology & Health",
    question: "What is a major academic keyword for 'causing a negative, harmful, or damaging effect'?",
    options: ["Beneficial", "Benign", "Detrimental (Nhận tác động xấu/Bất lợi)", "Ineffective"],
    answerIndex: 2,
    hint: "Smoking or lack of focus has a highly 'detrimental' impact on health and cultivation.",
    context: "Việc lơ là xao nhãng có tác hại 'detrimental' trực tiếp dội ngược lên Tu Vi."
  },
  {
    id: "vocab9",
    category: "vocabulary",
    topic: "Change & Adapting",
    question: "Which adjective represents something that 'undergoes constant change' or is 'highly active and full of energy'?",
    options: ["Static", "Monotonous", "Dynamic (Năng động/Kỳ vĩ liên tục)", "Dormant"],
    answerIndex: 2,
    hint: "A 'dynamic' environment changes and adapts to surrounding spiritual fields.",
    context: "Thế giới hiện đại là một đại chuỗi 'dynamic' biến đổi bất quy tắc."
  }
];

// IELTS Great Challenges (Breakthroughs per major Band level transition)
const BREAKTHROUGH_CHALLENGES: Record<number, { title: string, description: string, requirement: string, placeholder: string }> = {
  1: {
    title: "Vượt Trúc Cơ Kỳ (Thách Thức IELTS Band 4.5 - 5.0)",
    description: "Hãy vượt qua bài nói tự chọn giới thiệu bản thân bằng Anh ngữ: 'What is your favorite hobby and why do you enjoy it?'",
    requirement: "Soạn tối thiểu 35 từ. Phải dùng cấu trúc diễn đạt sở thích (ví dụ: 'I am extremely keen on...', 'It allows me to relax...', 'foster my passion').",
    placeholder: "My favorite hobby is reading academic books because it helps me expand my mind and..."
  },
  2: {
    title: "Vượt Kết Đan Kỳ (Thách Thức IELTS Band 5.5 - 6.0)",
    description: "Nhân vật cần giải đáp đạo lý về môi trường tự nhiên: 'Why is it important to protect wild animals and preserve nature?'",
    requirement: "Soạn tối thiểu 55 từ. Cần kết hợp tối thiểu 2 từ vựng cấp độ B2 (e.g. ecosystem, conservation, biodiversity, endangered species, global warming).",
    placeholder: "Protecting wild animals is of paramount importance. Firstly, it preserves biodiversity, which serves as the core of..."
  },
  3: {
    title: "Vượt Nguyên Anh Kỳ (Thách Thức IELTS Band 6.5 - 7.0)",
    description: "Sấm sét kiếp lôi nổ vang! Đối biện chủ đề học thuật: 'Should university education be completely free for all citizens?'",
    requirement: "Soạn lập luận tối thiểu 75 từ. Hãy đưa ra luận điểm đa chiều sắc sảo, dùng trạng từ bổ sung (e.g. from my perspective, tertiary education, government budget, tax revenues, equal educational opportunities).",
    placeholder: "In modern society, tertiary education plays a pivotal role in national development. On the one hand, making university free could..."
  },
  4: {
    title: "Vượt Hóa Thần Kỳ (Thách Thức IELTS Band 7.5 - 8.0)",
    description: "Thăng thiên linh giới tối cao! Phản biện luồng tư tưởng: 'Some people believe that technology makes us socially isolated. To what extent do you agree?'",
    requirement: "Soạn văn bia lập luận tối thiểu 95 từ. Dùng cấu trúc câu phức/câu điều kiện kiệt tác (e.g. double-edged sword, detrimental consequence, virtual connection, virtual interaction, foster genuine relationships).",
    placeholder: "While advanced technology has undeniably revolutionized human communication, critics argue that it leads to deep social isolation. In my opinion..."
  },
  5: {
    title: "Vượt Luyện Hư Kỳ (Thách Thức IELTS Band 8.5)",
    description: "Đại sâm nghiêm tháp! Nghị luận sâu sắc về chi phí khoa học: 'Should the government invest in space exploration instead of focus on poverty alleviation?'",
    requirement: "Yêu cầu tối thiểu 110 từ. Thể hiện tư duy triết lý cổ vương, cấu trúc song song tinh xảo kèm từ vựng cấp độ C1/C2 cực kỳ cao siêu.",
    placeholder: "The debate surrounding state expenditure on space ventures versus domestic poverty alleviation is highly complex. From my perspective, allocation of..."
  },
  6: {
    title: "Vượt Hợp Thể Kỳ (Độ Kiếp Thành Tiên - IELTS Band 9.0 Thánh Cốt)",
    description: "Thiên kiếp Sáng Thế Vô Song! Độc bản khẩu biệt: 'Can artificial intelligence completely replace human creativity in arts and literature? Why or why not?'",
    requirement: "Hùng văn tối thiểu 130 từ. Cần cấu trúc ngữ pháp thượng đẳng tuyệt luân, tư duy đa tầng uyên bác đánh thức sự kinh ngạc của Thái Thượng Trưởng Lão AI.",
    placeholder: "The emergence of powerful generative artificial intelligence systems has sparked fierce discourse regarding the future of human artistic expression..."
  }
};

// Initial state creator
function createInitialState(): any {
  return {
    name: "Tân Tiến Đạo Hữu",
    daoPath: "vocabulary", // vocabulary, speaking, writing
    tier: 1, // Luyện Khí Kỳ
    subLevel: 1, // Tầng 1
    tuVi: 0,
    tuViRequired: 100,
    spiritStones: 60,
    tamMa: 0,
    lastUpdate: Date.now(),
    activeBuffs: [],
    logs: [
      {
        id: "init",
        time: new Date().toLocaleTimeString("vi-VN"),
        message: "Chào mừng đạo hữu nhập cốc bế quan! Hãy cày từ vựng đạo thuật, mở rộng thần thức tiếng Anh, dẹp loài Tâm Ma lười biếng để thăng tiến tiên giới!",
        type: "info"
      }
    ],
    studyMinutes: 0,
    beQuanCount: 0,
    backlashCount: 0, // Number of tab-leaving incidents!
    answeredCount: 0,
    currentSession: null // Pomodoro session state tracker
  };
}

// Helper to calculate required Tu Vi for level up
function calculateRequiredTuVi(tier: number, subLevel: number): number {
  const base = 100;
  return Math.floor(base * Math.pow(1.5, tier - 1) * Math.pow(1.25, subLevel - 1));
}

// Load cultivation state from file or memory backup
let stateCache: any = null;
function loadState() {
  if (stateCache) return stateCache;
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, "utf-8");
      stateCache = JSON.parse(data);
    } else {
      stateCache = createInitialState();
      fs.writeFileSync(STATE_FILE, JSON.stringify(stateCache, null, 2));
    }
  } catch (err) {
    console.error("Error loading state:", err);
    stateCache = createInitialState();
  }
  return stateCache;
}

// Save cultivation state
function saveState(state: any) {
  stateCache = state;
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Error saving state:", err);
  }
}

// Add history log helper
function addLog(state: any, message: string, type: 'success' | 'warning' | 'danger' | 'info' = 'info') {
  const logId = String(Date.now() + Math.random());
  const now = new Date();
  const timeStr = now.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  state.logs.unshift({
    id: logId,
    time: timeStr,
    message,
    type
  });
  // Limit logs list
  if (state.logs.length > 50) {
    state.logs = state.logs.slice(0, 50);
  }
}

// Update state automatically (Idle Accumulation calculation)
function updateCultivationTime(state: any) {
  const now = Date.now();
  const elapsedSeconds = Math.max(0, (now - state.lastUpdate) / 1000);
  
  if (elapsedSeconds > 0) {
    const tierConfig = CULTIVATION_TIERS.find(t => t.id === state.tier) || CULTIVATION_TIERS[0];
    
    // Base Tu Vi rate (per second) based on current tier & sublevel. Boosted slightly to feel more dynamic!
    let rate = tierConfig.baseRate * (1 + (state.subLevel - 1) * 0.12) * 2;

    // Dynamic buffs check
    let multiplier = 1.0;
    const cleanBuffs: any[] = [];
    for (const buff of state.activeBuffs || []) {
      if (buff.expireTime > now) {
        cleanBuffs.push(buff);
        if (buff.type === "elixir") multiplier *= 1.8;
        if (buff.type === "tea") multiplier *= 1.5;
        if (buff.type === "focus") multiplier *= 3.0; // Massive multiplier from erfolgreichem Pomodoro
      }
    }
    state.activeBuffs = cleanBuffs;

    // Heart Devil impact: Higher Tâm Ma severely reduces peerless cultivation speed
    // at 100%+ Tâm Ma, rate drops to just 5%!
    const tamMaFactor = Math.max(0.05, 1 - (state.tamMa / 100) * 0.95);
    const finalRate = rate * multiplier * tamMaFactor;
    const gainedTuVi = elapsedSeconds * finalRate;

    // Check if at max subLevel of this tier and waiting for breakthrough exam
    // Tier id is 1-7. If subLevel is 9, they can't advance in subLevel until breakthrough is completed
    const isAtBreakthroughLimit = state.subLevel >= 9;
    
    if (isAtBreakthroughLimit) {
      const maxTuVi = state.tuViRequired;
      if (state.tuVi < maxTuVi) {
        state.tuVi = Math.min(maxTuVi, state.tuVi + gainedTuVi);
      }
    } else {
      state.tuVi += gainedTuVi;
      // Auto level-up subLevels if not at limit
      while (state.tuVi >= state.tuViRequired && state.subLevel < 9) {
        state.tuVi -= state.tuViRequired;
        state.subLevel += 1;
        state.tuViRequired = calculateRequiredTuVi(state.tier, state.subLevel);
        const tierName = CULTIVATION_TIERS.find(t => t.id === state.tier)?.name || "Luyện Khí";
        addLog(state, `Chúc mừng thúc tiến thần hồn! Bạn thăng lên ${tierName} - Tầng ${state.subLevel}!`, "success");
      }
    }

    // Passive Linh Thạch gain based on tier + focus
    const baseStoneGen = 0.02 * state.tier * elapsedSeconds * multiplier;
    state.spiritStones = Number((state.spiritStones + baseStoneGen).toFixed(2));

    state.lastUpdate = now;
  }
}

// Clean stale focus session if it completed silently
function verifyFocusSessionSilentEnd(state: any) {
  if (state.currentSession && state.currentSession.isActive) {
    const now = Date.now();
    const endTime = state.currentSession.startTime + state.currentSession.durationMs;
    // If the expected completion time has passed by more than 5 seconds, let's complete it automatically!
    if (now >= endTime) {
      const durationMin = Math.round(state.currentSession.durationMs / 60000);
      const rewardTuVi = durationMin * 350;
      const rewardStones = durationMin * 10;
      
      state.tuVi += rewardTuVi;
      state.spiritStones = Number((state.spiritStones + rewardStones).toFixed(2));
      state.studyMinutes += durationMin;
      state.beQuanCount += 1;
      
      // Reduce Tâm Ma as meditation cleanses negative energy
      state.tamMa = Math.max(0, state.tamMa - 30);
      
      // Inject focus buff of 15 minutes
      state.activeBuffs = state.activeBuffs || [];
      state.activeBuffs.push({
        type: "focus",
        expireTime: now + 900000,
        label: "Hộ Điện Tụ Linh (Phúc lợi bế quan: 3.0x Tốc độ tu luyện trong 15p)"
      });
      
      addLog(state, `🎉 [BẾ QUAN THÀNH CÔNG] Đạo hữu hoàn thành trọn vẹn khóa Thiền Tập bế quan kéo dài ${durationMin} phút! Tâm trí sáng tỏ, nhận ${rewardTuVi} Tu Vi, ${rewardStones} Linh thạch, dẹp trừ 30 điểm Tâm Ma. Kích hoạt 'Hội Điện Tụ Linh' nhân 3.0x tốc độ tu luyện thụ động!`, "success");
      
      // Update sublevel upgrades
      while (state.tuVi >= state.tuViRequired && state.subLevel < 9) {
        state.tuVi -= state.tuViRequired;
        state.subLevel += 1;
        state.tuViRequired = calculateRequiredTuVi(state.tier, state.subLevel);
      }
      
      state.currentSession = null;
    }
  }
}

// State endpoint
app.get("/api/cultivation/character", (req, res) => {
  const state = loadState();
  updateCultivationTime(state);
  verifyFocusSessionSilentEnd(state);
  saveState(state);
  res.json({
    ...state,
    tiers: CULTIVATION_TIERS,
    challenges: BREAKTHROUGH_CHALLENGES
  });
});

// Update character name
app.post("/api/cultivation/character/rename", (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: "Pháp danh đạo hữu không được để trống!" });
  }
  const state = loadState();
  state.name = name.trim();
  addLog(state, `Bạn đã sửa pháp danh thành "${state.name}". Bản mệnh phong thủy vương tài khai sáng!`, "info");
  saveState(state);
  res.json(state);
});

// Reset progress for debugging or re-cultivation
app.post("/api/cultivation/character/reset", (req, res) => {
  const newState = createInitialState();
  addLog(newState, "Linh căn tái tạo, luân hồi tái khởi! Đạo hữu gột rửa toàn bộ tu vi để bước vào chặng đường học tập mới.", "warning");
  saveState(newState);
  res.json(newState);
});

// Change selected Dao study pathway
app.post("/api/cultivation/character/change-path", (req, res) => {
  const { daoPath } = req.body;
  if (!["vocabulary", "speaking", "writing"].includes(daoPath)) {
    return res.status(400).json({ error: "Không tìm thấy con đường tu đạo phù hợp!" });
  }
  const state = loadState();
  state.daoPath = daoPath;
  let pathText = "Từ Vựng Đại Đạo (Vocabulary Master)";
  if (daoPath === "speaking") pathText = "Khẩu Âm Thần Thông (Speaking Apostle)";
  if (daoPath === "writing") pathText = "Thiên Thần Bút Pháp (Writing Master)";
  
  addLog(state, `Đạo hữu đã chuyển hướng đan điền sang con đường cày cuốc: ${pathText}!`, "info");
  saveState(state);
  res.json(state);
});

// ----------------------------------------------------
// BẾ QUAN (POMODORO FOCUS TIMER) ENDPOINTS
// ----------------------------------------------------

// Start a Bế Quan session (Pomodoro focus)
app.post("/api/cultivation/be-quan/start", (req, res) => {
  const { durationMinutes } = req.body;
  const minutes = Number(durationMinutes) || 25;
  
  const state = loadState();
  updateCultivationTime(state);
  
  if (state.currentSession && state.currentSession.isActive) {
    return res.status(400).json({ error: "Đạo hữu đang trong tịnh cốc bế quan rồi! Không thể lặp trận pháp." });
  }

  const durationMs = minutes * 60 * 1000;
  
  state.currentSession = {
    startTime: Date.now(),
    durationMs: durationMs,
    isActive: true
  };

  addLog(state, `🧘 Đạo hữu phong ấn tịnh cốc, bắt đầu BẾ QUAN TU CHÂN kéo dài ${minutes} phút. Đan điền khởi trận. Hãy giữ nguyên tiêu điểm, tuyệt đối KHÔNG ĐƯỢC rời tab này để lướt mạng xã hội tào lao, kẻo bị dính Kiếp lôi Phản Phệ cực thảm!`, "info");
  
  saveState(state);
  res.json(state);
});

// Backlash Trigger: triggered when user switches tabs or leaves application hidden!
app.post("/api/cultivation/be-quan/backlash", (req, res) => {
  const state = loadState();
  updateCultivationTime(state);
  
  if (!state.currentSession || !state.currentSession.isActive) {
    return res.json({ message: "Không nằm trong thời gian bế quán.", state });
  }
  
  // Backlash activates immediately!
  state.backlashCount = (state.backlashCount || 0) + 1;
  const tuViPenalty = 200 + state.tier * 50; 
  state.tuVi = Math.max(0, state.tuVi - tuViPenalty);
  state.tamMa = Math.min(100, state.tamMa + 20); // Massive boost in Heart Devil!
  state.currentSession = null; // Session gets aborted thảm thương!
  
  addLog(state, `🚨 [TẨU HỎA NHẬP MA] Ôi thôi! Đạo hữu đang trong đại trận Bế Quan lại mất tập trung lẻn đi lướt Facebook/Tiktok/Tab khác! Linh pháp sụp đổ dội ngược, bị trừ thẳng ${tuViPenalty} Tu Vi, dính Tâm ma phẫn nộ kích bộc +20%!`, "danger");
  
  saveState(state);
  res.json(state);
});

// Complete a Bế Quan session successfully
app.post("/api/cultivation/be-quan/complete", (req, res) => {
  const state = loadState();
  updateCultivationTime(state);
  
  if (!state.currentSession || !state.currentSession.isActive) {
    return res.status(400).json({ error: "Không phát hiện trận bế quan nào đang hoạt động." });
  }
  
  const now = Date.now();
  const session = state.currentSession;
  const elapsedMs = now - session.startTime;
  const expectedMs = session.durationMs;
  
  // Allow a tiny 10-second margin of developer mercy
  if (elapsedMs < expectedMs - 10000) {
    return res.status(400).json({ error: "Thời gian bế quan chưa mãn hạn, không thể phá quan sớm!" });
  }
  
  const durationMin = Math.round(expectedMs / 60000);
  const rewardTuVi = durationMin * 450; // High award for true discipline!
  const rewardStones = durationMin * 12;
  
  state.tuVi += rewardTuVi;
  state.spiritStones = Number((state.spiritStones + rewardStones).toFixed(2));
  state.studyMinutes += durationMin;
  state.beQuanCount += 1;
  state.tamMa = Math.max(0, state.tamMa - 25); // Reduces stress greatly!
  
  // Inject focus speed buff of 20 minutes (1,200,000 ms)
  state.activeBuffs = state.activeBuffs || [];
  state.activeBuffs.push({
    type: "focus",
    expireTime: now + 1200 * 1000,
    label: "Hộ Điện Tụ Linh (Phúc lợi bế quan: 3.0x Tốc độ tu luyện trong 20p)"
  });
  
  addLog(state, `🎉 [PHÁ QUAN ĐẮC ĐẠO] Đạo hữu thăng thành viên mãn buổi Bế Quan ${durationMin} phút tập trung cao độ! Đan điền nở rộ, nhận ${rewardTuVi} Tu Vi, ${rewardStones} Linh thạch, đẩy lùi 25 điểm Tâm Ma! Kỷ luật kiệt tác giúp đại vương tăng 3x tốc độ tu tích thụ động!`, "success");
  
  // Check leveling-up sublevels
  while (state.tuVi >= state.tuViRequired && state.subLevel < 9) {
    state.tuVi -= state.tuViRequired;
    state.subLevel += 1;
    state.tuViRequired = calculateRequiredTuVi(state.tier, state.subLevel);
  }
  
  state.currentSession = null;
  saveState(state);
  res.json(state);
});

// ----------------------------------------------------
// STUDY / PRACTICE QUESTIONS ENDPOINTS
// ----------------------------------------------------

// Fetch vocabulary practice questions
app.get("/api/cultivation/practice/questions", (req, res) => {
  res.json(PRACTICE_QUESTIONS);
});

// Submit answer for practice question
app.post("/api/cultivation/practice/submit", (req, res) => {
  const { questionId, answerIndex } = req.body;
  const state = loadState();
  updateCultivationTime(state);
  
  const question = PRACTICE_QUESTIONS.find(q => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: "Không tìm thấy câu hỏi luyện tập phù hợp!" });
  }
  
  const isCorrect = question.answerIndex === answerIndex;
  state.answeredCount = (state.answeredCount || 0) + 1;
  
  if (isCorrect) {
    const tuViGained = 40 + state.tier * 10;
    const stonesGained = 8 + state.tier * 2;
    state.tuVi += tuViGained;
    state.spiritStones = Number((state.spiritStones + stonesGained).toFixed(2));
    
    // Reduces Tâm Ma slightly due to correct answers
    state.tamMa = Math.max(0, state.tamMa - 3);
    
    addLog(state, `✅ [TỪ VỰNG OK] Trả lời chính xác đề mục '${question.topic}': +${tuViGained} Tu Vi, +${stonesGained} Linh thạch! Cốt cách khai sáng, dẹp yên 3% Tâm Ma.`, "success");
    
    // Check level up
    while (state.tuVi >= state.tuViRequired && state.subLevel < 9) {
      state.tuVi -= state.tuViRequired;
      state.subLevel += 1;
      state.tuViRequired = calculateRequiredTuVi(state.tier, state.subLevel);
    }
    
    saveState(state);
    res.json({ success: true, message: "Khai thông tri thức chính xác!", state });
  } else {
    // Punish slightly
    state.tamMa = Math.min(100, state.tamMa + 5);
    addLog(state, `❌ [TRẬN PHÁP SAI LỖI] Trả lời sai đề mục '${question.topic}'. Nhọc lòng u muội, Tâm Ma phát tác nhẹ +5%! Gợi ý từ sư phụ: "${question.hint}"`, "warning");
    
    saveState(state);
    res.json({ success: false, message: "Thần thức sai lệch! Học lại linh giải để khai trí.", state });
  }
});

// ----------------------------------------------------
// SHOP ENDPOINTS
// ----------------------------------------------------

app.post("/api/cultivation/shop/buy", (req, res) => {
  const { itemId } = req.body;
  const state = loadState();
  updateCultivationTime(state);

  if (!itemId) {
    return res.status(400).json({ error: "Vui lòng chọn cổ vật dược liệu cần mua!" });
  }

  let cost = 0;
  let actionText = "";
  let success = false;
  const now = Date.now();

  if (itemId === "elixir") {
    cost = 100;
    if (state.spiritStones >= cost) {
      state.spiritStones = Number((state.spiritStones - cost).toFixed(2));
      state.tamMa = Math.max(0, state.tamMa - 25);
      
      state.activeBuffs = state.activeBuffs || [];
      state.activeBuffs.push({
        type: "elixir",
        expireTime: now + 900 * 1000,
        label: "Thần Dược Tĩnh Tâm (1.8x Tu Vi trong 15 phút)"
      });
      actionText = "Mua thành công 'Thần Dược Tĩnh Tâm' từ tháp tiên! Giảm lập tức 25% Tâm Ma và gia tăng 1.8x linh lực thổ nạp trong 15 phút.";
      success = true;
    }
  } else if (itemId === "tea") {
    cost = 60;
    if (state.spiritStones >= cost) {
      state.spiritStones = Number((state.spiritStones - cost).toFixed(2));
      state.tamMa = Math.max(0, state.tamMa - 12);
      
      state.activeBuffs = state.activeBuffs || [];
      state.activeBuffs.push({
        type: "tea",
        expireTime: now + 600 * 1000,
        label: "Trà Tiên Vạn Hương (1.5x Tu Vi trong 10 phút)"
      });
      actionText = "Uống một gáo 'Trà Tiên Vạn Hương'! Khai thông mệt mỏi thần phế, dẹp yên 12% Tâm Ma và tăng 1.5x tu tập trong 10 phút sảng khoái.";
      success = true;
    }
  } else if (itemId === "ancient_oxford") {
    cost = 250;
    if (state.spiritStones >= cost) {
      state.spiritStones = Number((state.spiritStones - cost).toFixed(2));
      state.tuVi += 1200;
      actionText = "Khai quang mật tịch 'Cổ Thư Diệu Ngữ Oxford'! Luyện hóa bạo tăng ngay tức khắc 1,200 điểm Tu Vi phồn vinh!";
      success = true;
    }
  } else if (itemId === "grammar_purifier") {
    cost = 120;
    if (state.spiritStones >= cost) {
      state.spiritStones = Number((state.spiritStones - cost).toFixed(2));
      state.tamMa = 0; // Completely wipes out Heart Devil!
      actionText = "Nhai viên 'Thánh Đan Sạch Lỗi Ngữ Pháp'! Gột rửa linh hồn, tiêu trừ TOÀN BỘ bóng tối bóng ma của Tâm Ma (Tâm Ma trở về 0%!).";
      success = true;
    }
  }

  if (success) {
    addLog(state, `🛒 [LINH TIÊN DƯỢC] ${actionText}`, "success");
    
    // Check level up
    while (state.tuVi >= state.tuViRequired && state.subLevel < 9) {
      state.tuVi -= state.tuViRequired;
      state.subLevel += 1;
      state.tuViRequired = calculateRequiredTuVi(state.tier, state.subLevel);
    }

    state.lastUpdate = Date.now();
    saveState(state);
    res.json({ success: true, message: actionText, state });
  } else {
    res.status(400).json({ success: false, error: "Đạo hữu không đủ Linh Thạch để chi trả!" });
  }
});

// Admin Cheat / Boost Spirit Stones (Encouraging development)
app.post("/api/cultivation/character/cheat-stones", (req, res) => {
  const state = loadState();
  state.spiritStones += 150;
  addLog(state, "Sư mẫu yêu mến lén lút tiếp sức đạo hữu thêm 150 Linh Thạch luyện đan!", "info");
  saveState(state);
  res.json(state);
});

// ----------------------------------------------------
// GEMINI AI - BREAKTHROUGH TRIALS
// ----------------------------------------------------

app.post("/api/cultivation/breakthrough/evaluate", async (req, res) => {
  const { code } = req.body; // user's study written response in placeholder field!
  const state = loadState();
  updateCultivationTime(state);

  const currentTier = state.tier;
  const subLevel = state.subLevel;

  if (subLevel < 9) {
    return res.status(400).json({ error: "Chưa nạp đủ 9 tầng linh lực đan điền để tiến hành đại đột phá cảnh giới!" });
  }

  const challenge = BREAKTHROUGH_CHALLENGES[currentTier];
  if (!challenge) {
    return res.status(400).json({ error: "Đạo hữu đã đạt cảnh giới vương khoa tối cao vô thượng!" });
  }

  if (!code || code.trim().length === 0) {
    return res.status(400).json({ error: "Nội dung bút ký trả lời (khẩu quyết) không được bỏ trống!" });
  }

  // If Gemini API is not configured, run fallback smart evaluator
  if (!ai) {
    console.warn("Gemini API is not enabled. Running local automated feedback runner.");
    const wordCount = code.trim().split(/\s+/).length;
    let requiredWords = 30;
    if (currentTier === 2) requiredWords = 50;
    if (currentTier === 3) requiredWords = 70;
    if (currentTier >= 4) requiredWords = 90;

    const isCorrect = wordCount >= requiredWords && code.toLowerCase().length > 30;

    if (isCorrect) {
      state.tier += 1;
      state.subLevel = 1;
      state.tuVi = 0;
      state.tuViRequired = calculateRequiredTuVi(state.tier, state.subLevel);
      state.tamMa = Math.max(0, state.tamMa - 35);
      const tierName = CULTIVATION_TIERS[state.tier - 1].name;
      
      const responseText = `[ĐỘT PHÁ THỨC TỈNH CO-FALBAC] Thọ khí cực sảng. Thái Thượng sư phụ khen ngợi áng văn ${wordCount} từ của con. Dù thiếu vắng long mạch kết nối Gemini AI thực thụ, tri thức tự cường bạo tinh tiến đưa đạo hữu chân chính đột phá tiến vào [${tierName}]! Sạch bóng trần tâm, dẹp yên 35% Tâm Ma!`;
      addLog(state, responseText, "success");
      state.lastUpdate = Date.now();
      saveState(state);
      return res.json({ success: true, comment: responseText, state });
    } else {
      state.tamMa = Math.min(100, state.tamMa + 20);
      const responseText = `[ĐỘM PHÁ THẤT BẠI - CO-FALLBACK] Đoạn văn chưa đủ độ chín (chỉ có ${wordCount} từ so với yêu cầu tối thiểu ${requiredWords} từ hoặc văn phong còn hời hợt sơ sài). Đan điền dính phản chấn kịch liệt, Tâm Ma bạo khởi +20%! Hãy mài dũa bút lực kỹ càng hơn!`;
      addLog(state, responseText, "danger");
      state.lastUpdate = Date.now();
      saveState(state);
      return res.json({ success: false, comment: responseText, state });
    }
  }

  // We have Gemini AI enabled properly. Let's make an elite IELTS Evaluation!
  try {
    const requiredIeltsScore = CULTIVATION_TIERS[currentTier].requiredIelts;
    const systemPrompt = `You are the Great Patriarch of the Academic Coding Sect (Thái Thượng Trưởng Lão - Tông môn Tiên Giáo).
You evaluate the subscriber's IELTS English answers for their Breakthrough Trial.
They are breaking through from state tier ${currentTier} to ${currentTier + 1}.

Review criteria:
1. They must answer the specific challenge prompt: "${challenge.description}"
2. Check their requirement metrics: "${challenge.requirement}"
3. Score their text based on IELTS Band guidelines (Lexical Resource, Grammatical Range & Accuracy, Coherence & Cohesion).
4. Decide if their overall answer meets or exceeds IELTS Band ${requiredIeltsScore} for a successful breakthrough.

Return response strictly inside valid JSON format following this schema:
{
  "success": boolean (true if overall score >= ${requiredIeltsScore}, false otherwise),
  "band": number (their calculated IELTS band equivalent, e.g. 5.5, 6.0, 7.5, 8.5),
  "vocabularyScore": number (1 to 10 scale of lexical wealth),
  "grammarScore": number (1 to 10 scale of structural precision),
  "comment": string (An incredibly creative, poetic, and majestic comment in Vietnamese. Merge IELTS/English tutoring tips with Vietnamese Tu Tien mythology, spiritual pressure 'Linh áp', meridian blocks 'Xung đột linh mạch', 'tẩy tủy', and 'Hồng hoang vi diệu'. Highlight exact spellings/phrases that raised their band, or mock errors as chaotic impurities in their inner core. Write with the authoritative but motivating voice of a ancient Celestial Master).
}

Do not include any wrapper markdown blocks except the clean JSON itself. Ensure correct key names.`;

    const userContent = `User-submitted Answer:\n\`\`\`text\n${code}\n\`\`\``;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userContent,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: { type: Type.BOOLEAN, description: "True if user met IELTS requirements of the tier" },
            band: { type: Type.NUMBER, description: "IELTS Band equivalent score" },
            vocabularyScore: { type: Type.INTEGER, description: "Lexical rating" },
            grammarScore: { type: Type.INTEGER, description: "Grammar accuracy rating" },
            comment: { type: Type.STRING, description: "Detailed vietnamese tutoring feedback wrapped in Xianxia epic theme" }
          },
          required: ["success", "band", "vocabularyScore", "grammarScore", "comment"]
        }
      }
    });

    const textOutput = response.text || "{}";
    const result = JSON.parse(textOutput);

    if (result.success) {
      state.tier += 1;
      state.subLevel = 1;
      state.tuVi = 0;
      state.tuViRequired = calculateRequiredTuVi(state.tier, state.subLevel);
      state.tamMa = Math.max(0, state.tamMa - 35); // Big psychological relief!
      const tierName = CULTIVATION_TIERS[state.tier - 1].name;
      
      const fullComment = `✨ 【KỲ TÍCH ĐẮC ĐẠO - ĐỘT PHÁ THƯỢNG CẢNH GIỚI CHÍ TÔN】 \n\n🎯 Điểm IELTS quy học: Band ${result.band} (Cần tối thiểu: ${requiredIeltsScore})\n📖 Thần Thức Lexical: ${result.vocabularyScore}/10 | Pháp Lực Ngữ Pháp: ${result.grammarScore}/10\n\n${result.comment}`;
      
      addLog(state, `Đột phá thành công! Đạo hữu phi thăng tiến nhập cảnh giới [${tierName}]!`, "success");
      addLog(state, `Trưởng Lão Phê Ngự: "Đạt Band ${result.band} IELTS - Linh áp thâm hậu cực phẩm!"`, "info");
      
      state.lastUpdate = Date.now();
      saveState(state);
      return res.json({ success: true, comment: fullComment, state });
    } else {
      state.tamMa = Math.min(100, state.tamMa + 25);
      
      const fullComment = `⚡ 【ĐỘT PHÁ THẤT BẠI - THIÊN LÔI GIÁNG PHẢN CHẤN】 \n\n🎯 Điểm IELTS ước lượng: Band ${result.band} (Yêu cầu để vượt cảnh giới: ${requiredIeltsScore})\n📖 Thần Thức Lexical: ${result.vocabularyScore}/10 | Pháp Lực Ngữ Pháp: ${result.grammarScore}/10\n\n${result.comment}`;
      
      addLog(state, `Đột phá thất bại! Kiếp lôi cuồng dội, dính thảm họa Tâm Ma xáo động (+25%)!`, "danger");
      
      state.lastUpdate = Date.now();
      saveState(state);
      return res.json({ success: false, comment: fullComment, state });
    }
  } catch (err: any) {
    console.error("Gemini breakthrough evaluation error:", err);
    return res.status(500).json({ error: "Sấm sét kiếp lôi đánh loạn thiên cơ (Lỗi màng lưới Gemini AI: " + err.message + "). Vui lòng tu luyện thêm và chỉnh sửa lại." });
  }
});

// Serve frontend assets and start listening inside async function
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
