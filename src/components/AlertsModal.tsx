import React from "react";
import { X, AlertTriangle, AlertCircle, Info, Check, CheckCheck, Trash2, Volume2, VolumeX } from "lucide-react";

interface AlertItem {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  desc: string;
  time: string;
  resolved: boolean;
}

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  onResolveAlert: (id: string) => void;
  onResolveAll: () => void;
  soundMuted: boolean;
  setSoundMuted: (isMuted: boolean) => void;
}

export default function AlertsModal({
  isOpen,
  onClose,
  alerts,
  onResolveAlert,
  onResolveAll,
  soundMuted,
  setSoundMuted
}: AlertsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest font-mono">
                Cảnh Báo Hiện Trường Realtime
              </h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Thời gian thực LoRaWAN gửi tín hiệu về đồng áng.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio alarm mute selector */}
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 rounded-lg cursor-pointer"
              title={soundMuted ? "Ấn để phát âm thanh cảnh báo lúa chín" : "Ấn để tắt tiếng reo chuông"}
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list body */}
        <div className="p-6 space-y-4 max-h-[440px] overflow-y-auto">
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((al) => {
                const isCritical = al.type === "critical";
                const isWarning = al.type === "warning";
                
                return (
                  <div 
                    key={al.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                      al.resolved 
                        ? "bg-slate-50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850 opacity-55"
                        : isCritical
                          ? "bg-rose-500/5 dark:bg-rose-500/5 border-rose-500/20"
                          : isWarning
                            ? "bg-amber-500/5 dark:bg-amber-500/5 border-amber-500/20"
                            : "bg-blue-500/5 dark:bg-blue-500/5 border-blue-500/20"
                    }`}
                  >
                    {/* Icon mapping */}
                    <div className="mt-0.5 shrink-0">
                      {isCritical ? (
                        <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      ) : (
                        <Info className="w-5 h-5 text-blue-500" />
                      )}
                    </div>

                    {/* Desc content */}
                    <div className="flex-1 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${
                          al.resolved 
                            ? "text-slate-400 line-through" 
                            : isCritical 
                              ? "text-rose-500" 
                              : isWarning 
                                ? "text-amber-500" 
                                : "text-blue-500"
                        }`}>
                          {al.title}
                        </span>
                        <span className="text-[9px] text-slate-450 dark:text-slate-500 font-mono font-medium">{al.time}</span>
                      </div>
                      
                      <p className={`text-[11px] leading-relaxed ${al.resolved ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-600 dark:text-slate-300"}`}>
                        {al.desc}
                      </p>

                      {/* Tick handler resolve button */}
                      {!al.resolved && (
                        <button
                          onClick={() => onResolveAlert(al.id)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-205 border border-slate-200 dark:border-slate-700 rounded-lg text-[9px] font-mono font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Đánh dấu đã giải quyết</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-xs text-slate-600 dark:text-slate-405 font-bold">Cánh Đồng Bình Yên Vô Sự</p>
              <p className="text-[10px] text-slate-400 mt-1">Không ghi nhận sạt nước mặn rầy phấn trắng hay tụt phèn chua bất lợi.</p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        {alerts.some(a => !a.resolved) && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              onClick={onResolveAll}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-[10px] uppercase font-mono tracking-wider flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xử lý rầm rập tất cả</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
