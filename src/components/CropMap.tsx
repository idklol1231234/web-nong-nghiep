import React, { useState } from "react";
import { MapPin, Battery, RefreshCw, Layers, ShieldAlert, Wifi, Info } from "lucide-react";
import { Farm, NodeInfo } from "../types";

interface CropMapProps {
  farm: Farm;
  onRefreshMap: () => void;
}

export default function CropMap({ farm, onRefreshMap }: CropMapProps) {
  const [heatmapType, setHeatmapType] = useState<"none" | "N" | "K" | "ph">("N");
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(farm.nodes[0] || null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hardcoded coordinates coordinates and sizes of simulated field zones
  const fieldZones = [
    { id: "zone_a", label: "Phân khu Thượng Độc A1", description: "Bờ kênh thủy lợi, dễ rỉ phèn chua", N_level: "Thấp", ph_level: "4.8 (Nguy cơ phèn)", K_level: "Bình thường", colorN: "fill-amber-500/20 stroke-amber-500/50", colorK: "fill-blue-500/10 stroke-blue-500/40", colorPh: "fill-rose-500/30 stroke-rose-500/60" },
    { id: "zone_b", label: "Phân khu Trung Tâm A2", description: "Đồi ráo thoáng mát, phát chồi nhanh", N_level: "Lý tưởng", ph_level: "6.0 (Tốt)", K_level: "Lý tưởng", colorN: "fill-emerald-500/20 stroke-emerald-500/40", colorK: "fill-blue-500/20 stroke-blue-500/40", colorPh: "fill-emerald-500/10 stroke-emerald-500/40" },
    { id: "zone_c", label: "Phân khu Hạ Lưu B1", description: "Vọng thấp tích phù sa nặng dinh dưỡng", N_level: "Thừa hữu cơ", ph_level: "5.5 (Tốt)", K_level: "Thiếu Kali", colorN: "fill-green-600/30 stroke-green-600/50", colorK: "fill-amber-500/20 stroke-amber-500/40", colorPh: "fill-emerald-500/10 stroke-emerald-500/45" },
    { id: "zone_d", label: "Phân khu Nội Đồng B2", description: "Khu đất ráo tơi xốp, bạt cỏ dại", N_level: "Bình thường", ph_level: "5.6 (Ổn định)", K_level: "Tốt", colorN: "fill-emerald-200/10 stroke-emerald-500/30", colorK: "fill-blue-500/20 stroke-blue-500/30", colorPh: "fill-emerald-500/10 stroke-emerald-500/35" }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      onRefreshMap();
      setIsRefreshing(false);
    }, 800);
  };

  const getHeatmapColor = (zone: typeof fieldZones[0]) => {
    if (heatmapType === "N") return zone.colorN;
    if (heatmapType === "K") return zone.colorK;
    if (heatmapType === "ph") return zone.colorPh;
    return "fill-slate-100/50 dark:fill-slate-800/10 stroke-slate-350 dark:stroke-slate-700";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Map canvas */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-6 gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Bản Đồ Phân Khu Ruộng & Node Liên Thiết LoRa</span>
              </h3>
              <p className="text-xs text-slate-450 mt-1">Sơ đồ máy bay khảo sát dã ngoại. Chọn bộ lọc để xem Heatmap lân đạm.</p>
            </div>

            {/* Heatmap selection toggle */}
            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-150 dark:border-slate-805">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 px-2">Heatmap:</span>
              <button
                onClick={() => setHeatmapType("N")}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${heatmapType === "N" ? "bg-emerald-500 text-white" : "text-slate-500"}`}
              >
                Đạm (N)
              </button>
              <button
                onClick={() => setHeatmapType("K")}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${heatmapType === "K" ? "bg-blue-500 text-white" : "text-slate-500"}`}
              >
                Kali (K)
              </button>
              <button
                onClick={() => setHeatmapType("ph")}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${heatmapType === "ph" ? "bg-rose-500 text-white" : "text-slate-500"}`}
              >
                pH Đất
              </button>
              <button
                onClick={() => setHeatmapType("none")}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${heatmapType === "none" ? "bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-300" : "text-slate-500"}`}
              >
                Tắt
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Map SVG Plot */}
        <div className="relative w-full aspect-[4/3] max-h-[420px] bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/80 rounded-2xl overflow-hidden flex items-center justify-center">
          
          <svg className="absolute inset-0 w-full h-full select-none" viewBox="0 0 600 450">
            {/* Grid references */}
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#64748b" strokeWidth="0.5" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Drawn rice plots based on bounds */}
            {/* Plot A1 */}
            <g className="cursor-help transition-opacity duration-350">
              <polygon 
                points="40,30 260,30 230,190 30,190" 
                className={`transition-all duration-300 ${getHeatmapColor(fieldZones[0])}`}
              />
              <text x="110" y="100" fill="#94a3b8" className="text-[10px] font-bold opacity-60 pointer-events-none">A1 (Chua phèn)</text>
            </g>

            {/* Plot A2 */}
            <g className="cursor-help transition-opacity duration-350">
              <polygon 
                points="280,30 560,30 560,190 250,190" 
                className={`transition-all duration-300 ${getHeatmapColor(fieldZones[1])}`}
              />
              <text x="380" y="100" fill="#94a3b8" className="text-[10px] font-bold opacity-60 pointer-events-none">A2 (Trung tâm)</text>
            </g>

            {/* Plot B1 */}
            <g className="cursor-help transition-opacity duration-350">
              <polygon 
                points="30,220 220,220 180,410 30,410" 
                className={`transition-all duration-300 ${getHeatmapColor(fieldZones[2])}`}
              />
              <text x="90" y="310" fill="#94a3b8" className="text-[10px] font-bold opacity-60 pointer-events-none">B1 (Hạ lưu - Thừa Đạm)</text>
            </g>

            {/* Plot B2 */}
            <g className="cursor-help transition-opacity duration-350">
              <polygon 
                points="240,220 560,220 560,410 200,410" 
                className={`transition-all duration-300 ${getHeatmapColor(fieldZones[3])}`}
              />
              <text x="360" y="310" fill="#94a3b8" className="text-[10px] font-bold opacity-60 pointer-events-none">B2 (Nội đồng)</text>
            </g>

            {/* Drawing Node locations */}
            {farm.nodes.map((node) => {
              // Convert coordinate offsets to custom pixel placements
              let x = 300;
              let y = 225;
              if (node.id === "node_lora_gw") { x = 280; y = 210; }
              else if (node.id === "node_soil_01") { x = 140; y = 110; }
              else if (node.id === "node_soil_02") { x = 440; y = 100; }
              else if (node.id === "node_water_01") { x = 350; y = 300; }
              else if (node.id === "node_water_02") { x = 110; y = 310; }

              const isSelected = selectedNode?.id === node.id;
              const isOffline = node.status === "offline";
              const isDanger = node.id === "node_soil_01" && farm.sensors.ph < 5.0; // special highlight for phèn

              return (
                <g 
                  key={node.id} 
                  className="cursor-pointer translate-x-0 translate-y-0"
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Glowing warning ring */}
                  {(isDanger || isSelected) && (
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={isSelected ? 18 : 14} 
                      className={`${isDanger ? "fill-rose-500/20 stroke-rose-500 animate-ping" : "fill-emerald-500/10 stroke-emerald-500"} stroke-1`} 
                    />
                  )}

                  {/* Main Node Point */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={7} 
                    className={`${
                      isOffline 
                        ? "fill-slate-500 stroke-slate-200" 
                        : isDanger 
                          ? "fill-rose-500 stroke-white" 
                          : "fill-emerald-400 stroke-slate-900 dark:stroke-slate-950"
                    } stroke-2`}
                  />
                  {/* Small antenna graphic */}
                  <line x1={x} y1={y - 7} x2={x} y2={y - 12} stroke={isOffline ? "#64748b" : isDanger ? "#f43f5e" : "#10b981"} strokeWidth="1.5" />
                  <circle cx={x} cy={y - 13} r={1.5} fill={isOffline ? "#64748b" : isDanger ? "#f43f5e" : "#10b981"} />
                </g>
              );
            })}
          </svg>

          {/* Compass / Location Indicator overlays */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-700/60 text-[10px] text-slate-300 font-mono flex flex-col">
            <span className="font-bold text-emerald-400">GPS VÕ TIÊU</span>
            <span>Vĩ độ: 10° 21' N</span>
            <span>Kinh độ: 106° 20' E</span>
          </div>

          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-700/60 text-[9px] text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Node LoRa trực tuyến</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <span>Node lỗi mạng / Pin cạn</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Khu vực ngộ độc chua phèn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Col: Node info detail panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-6 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">Chi Tiết Thiết Bị Node</h3>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 rounded-lg cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {selectedNode ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-xs ${
                  selectedNode.status === "offline" ? "bg-slate-100 dark:bg-slate-850 text-slate-400" : "bg-emerald-500/10 text-emerald-400"
                }`}>
                  {selectedNode.type === "lora_gateway" ? "GW" : selectedNode.type === "soil_node" ? "SO" : "WA"}
                </div>
                <div>
                  <h4 className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {selectedNode.id.toUpperCase()}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">
                    Kiểu: {
                      selectedNode.type === "lora_gateway" ? "Cổng chuyển Gateway LoRa" : selectedNode.type === "soil_node" ? "Node cảm biến Đất NPK" : "Node đo Thủy đồ Mực Nước"
                    }
                  </p>
                </div>
              </div>

              {/* Physical specifications */}
              <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-405 font-mono">Cách cổng sóng:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-250">
                    {selectedNode.id === "node_lora_gw" ? "0m - Trung tâm" : "Khoảng 140m"}
                  </span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-405 font-mono">Dung lượng pin:</span>
                  <div className="flex items-center space-x-1 font-bold text-slate-700 dark:text-slate-250">
                    <Battery className={`w-3.5 h-3.5 ${
                      selectedNode.battery < 20 ? "text-rose-500 animate-pulse" : selectedNode.battery < 50 ? "text-amber-500" : "text-emerald-500"
                    }`} />
                    <span>{selectedNode.battery}%</span>
                  </div>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-405 font-mono">Tín hiệu LoRa RF:</span>
                  <span className="font-bold text-emerald-400">
                    {selectedNode.status === "offline" ? "MẤT SÓNG RF" : "TUYỆT VỜI (-82dBm)"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-405 font-mono">Lần hoạt động cuối:</span>
                  <span className="font-bold text-slate-500">{selectedNode.lastPing}</span>
                </div>
              </div>

              {/* Soil plot assignment */}
              <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1">
                <h5 className="text-[10px] uppercase font-mono tracking-wide text-emerald-400 font-bold flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Khu đất quy trình:</span>
                </h5>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed leading-4">
                  Node này kiểm soát <strong>{selectedNode.type === "soil_node" ? "Chỉ hóa N-P-K và độ pH" : "Mực nước tích hạn và mực mương lọc"}</strong>. Báo động sẽ reo định kỳ nếu các ngưỡng an toàn của ruộng bị tụt dốc.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-12">Chọn một điểm tròn màu trên bản đồ để tra cứu dữ liệu cơ khí.</p>
          )}
        </div>

        {/* Multi-role settings link */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-8 flex flex-col space-y-2 text-[11px] text-slate-400 font-mono">
          <div className="flex justify-between">
            <span>Tổng cộng node:</span>
            <span className="text-slate-705 font-bold">5 thiết bị</span>
          </div>
          <div className="flex justify-between">
            <span>Node ngoại tuyến:</span>
            <span className="text-rose-450 font-bold">1 trạm (Water_02)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
