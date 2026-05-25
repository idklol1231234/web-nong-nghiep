import React, { useState } from "react";
import { 
  Sparkles, 
  BrainCircuit, 
  Sprout, 
  Activity, 
  Droplets, 
  ShieldAlert, 
  FileText, 
  Download, 
  CalendarDays, 
  HelpCircle,
  Lightbulb,
  CheckCircle,
  Clock
} from "lucide-react";
import { Farm, AIAnalysisResult, AIReportResult } from "../types";

interface AIRecommendationsProps {
  farm: Farm;
  aiResult: AIAnalysisResult | null;
  triggerAIAnalysis: () => void;
  loadingAI: boolean;
  onGenerateReport: () => void;
  reportResult: AIReportResult | null;
  loadingReport: boolean;
}

export default function AIRecommendations({
  farm,
  aiResult,
  triggerAIAnalysis,
  loadingAI,
  onGenerateReport,
  reportResult,
  loadingReport
}: AIRecommendationsProps) {
  const [selectedAdvisoryStage, setSelectedAdvisoryStage] = useState<string>(farm.growthStage);

  // Growth advisory static knowledge base matching stage updates (highly specific Vietnamese agricultural insights)
  const advisoryKnowledgeBase: { [key: string]: { fertilizer: string; irrigation: string; disease: string; tips: string[] } } = {
    "Gieo sạ": {
      fertilizer: "Khuyên dùng phân Lân đầu trâu hoặc DAP lót nền (150-200 kg/ha). Hạn chế tối thiểu dùng đạm đố (Nitơ) lúc này đề phòng rễ lúa bị cháy mầm mọc.",
      irrigation: "Chỉ tháo rút xăm xắp bùn ẩm 0-2cm. Nước ngập sâu sẽ thối mầm lúa mạ.",
      disease: "Chú ý rầy phấn trắng, rầy mềm ăn mầm non và ốc bươu vàng gặm cuống mầm.",
      tips: [
        "Làm phẳng mặt ruộng để tránh ứ đọng nước cục bộ gieo úng mầm.",
        "Xử lý vôi khử chua tiêu độc môi trường phèn bám dính hạt giống.",
        "Rải thuốc diệt ốc bươu vàng dọc các mương rãnh nạp thoát nước."
      ]
    },
    "Đẻ nhánh": {
      fertilizer: "Thúc đợt 1 & 2: Bón 40% lượng Đạm (Nitơ) và 20% lượng Kali gốc để đẻ nhanh rộ mọc chồi con hữu hiệu đồng loạt.",
      irrigation: "Bơm tưới nước nông đầm ấm 3-5 cm. Kích thích cành đẻ gốc khỏe khắn.",
      disease: "Thời kì bùng phát sâu cuốn lá nhỏ mút mật lá non và bệnh đạo ôn ăn lá lân cận.",
      tips: [
        "Rải vôi bột giảm nghẹt rễ đen bùn hữu cơ ngộ độc rễ lúa.",
        "Bấm kiểm tra sọc thân dưới bẹ lá tìm rầy nâu mới phát sinh.",
        "Tỉa dặm thưa đều đặn mặt bông bờ lúa."
      ]
    },
    "Làm đồng": {
      fertilizer: "Đây là giai đoạn mấu chốt đón đồng: Tập trung bón thúc đón đồng bằng Kali clorua trắng (60-80 kg/ha) pha Urê tỉ lệ 1:1 dứt điểm để hạt lúa no tròn tăm tắp về sau.",
      irrigation: "Duy trì giữ đắp đầm ấm nước cao ổn định ở độ rộng 5-7 cm. Không cạn nước dứt đồng thụ bầu.",
      disease: "Cực kỳ mẫn cảm bệnh đạo ôn cổ bông, thối bẹ đồng hại hạt.",
      tips: [
        "Phun phòng trừ nấm bện và bù lạch hại lá tai đồng đón phấn.",
        "Không bón dư đạm làm đồng lỏng lẻo dễ gãy gục khi có cuồng phong mây mù.",
        "Thống kê đo pH kĩ để điều hòa lượng vôi tiêu độc rễ lúa hấp dưỡng chất Kali."
      ]
    },
    "Trổ bông": {
      fertilizer: "Tránh rải bón phân xới xáo gốc làm tổn thương bộ rễ. Nếu nhợt nhạt hãy phun lá Kali Humate bọc hạt vàng sáng bóng.",
      irrigation: "Tưới tràn ngập nông giữ sâu mức 5-8 cm. Lúa khát nước đoạn trổ hoa bầu sẽ làm lép hột 100%.",
      disease: "Đề phòng rầy nâu dập bờ phá bẹ, bệnh lúa lằn đỏ sọc lá cực nguy cơ dập dịch.",
      tips: [
        "Thường xuyên thám tra sâu kẽ bẹ lá lúa ban sương sớm.",
        "Phun Tilt Super bảo vệ lá tai bông bóng bẩy sáng mượt bóng lúa.",
        "Hạn chế phun xịt thuốc hóa học buổi sáng rộ thụ phấn hoa lúa hé nhụy."
      ]
    },
    "Chín": {
      fertilizer: "Dừng mọi hoạt động rải phân hóa học thúc đẩy lúa tự tích dồi gạo hữu cơ thăng tiến chín vàng.",
      irrigation: "Xả tháo cạn nước ráo hoàn toàn trước thời gian gặt đập máy kéo 8-10 ngày giúp tạo mặt sân khô chịu lực máy gặt lớn.",
      disease: "Mọt phá bông, rầy nâu lứa cuối ăn rơm rạ rạp đổ lúa.",
      tips: [
        "Bảo vệ chim, chuột phá hoại bông lúa uốn câu vàng óng.",
        "Lựa sắm sẵn lò sấy rơm, máy gặt đập để né tránh mưa lũ gặt ướt mầm thóc chín.",
        "Tổng dọn rơm rạ sau tháo rỡ chuẩn bị làm đất vụ lợp phù sa mới."
      ]
    }
  };

  const activeAdvisory = advisoryKnowledgeBase[selectedAdvisoryStage] || advisoryKnowledgeBase["Làm đồng"];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left 2 Cols: Main Advisory & AI outputs */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Core Live AI Recommendations panel */}
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800/60 mb-6 gap-4">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Live AI Smart Recommendation Engine</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Chẩn bệnh đất, bón bồi dinh dưỡng kịch thời dựa trên phán đoán Gemini.</p>
              </div>
            </div>
            
            <button
              onClick={triggerAIAnalysis}
              disabled={loadingAI}
              className="px-5 py-2.5 bg-slate-900 dark:bg-slate-950 font-bold hover:bg-slate-800 text-white rounded-xl text-xs flex items-center space-x-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              <span>{loadingAI ? "AI đang tư duy..." : "Khởi Động AI Chẩn Trị"}</span>
            </button>
          </div>

          {aiResult ? (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-mono font-bold uppercase">Trạng thái ruộng dã</span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      aiResult.status === "critical" ? "bg-rose-500 animate-ping" : aiResult.status === "warning" ? "bg-amber-500" : "bg-emerald-500"
                    }`}></span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {aiResult.status === "critical" ? "CẢM BIẾN NGUY CẤP" : aiResult.status === "warning" ? "CẢNH BÁO NHẸ" : "LÃO LUYỆN TOÀN TÂM"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-mono font-bold uppercase">Áp lực Đạo ôn & Sâu rầy</span>
                  <p className={`text-xs font-bold mt-1 uppercase ${
                    aiResult.disease_risk === "high" ? "text-rose-500" : aiResult.disease_risk === "medium" ? "text-amber-500" : "text-emerald-400"
                  }`}>
                    {aiResult.disease_risk === "high" ? "RẤT CAO - PHUN PHÒNG" : aiResult.disease_risk === "medium" ? "TRUNG BÌNH DỊCH" : "THẤP/AN TOÀN"}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-mono font-bold uppercase">Công cụ mô thức AI</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1 uppercase">
                    {aiResult.isAiPowered ? "Gemini 3.5-Flash (Thực)" : "Toán luật Smart Rice"}
                  </p>
                </div>
              </div>

              {/* Crop Analysis markdown text rendering */}
              <div className="bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl">
                <div className="flex items-center space-x-1.5 mb-2.5">
                  <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-emerald-400 font-bold uppercase font-mono tracking-wide">
                    Luận văn chẩn trị của AI
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {aiResult.crop_analysis}
                </p>
              </div>

              {/* AI action guidelines map */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-205 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Lời khuyên thao tác bờ ruộng phục vụ vụ mùa:</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiResult.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl hover:border-emerald-500/30 hover:scale-[1.005] transition-all">
                      <div className="flex items-start space-x-3">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                          {rec}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/10">
              <BrainCircuit className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto mb-4 animate-pulse" />
              <h4 className="text-slate-700 dark:text-slate-300 font-semibold text-xs mb-1">Thiết bị chẩn trị AI chưa được khởi động</h4>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Hãy click nút "Khởi Động AI Chẩn Trị" phía trên. Trí tuệ nhân tạo Gemini sẽ đọc toàn bộ cảm biến nông ruộng dồi dào và phản hồi hướng dẫn bón bồi cực chuẩn.
              </p>
            </div>
          )}
        </section>

        {/* Lifecycle stage-based dynamic advisory repository */}
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800/40 mb-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Cẩm Nang Kỹ Thuật Canh Tác Từng Giai Đoạn</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Tra nhanh chỉ dẫn NPK, sâu bọ và bồi nước mặn ngọt của các kỹ sư đầu ngành việt nam.</p>
          </div>

          {/* Quick tab stage selections */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["Gieo sạ", "Đẻ nhánh", "Làm đồng", "Trổ bông", "Chín"].map((stg) => (
              <button
                key={stg}
                onClick={() => setSelectedAdvisoryStage(stg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                  selectedAdvisoryStage === stg
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {stg}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl">
              <span className="text-[9px] text-emerald-550 dark:text-emerald-400 font-mono font-bold uppercase flex items-center space-x-1">
                <Sprout className="w-3 h-3 text-emerald-500" />
                <span>Bón Phân Tiêu Chuẩn</span>
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {activeAdvisory.fertilizer}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl">
              <span className="text-[9px] text-blue-500 dark:text-blue-400 font-mono font-bold uppercase flex items-center space-x-1">
                <Droplets className="w-3 h-3" />
                <span>Tưới Tiêu Thủy Lợi</span>
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {activeAdvisory.irrigation}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl">
              <span className="text-[9px] text-rose-500 dark:text-rose-450 font-mono font-bold uppercase flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3" />
                <span>Rủi Ro Khí Tượng Sâu Hại</span>
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {activeAdvisory.disease}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold mb-2">
              Bà con chú ý thao tác bờ ruộng:
            </p>
            <div className="space-y-2">
              {activeAdvisory.tips.map((tip, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-[11px] text-slate-605 dark:text-slate-350">
                  <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>

      {/* Right Col: Automated AI Season Report Panel */}
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6 overflow-hidden">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800/40 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Báo Cáo AI Mùa Vụ</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Tự động biên tập số liệu vụ mùa nông gia.</p>
            </div>
          </div>
          <button
            onClick={onGenerateReport}
            disabled={loadingReport}
            title="Biên tập báo cáo dựa trên số liệu hiện hữu"
            className="p-2 border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl cursor-pointer disabled:opacity-40"
          >
            <BrainCircuit className="w-4 h-4 text-blue-500 animate-spin" style={{ animationDuration: loadingReport ? "2s" : "0s" }} />
          </button>
        </div>

        {reportResult ? (
          <div className="flex-1 flex flex-col justify-between space-y-6">
            {/* Visual Formal Document printable paper style block */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 p-4 rounded-xl text-xs space-y-4 shadow-inner" id="report-paper">
              <div className="border-b border-dashed border-slate-300 dark:border-slate-700 pb-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest">{reportResult.title}</span>
                <p className="text-[9px] text-slate-400 font-mono mt-1">Thời gian lập: {reportResult.date} • Đồng ruộng: {farm.name}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 font-mono uppercase text-[9px] font-bold">Kỳ sinh trưởng</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{reportResult.growthStage}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-mono uppercase text-[9px] font-bold">Thủy nông hiệu suất</span>
                  <p className="text-slate-700 dark:text-slate-350 leading-relaxed bg-white dark:bg-slate-900 rounded p-2 border border-slate-100 dark:border-slate-800/60 font-sans">
                    {reportResult.waterEfficiency}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-mono uppercase text-[9px] font-bold">Hóa Thổ Hữu Cơ Chỉ Số</span>
                  <p className="text-slate-700 dark:text-slate-350 leading-relaxed bg-white dark:bg-slate-900 rounded p-2 border border-slate-100 dark:border-slate-800/60 font-sans">
                    {reportResult.soilFertilityStatus}
                  </p>
                </div>

                <div className="flex justify-between items-start border-t border-b border-dashed border-slate-200 dark:border-slate-800 py-2">
                  <span className="text-slate-400 font-mono uppercase text-[9px] font-bold">Dự báo gặt hái</span>
                  <span className="font-black text-rose-500 font-sans">{reportResult.predictedHarvestDate}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-mono uppercase text-[9px] font-bold">Khuyến cáo học viện nông học</span>
                  <p className="text-slate-700 dark:text-slate-350 italic mt-0.5 leading-relaxed font-sans font-medium text-[11px]">
                    "{reportResult.detailedComments}"
                  </p>
                </div>
              </div>
            </div>

            {/* Print/Download button */}
            <div className="flex space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
              <button
                onClick={handlePrint}
                className="w-full py-2.5 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs border border-slate-200 dark:border-slate-850 flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Xuất Báo Cáo / In Ấn</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
            <FileText className="w-8 h-8 text-slate-350 dark:text-slate-600 mb-3" />
            <p className="text-xs text-slate-400 mt-1 max-w-xs px-4">
              Sinh tự động báo cáo hoàn chỉnh về khả năng tích nước, bón thúc NPK và phân định ngày gặt hái.
            </p>
            <button
              onClick={onGenerateReport}
              disabled={loadingReport}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50 transition-all"
            >
              {loadingReport ? "Đang lập báo cáo..." : "Khởi Tạo Báo Cáo Ngay"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
