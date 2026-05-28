
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAO7e4lt1bMH9QWIQpwQ-aFb-gg1pUiVIM",
  authDomain: "htgstnrludai.firebaseapp.com",
  databaseURL: "https://htgstnrludai-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "htgstnrludai",
  storageBucket: "htgstnrludai.firebasestorage.app",
  messagingSenderId: "295019402400",
  appId: "1:295019402400:web:bdeaa27fe53531e19025c5",
  measurementId: "G-P49QX3QMR7"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardMain from "./components/DashboardMain";
import SensorsView from "./components/SensorsView";
import AIRecommendations from "./components/AIRecommendations";
import CropMap from "./components/CropMap";
import AIChatbot from "./components/AIChatbot";
import LogJournal from "./components/LogJournal";
import SettingsView from "./components/SettingsView";
import AlertsModal from "./components/AlertsModal";
import { Farm, ChartPoint, DiaryLog, AIAnalysisResult, AIReportResult, SensorData } from "./types";
import { AlertCircle, Terminal, CheckCircle2 } from "lucide-react";

// Mock database initializations
const INITIAL_FARMS: Farm[] = [
  {
    id: "farm_soc_trang",
    name: "Khu vực Giám sát Xã Nam Hải Lăng (Độc lập)",
    location: "Xã Nam Hải Lăng, Quảng Trị",
    size: "12,5 hécta",
    growthStage: "Làm đồng",
    role: "Kỹ sư",
    cooperationStatus: "Không hợp tác (Dự án bên ngoài giám sát độc lập, không liên kết với HTX/UBND xã Nam Hải Lăng)",
    sensors: {
      N: 92, // slightly low
      P: 38,
      K: 58, // slightly low
      ph: 4.8, // Phèn chua critical
      waterLevel: 5.5,
      temperature: 32,
      humidity: 82
    },
    nodes: [
      { id: "node_lora_gw", latOffset: 0, lngOffset: 0, status: "online", battery: 98, lastPing: "1 phút trước", type: "lora_gateway" },
      { id: "node_soil_01", latOffset: -10, lngOffset: -12, status: "online", battery: 89, lastPing: "30 giây trước", type: "soil_node" },
      { id: "node_soil_02", latOffset: 12, lngOffset: 15, status: "online", battery: 72, lastPing: "2 phút trước", type: "soil_node" },
      { id: "node_water_01", latOffset: 8, lngOffset: -8, status: "online", battery: 91, lastPing: "10 giây trước", type: "water_node" },
      { id: "node_water_02", latOffset: -15, lngOffset: 10, status: "offline", battery: 4, lastPing: "2 giờ trước", type: "water_node" }, // Offline alert
    ]
  },
  {
    id: "farm_dong_thap",
    name: "HTX Lúa Thơm Hữu Cơ Tam Nông (Đồng Tháp)",
    location: "Tam Nông, Đồng Tháp",
    size: "24,0 hécta",
    growthStage: "Đẻ nhánh",
    role: "Admin",
    sensors: {
      N: 130, // Ideal
      P: 42,
      K: 75, // Good
      ph: 6.2, // Ideal
      waterLevel: 4.0, // normal for tillering
      temperature: 29,
      humidity: 78
    },
    nodes: [
      { id: "node_lora_gw", latOffset: 0, lngOffset: 0, status: "online", battery: 100, lastPing: "Vừa xong", type: "lora_gateway" },
      { id: "node_soil_01", latOffset: -8, lngOffset: -10, status: "online", battery: 95, lastPing: "10 s trước", type: "soil_node" },
      { id: "node_soil_02", latOffset: 14, lngOffset: 12, status: "online", battery: 93, lastPing: "20 s trước", type: "soil_node" },
      { id: "node_water_01", latOffset: 6, lngOffset: -6, status: "online", battery: 97, lastPing: "Vừa xong", type: "water_node" },
    ]
  },
  {
    id: "farm_tien_giang",
    name: "Trang Trại Lúa VietGAP Cai Lậy (Tiền Giang)",
    location: "Cai Lậy, Tiền Giang",
    size: "8,2 hécta",
    growthStage: "Trổ bông",
    role: "Nông dân",
    sensors: {
      N: 115,
      P: 34,
      K: 66,
      ph: 5.6,
      waterLevel: 2.0, // Low for flowering stage
      temperature: 31,
      humidity: 80
    },
    nodes: [
      { id: "node_lora_gw", latOffset: 0, lngOffset: 0, status: "online", battery: 90, lastPing: "2 phút trước", type: "lora_gateway" },
      { id: "node_soil_01", latOffset: -6, lngOffset: -8, status: "online", battery: 81, lastPing: "1 phút trước", type: "soil_node" },
      { id: "node_water_01", latOffset: 5, lngOffset: -5, status: "online", battery: 85, lastPing: "1 phút trước", type: "water_node" },
    ]
  }
];

