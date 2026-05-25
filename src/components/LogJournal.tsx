import React, { useState } from "react";
import { BookOpen, Plus, Calendar, DollarSign, Filter, Tag, CheckCircle2 } from "lucide-react";
import { Farm, DiaryLog } from "../types";

interface LogJournalProps {
  farm: Farm;
  logs: DiaryLog[];
  onAddLog: (newLog: Omit<DiaryLog, "id" | "date">) => void;
}

export default function LogJournal({ farm, logs, onAddLog }: LogJournalProps) {
  const [diaryFilter, setDiaryFilter] = useState<string>("Tất cả");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields State
  const [category, setCategory] = useState("Bón phân");
  const [author, setAuthor] = useState("Kỹ sư Nông nghiệp");
  const [content, setContent] = useState("");
  const [cost, setCost] = useState("");

  const categoriesList = ["Bón phân", "Tưới bổ sung", "Phòng dập dịch", "Xử lý đất", "Kiểm mương"];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddLog({
      farmId: farm.id,
      category,
      author: author || "Kỹ sư",
      content,
      cost: cost ? `${Number(cost).toLocaleString("vi-VN")} VND` : "0 VND"
    });

    setContent("");
    setCost("");
    setShowAddForm(false);
  };

  const filteredLogs = diaryFilter === "Tất cả" 
    ? logs 
    : logs.filter(log => log.category === diaryFilter);

  // Total cost count for active logs representation
  const totalCost = filteredLogs.reduce((acc, log) => {
    const numericStr = log.cost.replace(/[^\d]/g, "");
    const parsed = parseInt(numericStr) || 0;
    return acc + parsed;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Overview Block */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider font-mono">Quản lý tài chính nông trại</span>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">Nhật Ký Canh Tác Thổ Chất</h2>
          <p className="text-xs text-slate-450 mt-1">Lưu trữ hoạt động lót nền, phun sương dẹp sâu bọ nội điền lúa.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-slate-900" />
          <span>{showAddForm ? "Hủy" : "Ghi nhận nhật ký nông nghiệp"}</span>
        </button>
      </section>

      {/* Grid: Form (conditional) & logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left filter rail & stats */}
        <div className="space-y-6 lg:col-span-1">
          {/* Add log form */}
          {showAddForm && (
            <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-lg shadow-emerald-500/5 animate-in slide-in-from-top-4 duration-300">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs mb-4 uppercase tracking-wider font-sans border-b border-slate-50 dark:border-slate-800 pb-2">
                Thêm Bản Ghi Mới
              </h3>
              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono mb-1.5">Mục canh tác:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl dark:text-slate-205 focus:outline-none"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono mb-1.5">Tác giả ghi nhận:</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                    placeholder="Tên kỹ sư đồng ruộng..."
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-155 dark:border-slate-800 p-2.5 rounded-xl dark:text-slate-205 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono mb-1.5">Chi tiết bón tưới (Nội dung):</label>
                  <textarea
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    placeholder="Ví dụ: Rải bồi lót vôi tiêu độc chua phèn bờ ruộng phân ô B1..."
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-155 dark:border-slate-800 p-2.5 rounded-xl dark:text-slate-205 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono mb-1.5">Kinh phí đầu tư (VND):</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="Ví dụ: 300000"
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-155 dark:border-slate-800 p-2.5 rounded-xl dark:text-slate-205 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Xác nhận lưu trữ sổ nông
                </button>
              </form>
            </div>
          )}

          {/* Stats Card */}
          <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
            <h4 className="text-[10px] text-slate-500 font-bold uppercase font-mono">Hạch Toán Chi Phí Log</h4>
            <div className="my-3 flex items-baseline space-x-1.5">
              <span className="text-3xl font-black text-emerald-400 font-sans">
                {totalCost.toLocaleString("vi-VN")}
              </span>
              <span className="text-xs text-slate-400">VND</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              Hóa đơn tổng cho các hạng mục <strong>{diaryFilter}</strong> trên cánh đồng nông nghiệp. Giúp quản lý chặt chẽ vật tư bón vôi phân.
            </p>
          </div>

          {/* Sidebar category filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
            <h4 className="text-slate-400 font-bold uppercase font-mono text-[9px] pb-2 border-b border-slate-50 dark:border-slate-805">
              BỘ LỌC HOẠT ĐỘNG
            </h4>
            {["Tất cả", ...categoriesList].map((opt) => (
              <button
                key={opt}
                onClick={() => setDiaryFilter(opt)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                  diaryFilter === opt
                    ? "bg-emerald-550/10 text-emerald-500"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <span>{opt}</span>
                {diaryFilter === opt && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 cols: Logs timeline lists */}
        <div className="lg:col-span-2 space-y-4">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm items-start flex justify-between gap-4 hover:border-emerald-500/20 transition-all"
              >
                <div className="space-y-2.5 flex-1">
                  {/* Title metadata */}
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase">
                      {log.category}
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono flex items-center space-x-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(log.date).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </span>
                  </div>

                  {/* Body Text */}
                  <p className="text-xs text-slate-700 dark:text-slate-205 leading-relaxed font-sans font-medium">
                    {log.content}
                  </p>

                  {/* Author detail */}
                  <div className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">
                    Biên soạn bởi: <strong className="text-slate-500 dark:text-slate-400">{log.author}</strong>
                  </div>
                </div>

                {/* Rightmost Cost Indicator Badge */}
                <div className="flex flex-col items-end pt-1 bg-slate-50 dark:bg-slate-950/40 px-3.5 py-2 border border-slate-150 dark:border-slate-805 rounded-xl select-none text-right">
                  <span className="text-[8px] text-slate-400 font-mono font-medium uppercase uppercase">Ngân sách</span>
                  <p className="font-extrabold text-xs text-slate-700 dark:text-emerald-400 font-mono">{log.cost}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-120 dark:border-slate-800 p-12 text-center rounded-2xl">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-xs text-slate-400">Không tìm thấy bản ghi chứa hoạt động nào trong lớp lọc.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
