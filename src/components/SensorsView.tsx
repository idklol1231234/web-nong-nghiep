import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  Activity, 
  Settings, 
  Calendar, 
  Info, 
  Droplets, 
  TrendingUp, 
  ThermometerSnowflake 
} from "lucide-react";
import { Farm, ChartPoint } from "../types";

interface SensorsViewProps {
  farm: Farm;
  historicalSeries: ChartPoint[];
  rangeFilter: "today" | "week" | "month" | "crop";
  setRangeFilter: (range: "today" | "week" | "month" | "crop") => void;
  onSimulateFluctuate: () => void;
}

export default function SensorsView({
  farm,
  historicalSeries,
  rangeFilter,
  setRangeFilter,
  onSimulateFluctuate
}: SensorsViewProps) {
  const [activeChartTab, setActiveChartTab] = useState<"npk" | "ph" | "water">("npk");

  // Format label helper
  const getRangeLabel = () => {
    if (rangeFilter === "today") return "24 giờ qua (Thời gian thực)";
    if (rangeFilter === "week") return "7 ngày qua";
    if (rangeFilter === "month") return "30 ngày qua";
    return "Vụ lúa hiện đại (60 ngày)";
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Filter Controls */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider font-mono">Trạm trung chuyển dữ liệu LoRaWAN</span>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">Biểu Đồ & Thống Kê Chi Tiết Cảm Biến</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Dữ liệu tự động cập nhật liên tục mỗi 30 giây từ các node cảm biến IoT.</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {([
            { id: "today", label: "Hôm nay" },
            { id: "week", label: "7 ngày qua" },
            { id: "month", label: "30 ngày" },
            { id: "crop", label: "Cả vụ mùa" }
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRangeFilter(opt.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                rangeFilter === opt.id
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10"
                  : "bg-slate-50 dark:bg-slate-950/40 border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {opt.label}
            </button>
          ))}

          {/* Simulate trigger button */}
          <button
            onClick={onSimulateFluctuate}
            className="p-2 border border-slate-150 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl cursor-pointer"
            title="Kích hoạt xung mô phỏng realtime"
          >
            <Activity className="w-4 h-4 animate-pulse" />
          </button>
        </div>
      </section>

      {/* 2. Visual Tab buttons for active chart representation */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveChartTab("npk")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeChartTab === "npk"
              ? "border-emerald-500 text-emerald-500 font-extrabold"
              : "border-transparent text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-450"
          }`}
        >
          Hàm lượng N-P-K Dinh Dưỡng
        </button>
        <button
          onClick={() => setActiveChartTab("ph")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeChartTab === "ph"
              ? "border-emerald-500 text-emerald-500 font-extrabold"
              : "border-transparent text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-450"
          }`}
        >
          Trực quan pH Đất Ruộng
        </button>
        <button
          onClick={() => setActiveChartTab("water")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeChartTab === "water"
              ? "border-emerald-500 text-emerald-500 font-extrabold"
              : "border-transparent text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-450"
          }`}
        >
          Mực Mước Lĩnh Thủy Area
        </button>
      </div>

      {/* 3. Main Chart Canvas Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-120 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Bộ giám tuyển: {getRangeLabel()}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[10px] text-slate-400 font-mono">
            <span>Độ đo: Trung bình giờ</span>
            <span>Khảo cứu: {historicalSeries.length} điểm ghi</span>
          </div>
        </div>

        <div className="h-96 w-full">
          {activeChartTab === "npk" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  label={{ value: "Hàm lượng (mg/kg)", angle: -90, position: "insideLeft", style: { fontSize: 9, fill: "#64748b" }, offset: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold", fontSize: "11px" }}
                  itemStyle={{ fontSize: "11px", color: "#f1f5f9" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Line 
                  name="Đạm (N - Nitrogen)" 
                  type="monotone" 
                  dataKey="N" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  name="Lân (P - Phosphorus)" 
                  type="monotone" 
                  dataKey="P" 
                  stroke="#34d399" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line 
                  name="Kali (K - Potassium)" 
                  type="monotone" 
                  dataKey="K" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === "ph" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="phGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" /> {/* Acidic bad */}
                    <stop offset="50%" stopColor="#10b981" /> {/* Ideal Green */}
                    <stop offset="100%" stopColor="#3b82f6" /> {/* Basic */}
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  domain={[3.5, 8.5]}
                  ticks={[4.0, 5.0, 5.5, 6.0, 6.5, 7.0, 8.0]}
                  label={{ value: "Thang đo pH", angle: -90, position: "insideLeft", style: { fontSize: 9, fill: "#64748b" }, offset: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px" }}
                  itemStyle={{ fontSize: "11px", color: "#f1f5f9" }}
                />
                <Line 
                  name="Chỉ số pH Đất" 
                  type="monotone" 
                  dataKey="ph" 
                  stroke="url(#phGradient)" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === "water" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="waterColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 15]}
                  label={{ value: "Mực nước (cm)", angle: -90, position: "insideLeft", style: { fontSize: 9, fill: "#64748b" }, offset: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px" }}
                  itemStyle={{ fontSize: "11px", color: "#f1f5f9" }}
                />
                <Area 
                  name="Mực nước thực tế" 
                  type="monotone" 
                  dataKey="waterLevel" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#waterColor)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 4. Agricultural guide legends */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-6 mt-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Dinh dưỡng chuẩn (NPK)</span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed leading-4">
              Hàm lượng dinh dưỡng tối thiểu để hạn chế hạt đèo lúa lép: Nitrogen đạt trên 100 mg/kg, Lân đạt trên 30 mg/kg, Kali đạt trên 60 mg/kg tùy theo chu trình đâm đồng rộ bông.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Phân định pH An Toàn</span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed leading-4">
              Vùng từ 5.5 đến 6.5 là tuyệt đỉnh an toàn cho rễ hấp thụ phân lân hữu cơ. Dưới 5.0 chỉ thị phuồng phèn chua nguy hiểm cực điểm, bà con nông gia cần tháo xả rửa mương hoặc khẩn cấp rải vôi xám nông nghiệp bồi lắng.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Luân dưỡng tưới tiêu Thủy nông</span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed leading-4">
              Giữ mực nước sâu 5-8 cm ở giai đoạn làm đồng mẫn cảm nặng. Trong thời kỳ lúa chín uốn câu vàng óng, tuyệt đối rút ráo cạn nước ruộng chuẩn khô đất để máy gặt đập thu hoạch thu dọn tốt lành.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