const INITIAL_LOGS: DiaryLog[] = [
  {
    id: "log_1",
    farmId: "farm_soc_trang",
    date: new Date(Date.now() - 3600000 * 4).toISOString(), // 4h ago
    author: "Kỹ sư Nông nghiệp",
    category: "Bón phân",
    content: "Rải bồi lót đón đồng đợt 2 bằng Kali Clorua trắng dứt điểm cho vạt lúa phân khu A1 ruộng phía trên bờ mương.",
    cost: "1.450.000 VND"
  },
  {
    id: "log_2",
    farmId: "farm_soc_trang",
    date: new Date(Date.now() - 3600000 * 25).toISOString(), // 25h ago
    author: "Kỹ sư Nông nghiệp",
    category: "Xử lý đất",
    content: "Sục bùn rải vôi xám nông nghiệp bồi lắng hỗ trợ giải lân phèn, giảm bớt độc tính Ion sắt nhôm tự do trong ruộng lúa có chỉ số pH sụt dưới 5.0.",
    cost: "800.000 VND"
  },
  {
    id: "log_3",
    farmId: "farm_dong_thap",
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
    author: "ADMIN (HTX)",
    category: "Phòng dập dịch",
    content: "Phun thử nghiệm đợt hữu cơ bằng dung dịch tỏi ớt xua đuổi bọ trĩ vàng, rầy phấn trắng tại gốc rơm ẩm.",
    cost: "450.000 VND"
  },
  {
    id: "log_4",
    farmId: "farm_tien_giang",
    date: new Date(Date.now() - 3600000 * 12).toISOString(),
    author: "Chủ trại Cai Lậy",
    category: "Tưới bổ sung",
    content: "Mở rộc cống lấy nước tràn mương tích hồ cấp ẩm tránh khô đất lúc lúa uốn câu rụt phấn.",
    cost: "150.000 VND"
  }
];

