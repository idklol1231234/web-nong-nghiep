import React from "react";
import { 
  LayoutDashboard, 
  Activity, 
  BrainCircuit, 
  Map, 
  Sparkles, 
  BellRing, 
  BookOpen, 
  Cpu, 
  Settings 
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: string;
  farmName: string;
}

export default function Sidebar({ currentTab, setCurrentTab, userRole, farmName }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "sensors", label: "Cảm biến & Biểu đồ", icon: Activity },
    { id: "ai_predictions", label: "Biểu đồ AI Dự đoán", icon: BrainCircuit },
    { id: "map", label: "Bản đồ ruộng", icon: Map },
    { id: "ai_recommendations", label: "Khuyến nghị AI", icon: Sparkles },
    { id: "alerts", label: "Hệ thống Cảnh báo", icon: BellRing },
    { id: "diary", label: "Nhật ký canh tác", icon: BookOpen },
    { id: "devices", label: "Quản lý thiết bị", icon: Cpu },
    { id: "settings", label: "Cài đặt hệ thống", icon: Settings },
  ];

  return (
    <aside className="w-68 border-r border-slate-200/50 dark:border-white/5 bg-white/60 dark:bg-black/20 backdrop-blur-xl text-slate-800 dark:text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 select-none z-10 transition-colors">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center space-x-3 bg-white/40 dark:bg-black/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-green-500/10">
          <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
            <span className="font-extrabold text-lg text-green-400 tracking-wider">NN</span>
          </div>
        </div>
        <div>
          <h1 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight leading-4">NONGNGHIEP.COM</h1>
          <span className="text-[10px] text-green-600 dark:text-green-400/80 font-mono tracking-widest font-semibold uppercase">IoT Agricultural</span>
        </div>
      </div>

      {/* Selected Farm Quick Badge */}
      <div className="px-4 py-3 mx-4 my-4 bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono font-bold">Khu vực giám sát</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate mt-0.5" title={farmName}>
          {farmName}
        </p>
        <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-600 dark:text-blue-400 font-semibold uppercase">
          Vai trò: {userRole}
        </span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left cursor-pointer ${
                isActive 
                  ? "bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 font-semibold" 
                  : "hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-150 text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-emerald-555 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer System Credits */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white/20 dark:bg-black/10 text-center flex flex-col items-center">
        <div className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[10px] text-slate-500 font-medium uppercase font-mono">Dữ liệu kết nối LoRaWAN</span>
        </div>
        <p className="text-[9px] text-slate-400 dark:text-slate-600 mt-1 font-mono">Phiên bản Hệ thống v2.6</p>
      </div>
    </aside>
  );
}
