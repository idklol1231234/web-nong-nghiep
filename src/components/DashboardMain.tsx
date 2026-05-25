import React from "react";
import { motion } from "motion/react";
import { 
  Sprout, 
  Droplet, 
  Thermometer, 
  CloudSun, 
  ChevronRight, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  BrainCircuit, 
  Flame, 
  Skull 
} from "lucide-react";
import { Farm, AIAnalysisResult } from "../types";

interface DashboardMainProps {
  farm: Farm;
  setGrowthStage: (stage: string) => void;
  aiResult: AIAnalysisResult | null;
  triggerAIAnalysis: () => void;
  loadingAI: boolean;
  onNavigateTab: (tab: string) => void;
  quickDiaryLogs: any[];
}

export default function DashboardMain({
  farm,
  setGrowthStage,
  aiResult,
  triggerAIAnalysis,
  loadingAI,
  onNavigateTab,
  quickDiaryLogs
}: DashboardMainProps) {
  const { N, P, K, ph, waterLevel, temperature, humidity } = farm.sensors;

  // 1. Threshold Evaluators
  const getNPKStatus = (val: number, type: "N" | "P" | "K") => {
    if (type === "N") {
      if (val < 100) return { label: "Cản trở", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/5", percent: "-12%" };
      return { label: "Lý tưởng", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/5", percent: "+4%" };
    }
    if (type === "P") {
      if (val < 30) return { label: "Hụt nhẹ", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", glow: "shadow-amber-400/5", percent: "-2%" };
      return { label: "Tốt", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/5", percent: "+0.5%" };
    }
    // K
    if (val < 65) return { label: "Thiếu hụt", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-rose-500/5", percent: "-8%" };
    return { label: "Dồi dào", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/5", percent: "+2.4%" };
  };

  const getPHStatus = (val: number) => {
    if (val < 5.0) return { label: "Đất chua phèn nặng", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30", glow: "shadow-rose-500/10 animate-pulse" };
    if (val < 5.5) return { label: "Phèn nhẹ", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/5" };
    if (val > 7.5) return { label: "Đất Kiềm cao", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/5" };
    return { label: "Ổn định", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/5" };
  };

  const getWeeklyWaterTarget = (stage: string) => {
    if (stage === "Gieo sạ") return { min: 0, max: 2, desc: "Bùn ẩm đến ráo xăm xắp" };
    if (stage === "Đẻ nhánh") return { min: 3, max: 5, desc: "Ngập nông phát chồi" };
    if (stage === "Làm đồng") return { min: 5, max: 8, desc: "Ngập đầm nuôi phấn" };
    if (stage === "Trổ bông") return { min: 5, max: 8, desc: "Ủ nước hạt mẩy" };
    return { min: 0, max: 1, desc: "Tháo khô kiệt gặt lúa" };
  };

  const getWaterStatus = (val: number, stage: string) => {
    const target = getWeeklyWaterTarget(stage);
    if (val < target.min) return { label: "Thiếu hụt cạn", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-rose-500/5" };
    if (val > target.max) return { label: "Quá tải ngập úng", color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20", glow: "shadow-sky-500/5" };
    return { label: `Chuẩn giai đoạn (${target.min}-${target.max}cm)`, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/5" };
  };

  const stages = [
    { id: "Gieo sạ", step: 1, title: "Gieo sạ", desc: "Mầm thóc phát rễ" },
    { id: "Đẻ nhánh", step: 2, title: "Đẻ nhánh", desc: "Mọc chồi tách bông" },
    { id: "Làm đồng", step: 3, title: "Làm đồng", desc: "Súc tích đồng non" },
    { id: "Trổ bông", step: 4, title: "Trổ bông", desc: "Phát bông phấn rộ" },
    { id: "Chín", step: 5, title: "Chín vàng", desc: "Tích gạo chắc bông" },
  ];

  // 2. Sparklines mini charts generator (SVG based)
  const renderSparkline = (points: number[], colorClass: string) => {
    const width = 80;
    const height = 24;
    const max = Math.max(...points) || 1;
    const min = Math.min(...points) || 0;
    const range = max - min || 1;
    const coordinates = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg className="w-20 h-6 shrink-0" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={colorClass}
          points={coordinates}
        />
      </svg>
    );
  };

  // Spark data
  const sparks = {
    N: [110, 115, 105, 95, 92, 85, N],
    P: [30, 28, 32, 35, 38, P, P],
    K: [75, 70, 68, 62, 58, 56, K],
    ph: [5.8, 5.7, 5.6, 5.4, 5.3, ph, ph],
    waterLevel: [8, 7, 5, 4, 3, waterLevel, waterLevel],
    temperature: [28, 29, 31, 32, 33, 32, temperature],
    humidity: [85, 82, 80, 78, 79, 78, humidity],
  };

  return (
    <div className="space-y-6">
      {farm.cooperationStatus && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
          <ChevronRight className="w-5 h-5 shrink-0 mt-0.5 text-amber-500 rounded-lg bg-amber-500/20 p-1" />
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold block mb-0.5 text-amber-600 dark:text-amber-500">Tình trạng đối tác hành chính</span>
            <p className="text-xs font-semibold">{farm.cooperationStatus}</p>
          </div>
        </div>
      )}

      {/* 1. Growth stage dynamic timeline */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-6 gap-4">
          <div>
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider font-mono">Đồng hồ tiến trình sinh học</span>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">Tiến Trình Sinh Trưởng Cây Lúa</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Chọn từng giai đoạn để tinh chỉnh khuyến khuyến nghị AI mốc đo tương thích.</p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Giai đoạn hiện tại: <span className="text-emerald-500 font-bold">{farm.growthStage}</span></span>
          </div>
        </div>

        {/* Desktop timeline steps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {stages.map((stage) => {
            const isSelected = farm.growthStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setGrowthStage(stage.id)}
                className={`relative p-3.5 rounded-2xl text-left transition-all cursor-pointer group ${
                  isSelected
                    ? "bg-slate-900 dark:bg-slate-950 border-2 border-emerald-500 text-white shadow-md shadow-emerald-500/10 translate-y-[-2px]"
                    : "bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300"
                }`}
              >
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                    isSelected ? "bg-emerald-500 text-slate-900 font-bold" : "bg-slate-250 dark:bg-slate-800 text-slate-500"
                  }`}>
                    Bước 0{stage.step}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </div>
                <h3 className={`font-bold text-sm ${isSelected ? "text-emerald-400" : "text-slate-800 dark:text-slate-200"}`}>
                  {stage.title}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-tight group-hover:text-slate-500 dark:group-hover:text-slate-400 font-sans">
                  {stage.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Core Realtime Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {/* Nitrogen Card */}
        {(() => {
          const npkStatus = getNPKStatus(N, "N");
          return (
            <motion.div 
              whileHover={{ scale: 1.01, y: -2 }}
              className={`p-4 bg-white dark:bg-slate-900 border ${npkStatus.border} rounded-2xl shadow-sm ${npkStatus.glow} transition-all duration-200`}
            >
              <div className="flex items-center justify-between text-slate-450 mb-3">
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-400">Đạm đố (N)</span>
                <Sprout className="w-4 h-4 text-green-500 shrink-0" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{N}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">mg/kg</span>
              </div>
              <div className="flex items-center justify-between mt-4 border-t border-slate-50 dark:border-slate-800/40 pt-3">
                <div className="flex flex-col">
                  <span className={`text-[9px] font-mono font-bold ${npkStatus.color}`}>{npkStatus.label}</span>
                  <span className="text-[8px] text-slate-400">Hội tụ</span>
                </div>
                {renderSparkline(sparks.N, npkStatus.color)}
              </div>
            </motion.div>
          );
        })()}

        {/* Phosphorus Card */}
        {(() => {
          const npkStatus = getNPKStatus(P, "P");
          return (
            <motion.div 
              whileHover={{ scale: 1.01, y: -2 }}
              className={`p-4 bg-white dark:bg-slate-900 border ${npkStatus.border} rounded-2xl shadow-sm ${npkStatus.glow} transition-all duration-200`}
            >
              <div className="flex items-center justify-between text-slate-450 mb-3">
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-400">Lân đố (P)</span>
                <Sprout className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{P}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">mg/kg</span>
              </div>
              <div className="flex items-center justify-between mt-4 border-t border-slate-50 dark:border-slate-800/40 pt-3">
                <div className="flex flex-col">
                  <span className={`text-[9px] font-mono font-bold ${npkStatus.color}`}>{npkStatus.label}</span>
                  <span className="text-[8px] text-slate-400">Hội tụ</span>
                </div>
                {renderSparkline(sparks.P, npkStatus.color)}
              </div>
            </motion.div>
          );
        })()}

        {/* Potassium Card */}
        {(() => {
          const npkStatus = getNPKStatus(K, "K");
          return (
            <motion.div 
              whileHover={{ scale: 1.01, y: -2 }}
              className={`p-4 bg-white dark:bg-slate-900 border ${npkStatus.border} rounded-2xl shadow-sm ${npkStatus.glow} transition-all duration-200`}
            >
              <div className="flex items-center justify-between text-slate-450 mb-3">
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-400">Kali đố (K)</span>
                <Sprout className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{K}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">mg/kg</span>
              </div>
              <div className="flex items-center justify-between mt-4 border-t border-slate-50 dark:border-slate-800/40 pt-3">
                <div className="flex flex-col">
                  <span className={`text-[9px] font-mono font-bold ${npkStatus.color}`}>{npkStatus.label}</span>
                  <span className="text-[8px] text-slate-400">Biến số</span>
                </div>
                {renderSparkline(sparks.K, npkStatus.color)}
              </div>
            </motion.div>
          );
        })()}

        {/* pH Card */}
        {(() => {
          const phStatus = getPHStatus(ph);
          return (
            <motion.div 
              whileHover={{ scale: 1.01, y: -2 }}
              className={`p-4 bg-white dark:bg-slate-900 border ${phStatus.border} rounded-2xl shadow-sm ${phStatus.glow} transition-all duration-200`}
            >
              <div className="flex items-center justify-between text-slate-450 mb-3">
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-400">Độ pH Đất</span>
                <Flame className={`w-4 h-4 ${ph < 5.2 ? "text-amber-500 animate-bounce" : "text-emerald-400"}`} />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{ph}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">gH</span>
              </div>
              <div className="flex items-center justify-between mt-4 border-t border-slate-50 dark:border-slate-800/40 pt-3">
                <div className="flex flex-col">
                  <span className={`text-[9px] font-mono font-bold ${phStatus.color}`}>{phStatus.label}</span>
                  <span className="text-[8px] text-slate-400">Trạng chất</span>
                </div>
                {renderSparkline(sparks.ph, phStatus.color)}
              </div>
            </motion.div>
          );
        })()}

        {/* Water Level Card */}
        {(() => {
          const waterStatus = getWaterStatus(waterLevel, farm.growthStage);
          return (
            <motion.div 
              whileHover={{ scale: 1.01, y: -2 }}
              className={`p-4 bg-white dark:bg-slate-900 border ${waterStatus.border} rounded-2xl shadow-sm ${waterStatus.glow} transition-all duration-200`}
            >
              <div className="flex items-center justify-between text-slate-450 mb-3">
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-400">Mực Nước</span>
                <Droplet className="w-4 h-4 text-blue-500 animate-pulse" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{waterLevel}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">cm</span>
              </div>
              <div className="flex items-center justify-between mt-4 border-t border-slate-50 dark:border-slate-800/40 pt-3">
                <div className="flex flex-col">
                  <span className={`text-[9px] font-mono font-bold ${waterStatus.color}`}>{waterStatus.label}</span>
                  <span className="text-[8px] text-slate-400">Chi Thủy</span>
                </div>
                {renderSparkline(sparks.waterLevel, waterStatus.color)}
              </div>
            </motion.div>
          );
        })()}

        {/* Temperature Card */}
        <motion.div 
          whileHover={{ scale: 1.01, y: -2 }}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-slate-300/5 transition-all duration-200"
        >
          <div className="flex items-center justify-between text-slate-450 mb-3">
            <span className="text-[10px] font-mono font-extrabold uppercase text-slate-400">Nhiệt độ</span>
            <Thermometer className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{temperature}</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">°C</span>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-slate-50 dark:border-slate-800/40 pt-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-bold text-slate-800 dark:text-slate-200">Bình thường</span>
              <span className="text-[8px] text-slate-400">Thượng thiên</span>
            </div>
            {renderSparkline(sparks.temperature, "text-amber-400")}
          </div>
        </motion.div>

        {/* Humidity Card */}
        <motion.div 
          whileHover={{ scale: 1.01, y: -2 }}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-slate-300/5 transition-all duration-200"
        >
          <div className="flex items-center justify-between text-slate-450 mb-3">
            <span className="text-[10px] font-mono font-extrabold uppercase text-slate-400">Độ ẩm khí</span>
            <CloudSun className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{humidity}</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">% RH</span>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-slate-50 dark:border-slate-800/40 pt-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-bold text-slate-800 dark:text-slate-200">Sương sâm</span>
              <span className="text-[8px] text-slate-400">Mẫu lượng</span>
            </div>
            {renderSparkline(sparks.humidity, "text-blue-400")}
          </div>
        </motion.div>
      </section>

      {/* 3. AI Smart Analyzer & Logging Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: AI Analyst Panel */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Cơ Chế Phân Tích Khuyến Nghị AI</h3>
              </div>
              <span className="text-[9px] px-2.5 py-1 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-full font-mono font-bold uppercase border border-emerald-500/20">
                Gemini 3.5 Engine
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Hệ thống Smart Rice AI tích hợp mô hình ngôn ngữ lớn để chuẩn đoán tình trạng nông thổ, lượng chất NPK, tính toán rủi ro đạo ôn, rầy nâu, vàng lá theo thời kỳ thực chất của nông trang dã ngoại.
            </p>

            {/* AI Response Block */}
            {aiResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-950/40 px-4 py-2 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <span className="text-slate-400">Mức Độ Cảnh Báo: </span>
                    <span className={`font-bold ${
                      aiResult.status === "critical" ? "text-rose-500" : aiResult.status === "warning" ? "text-amber-500" : "text-emerald-400"
                    } uppercase`}>
                      {aiResult.status === "critical" ? "Nguy cấp" : aiResult.status === "warning" ? "Cảnh báo" : "An toàn"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <span className="text-slate-400">Sâu bệnh nguy cơ: </span>
                    <span className={`font-bold ${
                      aiResult.disease_risk === "high" ? "text-rose-400" : aiResult.disease_risk === "medium" ? "text-amber-400" : "text-emerald-400"
                    } uppercase`}>
                      {aiResult.disease_risk === "high" ? "Cao" : aiResult.disease_risk === "medium" ? "Trung bình" : "Thấp"}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-500/5 dark:bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                  <p className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-bold mb-1">
                    Nhận xét nông học của AI
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{aiResult.crop_analysis}"
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-blue-400 uppercase font-mono tracking-wider font-bold">
                    Hành động khắc phục khuyên dùng
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {aiResult.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start space-x-2 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                <BrainCircuit className="w-8 h-8 text-slate-350 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-xs text-slate-400">Trình phân tích AI chưa chạy cho nông trường lúa lúc này.</p>
                <p className="text-[10px] text-slate-400 mt-1">Ấn nút khởi tạo phân tích bên dưới để nhận khuyến nghị NPK & Đạo Ôn thông minh.</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
            <button
              onClick={triggerAIAnalysis}
              disabled={loadingAI}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 transition-all"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>{loadingAI ? "AI Đang xử lý tính toán..." : "Chạy AI Analyst Tổng quan"}</span>
            </button>
            <button 
              onClick={() => onNavigateTab("ai_recommendations")}
              className="w-full sm:w-auto border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-5 py-3 rounded-xl text-xs transition-colors cursor-pointer text-center"
            >
              Xem Chi Tiết Khuyến Nghị & Báo Cáo CO₂
            </button>
          </div>
        </div>

        {/* Right col: Quick Farming Diary log views */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-50 dark:border-slate-800/40 mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Nhật Ký Canh Tác Gần Đây</h3>
              <button 
                onClick={() => onNavigateTab("diary")}
                className="text-[11px] text-emerald-500 hover:text-emerald-400 font-semibold flex items-center cursor-pointer"
              >
                <span>Tất cả</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {quickDiaryLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="group relative border-l-2 border-emerald-500/40 hover:border-emerald-500 pl-4 py-1 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono font-medium">
                      {new Date(log.date).toLocaleDateString("vi-VN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded font-bold uppercase">
                      {log.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1 truncate group-hover:text-emerald-400 transition-colors">
                    {log.content}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Bởi: {log.author} • Chi phí: {log.cost}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-6">
            <button
              onClick={() => onNavigateTab("diary")}
              className="w-full text-center py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              + Ghi nhận nhật ký mới
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
