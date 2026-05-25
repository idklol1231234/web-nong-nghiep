import React, { useState } from "react";
import { Settings, Shield, MapPin, Sliders, BellDot, Check, Info } from "lucide-react";
import { Farm } from "../types";

interface SettingsViewProps {
  farm: Farm;
  onUpdateFarmStageAndRole: (stage: string, role: string, sensors?: any) => void;
  farms: Farm[];
}

export default function SettingsView({ farm, onUpdateFarmStageAndRole, farms }: SettingsViewProps) {
  const [roleInput, setRoleInput] = useState<string>(farm.role);
  const [stageInput, setStageInput] = useState<string>(farm.growthStage);
  const [nitrogenInput, setNitrogenInput] = useState(farm.sensors.N.toString());
  const [potassiumInput, setPotassiumInput] = useState(farm.sensors.K.toString());
  const [phInput, setphInput] = useState(farm.sensors.ph.toString());
  const [waterLevelInput, setWaterLevelInput] = useState(farm.sensors.waterLevel.toString());
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFarmStageAndRole(stageInput, roleInput, {
      N: parseInt(nitrogenInput) || farm.sensors.N,
      K: parseInt(potassiumInput) || farm.sensors.K,
      ph: parseFloat(phInput) || farm.sensors.ph,
      waterLevel: parseFloat(waterLevelInput) || farm.sensors.waterLevel
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Form options */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800/40">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>Tinh Chỉnh Cảm Biến Realtime & Vai Trò</span>
          </h3>
          <p className="text-xs text-slate-450 mt-1">
            Điều phối các giá trị giả lập của hệ thống LoRaWAN, kiểm thử bối cảnh kích hoạt reo chuông báo động.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs text-slate-705 dark:text-slate-350">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Roles Section */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400">
                Ủy thác Vai Trò tài khoản:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Admin", "Kỹ sư", "Nông dân"].map((r) => {
                  const isChecked = roleInput === r;
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRoleInput(r)}
                      className={`py-2 px-3 border rounded-xl text-center font-semibold cursor-pointer transition-all ${
                        isChecked
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 font-extrabold"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-slate-850 dark:text-slate-400"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400">Thay đổi vai trò giúp hệ thống lọc hiển thị quyền hạn.</p>
            </div>

            {/* Growth stage adjustment */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400">
                Giai đoạn phát triển cây lúa:
              </label>
              <select
                value={stageInput}
                onChange={(e) => setStageInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl dark:text-slate-205 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                {["Gieo sạ", "Đẻ nhánh", "Làm đồng", "Trổ bông", "Chín"].map((stg) => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">Thay đổi chu kỳ làm đồng dọn úng để tùy biến phân hóa nước.</p>
            </div>
          </div>

          <div className="pb-2 border-b border-slate-100 dark:border-slate-800/20 pt-4">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
              Giả lập thông số cơ khí Sensors (Bộc lộc test)
            </h4>
            <p className="text-[10px] text-slate-400">Hạ thấp pH hay tụt nước để quan sát cảnh báo AI chẩn đoán reo vang dội.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Nitrogen (N) Đạm:</label>
              <input
                type="number"
                value={nitrogenInput}
                onChange={(e) => setNitrogenInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-2 rounded-lg font-medium dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Kali (K) Bông:</label>
              <input
                type="number"
                value={potassiumInput}
                onChange={(e) => setPotassiumInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-2 rounded-lg font-medium dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Độ pH Đất dưỡng:</label>
              <input
                type="number"
                step="0.1"
                value={phInput}
                onChange={(e) => setphInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-2 rounded-lg font-medium dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Mực Nước (cm):</label>
              <input
                type="number"
                step="0.5"
                value={waterLevelInput}
                onChange={(e) => setWaterLevelInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-2 rounded-lg font-medium dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-extrabold rounded-xl transition-all shadow-md shadow-emerald-500/5 flex items-center space-x-1.5 cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 text-slate-900" /> : <Sliders className="w-4 h-4 text-slate-900" />}
              <span>{isSaved ? "Đã ghi nhận thay đổi!" : "Lưu Trữ Cấu Hình"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Right Col: Safe thresholds review list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-xs space-y-6">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800/40">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
            <BellDot className="w-4 h-4 text-rose-500" />
            <span>Ngưỡng Reo Sóng Báo Động</span>
          </h4>
          <p className="text-[10px] text-slate-450 mt-1">Định mức an toàn sinh học của lúa nước truyền thống.</p>
        </div>

        <div className="space-y-4 font-mono text-[10px] leading-relaxed">
          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-2 border border-slate-100 dark:border-slate-805">
            <p className="font-bold text-rose-500 uppercase flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>Chỉ chuẩn phèn chua:</span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              pH dưới <strong>5.0</strong>: Kích hoạt cảnh báo ngộ độc phèn sắt phèn nhôm (Critical). Đất chua hốt rễ lúa.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-2 border border-slate-100 dark:border-slate-805">
            <p className="font-bold text-amber-500 uppercase flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Chỉ chuẩn Nitơ lỏng:</span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Đạm (N) dưới <strong>100 mg/kg</strong>: Cây lúa thấp còi, đẻ nhánh yếu ớt râm ran rạt ẩm.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-2 border border-slate-100 dark:border-slate-805">
            <p className="font-bold text-blue-500 uppercase flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Giới hạn Thủy lợi Đổ nước:</span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Quán tính nước dưới <strong>2cm</strong> thời kỳ làm đồng trổ bông: Reo báo động Step 3/4 mẫn cảm ẩm ướt nuôi đơm lúa ngập hạt lép trắng bồ.
            </p>
          </div>
        </div>

        <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1">
          <h5 className="text-[10px] text-emerald-400 font-bold uppercase flex items-center space-x-1">
            <Info className="w-3.5 h-3.5" />
            <span>Mẹo canh bẫy rầy nâu:</span>
          </h5>
          <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-1 leading-4">
            Thiết kế sensor rập bẫy rầy sáng ánh đèn tự động đếm mật độ con sập dịch. AI can thiệp sớm mộc cành bông thơm.
          </p>
        </div>
      </div>
    </div>
  );
}
