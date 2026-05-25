import React, { useState } from "react";
import { Search, Bell, Sun, Moon, Sprout, ChevronDown, Check } from "lucide-react";
import { Farm } from "../types";

interface HeaderProps {
  farms: Farm[];
  selectedFarm: Farm;
  setSelectedFarm: (farm: Farm) => void;
  darkTheme: boolean;
  setDarkTheme: (isDark: boolean) => void;
  notificationsCount: number;
  setShowAlertsModal: (show: boolean) => void;
}

export default function Header({ 
  farms, 
  selectedFarm, 
  setSelectedFarm, 
  darkTheme, 
  setDarkTheme,
  notificationsCount,
  setShowAlertsModal
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200/50 dark:border-white/5 bg-white/60 dark:bg-[#020617]/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
      {/* Left: Farm Selector dropdown */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10 text-slate-705 dark:text-slate-300 transition-all text-xs font-semibold cursor-pointer"
          >
            <Sprout className="w-4 h-4 text-emerald-500" />
            <span className="truncate max-w-44 md:max-w-64">{selectedFarm.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in duration-200">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono">
                  Danh sách trang trại liên kết
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto mt-1">
                {farms.map((f) => {
                  const isCur = f.id === selectedFarm.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        setSelectedFarm(f);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                        isCur ? "bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div>
                        <p className="text-xs">{f.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{f.location} • {f.size}</p>
                      </div>
                      {isCur && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle Search & Quick Navigation */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm kiếm rầy nâu, mức bón đạm, lịch kiểm tra..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl font-sans text-xs focus:ring-1 focus:ring-emerald-500 dark:text-slate-200 dark:placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Toggle Dark-Light Theme */}
        <button 
          onClick={() => setDarkTheme(!darkTheme)}
          className="p-2 rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          title="Thay đổi giao diện sáng/tối"
        >
          {darkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Dynamic Alarm Bell Button */}
        <button 
          onClick={() => setShowAlertsModal(true)}
          className="p-2 rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 relative transition-colors cursor-pointer"
          title="Thông báo cảnh báo đồng ruộng"
        >
          <Bell className="w-4 h-4" />
          {notificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-mono text-[9px] font-extrabold rounded-full flex items-center justify-center animate-bounce">
              {notificationsCount}
            </span>
          )}
        </button>

        {/* Separator line */}
        <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/5"></div>

        {/* User Account Capsule */}
        <div className="flex items-center space-x-2">
          <div className="text-right hidden sm:block">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-3">Kỹ sư Nông nghiệp</h4>
            <span className="text-[9px] text-slate-400 font-mono mt-0.5 inline-block">{selectedFarm.role}</span>
          </div>
          <div className="w-8 h-8 rounded-full ring-2 ring-emerald-500/20 overflow-hidden bg-slate-200 dark:bg-slate-800">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120" 
              alt="Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
