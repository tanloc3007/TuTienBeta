import { Coffee, ShieldCheck, Scroll, Zap, Sparkles, Coins } from "lucide-react";

interface ShopPavilionProps {
  spiritStones: number;
  onBuyItem: (itemId: string) => void;
  isProcessing: boolean;
}

export function ShopPavilion({ spiritStones, onBuyItem, isProcessing }: ShopPavilionProps) {
  const ITEMS = [
    {
      id: "tea",
      name: "Trà Tiên Vạn Hương",
      icon: <Coffee className="w-8 h-8 text-amber-500" />,
      cost: 60,
      benefit: "Giảm 12% Tâm Ma | 1.5x Tu Vi trong 10 phút",
      description: "Hương hoa nhẹ tịnh giúp gạt đi mệt mỏi ở các phế tích thần kinh. Cho đạo hữu cảm giác học tập sảng khoái vươn tầm cao.",
      color: "border-amber-500/15 hover:border-amber-500/35"
    },
    {
      id: "elixir",
      name: "Thần Dược Tĩnh Tâm",
      icon: <Sparkles className="w-8 h-8 text-rose-400" />,
      cost: 100,
      benefit: "Giảm 25% Tâm Ma | 1.8x Tu Vi trong 15 phút",
      description: "Thần dịch ép từ sâm cô đặc, dẹp phăng lo lắng xao lãng, định thần đan điền hấp thụ tối đại lượng linh khí.",
      color: "border-rose-500/15 hover:border-rose-500/35"
    },
    {
      id: "grammar_purifier",
      name: "Thánh Đan Sạch Lỗi Ngữ Pháp",
      icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
      cost: 120,
      benefit: "Gột Rửa Toàn Bộ Tâm Ma về 0%",
      description: "Kết cấu từ tinh thần diệu dụng sạch bóng lỗi logic và dấu câu lệch lạc. Quét trừ tất cả bóng tối, lấy lại cân khí bồ đề mượt mà.",
      color: "border-emerald-500/15 hover:border-emerald-500/35"
    },
    {
      id: "ancient_oxford",
      name: "Cổ Thư Diệu Ngữ Oxford",
      icon: <Scroll className="w-8 h-8 text-purple-400" />,
      cost: 250,
      benefit: "Thăng Tăng Ngay 1,200 Tu Vi lập tức",
      description: "Cuộn giấy da ghi chép các văn thơ và tinh anh từ điển vạn thuở cổ đại. Nuốt lấy tri thức để thăng thiên cấp độ.",
      color: "border-purple-500/15 hover:border-purple-500/35"
    }
  ];

  return (
    <div className="id-shop-pavilion">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-4 mb-5 gap-3">
        <div>
          <h2 className="text-md md:text-lg font-bold text-slate-100 font-serif">Linh Dược Học Đường</h2>
          <p className="text-xs text-slate-400 mt-0.5">Vận hành Linh Thạch đã thi đố để sắm tiên đan linh dược bổ trợ tu vi</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono shrink-0">
          <span className="text-slate-500">Túi Càn Khôn:</span>
          <Coins className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-bold text-amber-400">{Math.floor(spiritStones).toLocaleString()} Linh Thạch</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ITEMS.map((item) => {
          const canAfford = spiritStones >= item.cost;
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl bg-slate-950/40 border backdrop-blur-sm flex gap-4 transition-all duration-300 ${item.color}`}
            >
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-850 self-start">
                {item.icon}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-bold text-slate-200 text-xs font-sans">{item.name}</h4>
                    <span className="text-[9px] uppercase tracking-wider font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                      {item.cost} Thạch
                    </span>
                  </div>

                  <span className="inline-block text-[10px] font-bold text-yellow-500 mt-1 font-mono">
                    ✨ {item.benefit}
                  </span>

                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => onBuyItem(item.id)}
                  disabled={!canAfford || isProcessing}
                  className={`w-full mt-3 py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    canAfford
                      ? "bg-slate-900 border border-amber-500/30 hover:bg-amber-500/10 text-amber-400 hover:border-amber-400 font-mono"
                      : "bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed"
                  }`}
                >
                  {canAfford ? "MUA TIÊN DƯỢC" : "LƠ LÀ LINH THẠCH CHƯA ĐỦ"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