// Core app container
export default function App() {
  // --- ĐOẠN CODE ĐỌC DỮ LIỆU TỪ FIREBASE ĐỂ HIỂN THỊ VÀ ĐƯA RA LỜI KHUYÊN ---
  const [realtimeSensors, setRealtimeSensors] = React.useState({
    N: 92, P: 38, K: 58, ph: 4.8, waterlevel: 5.5, temperature: 32, humidity: 82
  });

  React.useEffect(() => {
    // Kết nối đến node gốc của Realtime Database
    const sensorRef = ref(database, '/');
    
    // Lắng nghe dữ liệu thay đổi liên tục
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log("Dữ liệu thực tế từ Firebase:", data);
        // Cập nhật các chỉ số thực tế nhận được từ cảm biến phần cứng
        setRealtimeSensors({
          N: data.N || data.nito || 92,
          P: data.P || data.photpho || 38,
          K: data.K || data.kali || 58,
          ph: data.ph || data.pH || 4.8,
          waterlevel: data.mucnuoc || data.waterlevel || 5.5,
          temperature: data.temperature || data.nhietdo || 32,
          humidity: data.humidity || data.doam || 82
        });
      }
    });

    return () => unsubscribe();
  }, []);
  // -------------------------------------------------------------------------
  const [farms, setFarms] = useState<Farm[]>(() => {
    const defaultFarms = [...INITIAL_FARMS];
    if (defaultFarms[0]) {
      defaultFarms[0].sensors = realtimeSensors;
    }
    return defaultFarms;
  });

  useEffect(() => {
    setFarms(prev => {
      const updated = [...prev];
      if (updated[0]) {
        updated[0].sensors = realtimeSensors;
      }
      return updated;
    });
  }, [realtimeSensors]);
  const [selectedFarm, setSelectedFarm] = useState<Farm>(INITIAL_FARMS[0]);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [darkTheme, setDarkTheme] = useState<boolean>(true);
  
  // Historical telemetry state
  const [historicalSeries, setHistoricalSeries] = useState<ChartPoint[]>([]);
  const [rangeFilter, setRangeFilter] = useState<"today" | "week" | "month" | "crop">("week");

  // AI Recommendation Engine and Reports state caches
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [reportResult, setReportResult] = useState<AIReportResult | null>(null);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  // Farming ledger journaling logs state
  const [logs, setLogs] = useState<DiaryLog[]>(INITIAL_LOGS);

  // Field real-time alarm list state
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showAlertsModal, setShowAlertsModal] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(true);

  // 1. Generate customized historical points based on selected farm's sensors
  useEffect(() => {
    const pointsCount = rangeFilter === "today" ? 12 : rangeFilter === "week" ? 7 : rangeFilter === "month" ? 15 : 30;
    const { N, P, K, ph, waterLevel, temperature, humidity } = selectedFarm.sensors;
    const arr: ChartPoint[] = [];

    for (let i = pointsCount - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * (rangeFilter === "today" ? 3600000 * 2 : 86400000));
      const variation = Math.sin(i * 0.8) * 4;
      arr.push({
        date: rangeFilter === "today" 
          ? d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
          : d.toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" }),
        N: Math.max(70, Math.round(N + variation * 1.5)),
        P: Math.max(20, Math.round(P + variation * 0.4)),
        K: Math.max(50, Math.round(K + variation * 1.2)),
        ph: Math.max(3.8, parseFloat((ph + variation * 0.08).toFixed(1))),
        waterLevel: Math.max(0, parseFloat((waterLevel + variation * 0.3).toFixed(1))),
        temperature: Math.round(temperature + Math.cos(i) * 1.8),
        humidity: Math.round(humidity + Math.sin(i) * 2),
      });
    }
    setHistoricalSeries(arr);
  }, [selectedFarm, rangeFilter]);

  // 2. Compute live warning states based on active thresholds
  useEffect(() => {
    const { N, ph, waterLevel } = selectedFarm.sensors;
    const stage = selectedFarm.growthStage;
    const dangerList = [];

    // Check pH
    if (ph < 5.0) {
      dangerList.push({
        id: "alert_ph_crit",
        type: "critical" as const,
        title: "Độc Tính Phèn Chua Nghiêm Trọng",
        desc: `Độ đo pH đạt ${ph} < 5.0 cực kỳ chua phèn cấp độ 1 tại phân khu A1. Nguy cơ lúa bó rễ không hấp thu mủ lót hữu cơ nông nghiệp. Bà con cần rải gấp vôi tiêu đôc.`,
        time: "10 phút trước",
        resolved: false
      });
    } else if (ph < 5.5) {
      dangerList.push({
        id: "alert_ph_warn",
        type: "warning" as const,
        title: "Dấu hiệu bám rễ nghẹt phèn",
        desc: `Chỉ số pH ${ph} hơi ngả chua xám bám dính. Theo dõi dòng chảy mương mặn tránh tăng phèn bồi lắng rơm ẩm.`,
        time: "32 phút trước",
        resolved: false
      });
    }

    // Check Water level based on Stage
    if (stage === "Làm đồng" && waterLevel < 4.5) {
      dangerList.push({
        id: "alert_water_low_dong",
        type: "critical" as const,
        title: "Cạn Kiệt Nước Đón Đồng",
        desc: `Mực nước thực tế là ${waterLevel}cm cực thâm hụt so với chuẩn sinh trưởng nuôi phấn giai đoạn đón đồng (5-7cm). Lúa sẽ lép hột nếu thiếu nước lúc này.`,
        time: "Vừa xong",
        resolved: false
      });
    } else if (stage === "Đẻ nhánh" && waterLevel > 8.0) {
      dangerList.push({
        id: "alert_water_flood",
        type: "warning" as const,
        title: "Ngập úng nhánh đẻ nông",
        desc: `Nước tràn dâng quá ${waterLevel}cm dìm bẹ đồng đẻ nhánh tẽ nhánh non hữu hiệu mẫn cảm rễ ngập sình bọt khí dính đất.`,
        time: "2 giờ trước",
        resolved: false
      });
    }

    // Check NPK Nitrogen levels
    if (N < 100) {
      dangerList.push({
        id: "alert_nitrogen_low",
        type: "info" as const,
        title: "Thâm Hụt Nồng Độ Đạm (N)",
        desc: `Hàm lượng đạm mộc chỉ còn ${N} mg/kg. Cần chuẩn bị thúc Urê đợt tiếp theo để dưỡng thân lá cứng cáp vươn chồi.`,
        time: "4 giờ trước",
        resolved: false
      });
    }

    // Check Offline node
    const offlineNode = selectedFarm.nodes.find(n => n.status === "offline");
    if (offlineNode) {
      dangerList.push({
        id: "alert_node_loss",
        type: "critical" as const,
        title: `Mất Sóng Lora Node: ${offlineNode.id.toUpperCase()}`,
        desc: "Mất xung kết nối vô tuyến Lora GW của trạm đo thủy văn sau rào chắn tre bụi cỏ rậm rì rạp lúa đổ mái tôn.",
        time: "5 giờ trước",
        resolved: false
      });
    }

    setAlerts(dangerList);

    // Audio buzzer trigger simulation
    if (dangerList.some(d => d.type === "critical") && !soundMuted) {
      // Gentle sine tone representing agricultural warning buzzer
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, ctx.currentTime); // 440hz buzzer
          gainNode.gain.setValueAtTime(0.04, ctx.currentTime); // soft sound
          osc.start();
          osc.stop(ctx.currentTime + 0.35); // brief beep
        } catch (e) {
          console.log("Audio alert blocked by browser permissions.");
        }
      }
    }

  }, [selectedFarm, soundMuted]);

  // 3. Clear single active warning
  const handleResolveAlert = (id: string) => {
    setAlerts((prev) => 
      prev.map((al) => al.id === id ? { ...al, resolved: true } : al)
    );
  };

  const handleResolveAll = () => {
    setAlerts((prev) => prev.map((al) => ({ ...al, resolved: true })));
  };

  // 4. Secure proxy calls to Gemini AI for chẩn bệnh lúa bón thúc NPK
  const triggerAIAnalysis = async () => {
    setLoadingAI(true);
    setAiResult(null);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmName: selectedFarm.name,
          location: selectedFarm.location,
          growthStage: selectedFarm.growthStage,
          sensors: selectedFarm.sensors
        })
      });

      const data = await response.json();
      setAiResult(data.analysis);
    } catch (err) {
      console.error("Analysis api error:", err);
      // Failover calculated fallback
      setAiResult({
        status: "warning",
        disease_risk: "medium",
        crop_analysis: `Dựa trên ước lượng toán học: Thổ đất tại ${selectedFarm.name} có pH ${selectedFarm.sensors.ph} hơi ngột phèn, Đạm (N) mốc chỉ ${selectedFarm.sensors.N} râm ran húp bôi rễ lúa. Kỹ sư nông học khuyên dùng thêm Urê đón đồng dỡ phèn ngay.`,
        recommendations: [
          "Bón rải lót lôi vôi bột 250 kg/ha cải thiện độ chua phèn chua đất ngay.",
          "Cực kỳ dập dịch kìm hãm tưới mương sạt mặn trong chu kỳ lúa đẻ đâm chồi.",
          "Theo dõi rầy trắng rôm bẹ rơm lúc hửng sương ban sáng râm."
        ]
      });
    } finally {
      setLoadingAI(false);
    }
  };

  // 5. Automated AI season report compilation
  const handleGenerateReport = async () => {
    setLoadingReport(true);
    setReportResult(null);

    try {
      const response = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farm: selectedFarm,
          logs: logs.filter(l => l.farmId === selectedFarm.id),
          historical: historicalSeries
        })
      });

      const data = await response.json();
      setReportResult(data.report);
    } catch (err) {
      console.error("Report api error:", err);
      // Fallback response values
      setReportResult({
        title: "BẢN THU HOẠCH CHẨN ĐOÁN CƠ LÝ RUỘNG LÚA MÔ PHỎNG",
        date: new Date().toLocaleDateString("vi-VN"),
        growthStage: selectedFarm.growthStage,
        waterEfficiency: `Sử dụng nước tuần hoàn đầm thắm ${selectedFarm.sensors.waterLevel}cm bợ đực đồng.`,
        soilFertilityStatus: `Khảo sát N: ${selectedFarm.sensors.N}, P: ${selectedFarm.sensors.P}, K: ${selectedFarm.sensors.K}. Trì phèn đất pH đạt ${selectedFarm.sensors.ph}.`,
        predictedHarvestDate: "Khoảng 65 ngày tiếp theo tùy khí tiết",
        detailedComments: "Bản báo cáo kỹ thuật bón bồi vôi bạt phèn cho HTX nông gia Việt Nam."
      });
    } finally {
      setLoadingReport(false);
    }
  };

  // 6. User diary entry logging
  const handleAddLog = (newLog: Omit<DiaryLog, "id" | "date">) => {
    const logObj: DiaryLog = {
      ...newLog,
      id: `log_${Date.now()}`,
      date: new Date().toISOString()
    };
    setLogs((prev) => [logObj, ...prev]);

    // Push dynamic feedback alert
    const tipLog = {
      id: `alert_log_${Date.now()}`,
      type: "info" as const,
      title: `Nhật ký canh tác mới: ${newLog.category}`,
      desc: `Kỹ sư vừa lưu trữ: "${newLog.content}" với ngân sách ${newLog.cost}. Cảnh báo phèn chua tự động gát lại thẩm định.`,
      time: "Vừa xong",
      resolved: false
    };
    setAlerts((prev) => [tipLog, ...prev]);
  };

  // 7. Update active Farm configurations (Calibration panel)
  const handleUpdateFarmStageAndRole = (stage: string, role: string, sensors?: SensorData) => {
    const updated = {
      ...selectedFarm,
      growthStage: stage,
      role: role as any,
      sensors: sensors ? sensors : selectedFarm.sensors
    };

    setSelectedFarm(updated);
    setFarms((prev) => prev.map((f) => f.id === updated.id ? updated : f));
  };

  // Switch farm cleanly
  const handleSelectFarmCustom = (farm: Farm) => {
    setSelectedFarm(farm);
    // Restart AI indicators
    setAiResult(null);
    setReportResult(null);
  };

  const activeAlertsCount = alerts.filter(a => !a.resolved).length;

  return (
    <div className={`min-h-screen font-sans ${darkTheme ? "dark" : ""}`}>
      {/* Dynamic background wrapper responsive colors */}
      <div className="flex min-h-screen relative bg-slate-100/50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        
        {/* Mesh Gradient Background Layers for dark mode */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-0 dark:opacity-100 transition-opacity duration-700">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-blue-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute top-[20%] right-[20%] w-[25%] h-[25%] bg-cyan-400/5 blur-[100px] rounded-full"></div>
        </div>

        {/* Mesh Gradient Background Layers for light mode */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-100 dark:opacity-0 transition-opacity duration-700">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/45 blur-[90px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-blue-100/35 blur-[90px] rounded-full"></div>
        </div>

        {/* Sidebar Left Rail Navigation */}
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          userRole={selectedFarm.role} 
          farmName={selectedFarm.name} 
        />

        {/* Outer right core container block */}
        <div className="flex-1 flex flex-col min-w-0 max-w-full">
          
          {/* Header Controls Bar */}
          <Header 
            farms={farms} 
            selectedFarm={selectedFarm} 
            setSelectedFarm={handleSelectFarmCustom} 
            darkTheme={darkTheme} 
            setDarkTheme={setDarkTheme} 
            notificationsCount={activeAlertsCount}
            setShowAlertsModal={setShowAlertsModal}
          />

          {/* Main Workspace Frame container */}
          <main className="flex-1 px-4 py-6 md:px-8 max-w-7xl mx-auto w-full relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.16 }}
                className="w-full h-full"
              >
                {currentTab === "dashboard" && (
                  <DashboardMain 
                    farm={selectedFarm} 
                    setGrowthStage={(stg) => handleUpdateFarmStageAndRole(stg, selectedFarm.role)}
                    aiResult={aiResult}
                    triggerAIAnalysis={triggerAIAnalysis}
                    loadingAI={loadingAI}
                    onNavigateTab={setCurrentTab}
                    quickDiaryLogs={logs.filter(l => l.farmId === selectedFarm.id)}
                  />
                )}

                {currentTab === "sensors" && (
                  <SensorsView 
                    farm={selectedFarm} 
                    historicalSeries={historicalSeries}
                    rangeFilter={rangeFilter}
                    setRangeFilter={setRangeFilter}
                    onSimulateFluctuate={() => {
                      // Instantly fluctuate sensors telemetry values for dynamic live visual testing bounds
                      const originalSensors = selectedFarm.sensors;
                      const N_change = Math.round(originalSensors.N + (Math.random() - 0.5) * 8);
                      const ph_change = parseFloat((originalSensors.ph + (Math.random() - 0.5) * 0.4).toFixed(1));
                      const water_change = parseFloat((originalSensors.waterLevel + (Math.random() - 0.5) * 0.8).toFixed(1));
                      
                      const updatedSensors = {
                        ...originalSensors,
                        N: Math.max(60, N_change),
                        ph: Math.max(3.5, ph_change),
                        waterLevel: Math.max(0, water_change)
                      };
                      handleUpdateFarmStageAndRole(selectedFarm.growthStage, selectedFarm.role, updatedSensors);
                    }}
                  />
                )}

                {currentTab === "ai_predictions" && (
                  <AIChatbot 
                    farm={selectedFarm}
                  />
                )}

                {currentTab === "ai_recommendations" && (
                  <AIRecommendations 
                    farm={selectedFarm} 
                    aiResult={aiResult} 
                    triggerAIAnalysis={triggerAIAnalysis}
                    loadingAI={loadingAI}
                    onGenerateReport={handleGenerateReport}
                    reportResult={reportResult}
                    loadingReport={loadingReport}
                  />
                )}

                {currentTab === "map" && (
                  <CropMap 
                    farm={selectedFarm} 
                    onRefreshMap={() => {
                      // Simulate node signals fluctuations
                      const updatedFarms = farms.map((f) => {
                        if (f.id === selectedFarm.id) {
                          return {
                            ...f,
                            nodes: f.nodes.map((n) => ({
                              ...n,
                              battery: Math.max(5, Math.min(100, Math.round(n.battery + (Math.random() - 0.5) * 6))),
                              lastPing: "Vừa cập nhật"
                            }))
                          };
                        }
                        return f;
                      });
                      setFarms(updatedFarms);
                      const cur = updatedFarms.find(f => f.id === selectedFarm.id);
                      if (cur) setSelectedFarm(cur);
                    }}
                  />
                )}

                {currentTab === "diary" && (
                  <LogJournal 
                    farm={selectedFarm} 
                    logs={logs.filter(l => l.farmId === selectedFarm.id)} 
                    onAddLog={handleAddLog}
                  />
                )}

                {currentTab === "settings" && (
                  <SettingsView 
                    farm={selectedFarm} 
                    onUpdateFarmStageAndRole={handleUpdateFarmStageAndRole}
                    farms={farms}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Dynamic Alerts Modal System overlay */}
        <AlertsModal 
          isOpen={showAlertsModal} 
          onClose={() => setShowAlertsModal(false)} 
          alerts={alerts}
          onResolveAlert={handleResolveAlert}
          onResolveAll={handleResolveAll}
          soundMuted={soundMuted}
          setSoundMuted={setSoundMuted}
        />

      </div>
    </div>
  );
}
