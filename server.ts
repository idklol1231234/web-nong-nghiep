import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (geminiApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Error initializing Gemini API:", err);
  }
} else {
  console.log("No GEMINI_API_KEY found, running in local smart engine mode.");
}

// ----------------------------------------------------
// MEMORY DATABASE SCHEMA (SMART RICE AI)
// ----------------------------------------------------

interface Farm {
  id: string;
  name: string;
  location: string;
  size: string; // m2
  growthStage: string; // Gieo sạ, Đẻ nhánh, Làm đồng, Trổ bông, Chín
  role: string; // Admin, Kỹ sư, Nông dân
  sensors: {
    N: number; // mg/kg
    P: number;
    K: number;
    ph: number;
    waterLevel: number; // cm
    temperature: number; // °C
    humidity: number; // %
  };
  nodes: {
    id: string;
    latOffset: number; // offset from map center
    lngOffset: number;
    status: "online" | "offline";
    battery: number;
    lastPing: string;
    type: "lora_gateway" | "soil_node" | "water_node";
  }[];
}

// Initial farm list
let farms: Farm[] = [
  {
    id: "farm_01",
    name: "Ruộng Trọng Điểm A (Hợp tác xã Mỹ Tho)",
    location: "Mỹ Tho, Tiền Giang",
    size: "12,500 m²",
    growthStage: "Làm đồng",
    role: "Admin",
    sensors: {
      N: 88, // Normal: 100-150. Nitrogen is low.
      P: 42, // Normal: 30-50
      K: 55, // Normal: 60-90. Potassium low.
      ph: 5.2, // Slightly acid. Ideal is 5.5-6.5
      waterLevel: 3, // Low water. Target: 5-7cm For 'Làm đồng' stage
      temperature: 31.8,
      humidity: 78
    },
    nodes: [
      { id: "node_lora_gw", latOffset: 0, lngOffset: 0, status: "online", battery: 98, lastPing: "Vừa xong", type: "lora_gateway" },
      { id: "node_soil_01", latOffset: -0.012, lngOffset: 0.015, status: "online", battery: 89, lastPing: "2 phút trước", type: "soil_node" },
      { id: "node_soil_02", latOffset: 0.018, lngOffset: -0.022, status: "online", battery: 84, lastPing: "5 phút trước", type: "soil_node" },
      { id: "node_water_01", latOffset: 0.01, lngOffset: 0.02, status: "online", battery: 92, lastPing: "1 phút trước", type: "water_node" },
      { id: "node_water_02", latOffset: -0.015, lngOffset: -0.01, status: "offline", battery: 12, lastPing: "3 giờ trước", type: "water_node" }
    ]
  },
  {
    id: "farm_02",
    name: "Hợp tác xã Gò Công Tây - Thử nghiệm Phù Sa",
    location: "Gò Công Tây, Tiền Giang",
    size: "8,200 m²",
    growthStage: "Đẻ nhánh",
    role: "Kỹ sư",
    sensors: {
      N: 135, // Good
      P: 35, // Good
      K: 70, // Good
      ph: 6.1, // Ideal
      waterLevel: 6, // Great (Target: 5-8cm)
      temperature: 30.2,
      humidity: 82
    },
    nodes: [
      { id: "node_lora_gw", latOffset: 0, lngOffset: 0, status: "online", battery: 100, lastPing: "Vừa xong", type: "lora_gateway" },
      { id: "node_soil_01", latOffset: -0.01, lngOffset: 0.008, status: "online", battery: 95, lastPing: "1 phút trước", type: "soil_node" },
      { id: "node_water_01", latOffset: 0.005, lngOffset: -0.012, status: "online", battery: 91, lastPing: "3 phút trước", type: "water_node" }
    ]
  },
  {
    id: "farm_03",
    name: "Cánh đồng mẫu lớn Phú Tân (Nông dân Lâm Văn Bảy)",
    location: "Phú Tân, An Giang",
    size: "25,000 m²",
    growthStage: "Trổ bông",
    role: "Nông dân",
    sensors: {
      N: 110,
      P: 28, // Slighly low
      K: 85,
      ph: 4.8, // Acid danger! PH below 5.0
      waterLevel: 4,
      temperature: 33.4,
      humidity: 74
    },
    nodes: [
      { id: "node_lora_gw", latOffset: 0, lngOffset: 0, status: "online", battery: 94, lastPing: "Vừa xong", type: "lora_gateway" },
      { id: "node_soil_01", latOffset: -0.014, lngOffset: 0.012, status: "online", battery: 81, lastPing: "10 phút trước", type: "soil_node" },
      { id: "node_water_01", latOffset: 0.02, lngOffset: -0.005, status: "online", battery: 76, lastPing: "4 phút trước", type: "water_node" }
    ]
  }
];

// Farming Logs list
let diaryLogs = [
  {
    id: "log_01",
    farmId: "farm_01",
    date: "2026-05-23T08:00:00Z",
    author: "Kỹ sư Nguyễn Văn Minh",
    category: "Bón phân",
    content: "Bổ sung Urê (N) đợt 2 tỷ lệ 15kg/công tầm lớn theo hướng dẫn chu kỳ sinh trưởng 'Làm đồng' của cây.",
    cost: "450,000 VND"
  },
  {
    id: "log_02",
    farmId: "farm_01",
    date: "2026-05-20T14:30:00Z",
    author: "Trần Văn Tèo (Nông dân trực nhật)",
    category: "Tưới bổ sung",
    content: "Cấp nước bổ sung từ mương nội đồng nhằm tăng nước đạt mức 6cm cứu hạn do nắng gắt.",
    cost: "120,000 VND"
  },
  {
    id: "log_03",
    farmId: "farm_03",
    date: "2026-05-22T09:15:00Z",
    author: "Lâm Văn Bảy",
    category: "Xử lý đất",
    content: "Bón vôi bột xám xử lý phèn chua đất do nước mưa có dấu hiệu tăng kiềm chua nhẹ.",
    cost: "300,000 VND"
  }
];

// Historical charts generator
function getHistoricalData(farm: Farm, range: "today" | "week" | "month" | "crop") {
  const points = range === "today" ? 12 : range === "week" ? 7 : range === "month" ? 30 : 60;
  const historyList = [];
  const now = new Date();

  // Baseline values from active sensors
  const N_base = farm.sensors.N;
  const P_base = farm.sensors.P;
  const K_base = farm.sensors.K;
  const ph_base = farm.sensors.ph;
  const WL_base = farm.sensors.waterLevel;
  const T_base = farm.sensors.temperature;
  const H_base = farm.sensors.humidity;

  for (let i = points - 1; i >= 0; i--) {
    const pointDate = new Date(now.getTime() - i * (range === "today" ? 2 * 3600 * 1000 : 24 * 3600 * 1000));
    const randomVariation = Math.sin(i * 0.5) * 5;
    const phVar = Math.sin(i * 0.3) * 0.2;
    const wlVar = Math.cos(i * 0.4) * 1.5;

    historyList.push({
      date: range === "today" ? pointDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : pointDate.toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" }),
      N: Math.max(20, Math.round(N_base + randomVariation + (Math.random() - 0.5) * 3)),
      P: Math.max(10, Math.round(P_base + randomVariation / 2 + (Math.random() - 0.5) * 2)),
      K: Math.max(20, Math.round(K_base + randomVariation * 1.2 + (Math.random() - 0.5) * 4)),
      ph: parseFloat(Math.min(14, Math.max(1, ph_base + phVar + (Math.random() - 0.5) * 0.1)).toFixed(2)),
      waterLevel: Math.max(0, parseFloat((WL_base + wlVar + (Math.random() - 0.5) * 0.3).toFixed(1))),
      temperature: parseFloat((T_base + (Math.random() - 0.5) * 2).toFixed(1)),
      humidity: Math.min(100, Math.max(10, Math.round(H_base + (Math.random() - 0.5) * 5)))
    });
  }
  return historyList;
}

// Direct rule recommendation engine (as standard or backup model fallback)
function evaluateLocalRules(data: { npk: { N: number; P: number; K: number }; ph: number; water_level: number; temperature: number; humidity: number; growth_stage: string }) {
  const recommendations: string[] = [];
  let status = "good";
  let disease_risk = "low";
  const { npk, ph, water_level, temperature, humidity, growth_stage } = data;

  // 1. Phân tích NPK theo thời kì sinh trưởng
  // Sinh trưởng gợi ý: "Gieo sạ", "Đẻ nhánh", "Làm đồng", "Trổ bông", "Chín"
  if (growth_stage === "Gieo sạ") {
    // Cần lân tốt (P)
    if (npk.P < 35) {
      recommendations.push("Hàm lượng Lân (P) thấp cho sự phát rễ của mạ non. Gợi ý bón thêm phân lân super hoặc DAP tỷ lệ nhẹ (3-5 kg/sào) để thúc đẩy ra rễ.");
    }
    if (water_level > 2) {
      recommendations.push("Cảnh báo: Gieo sạ mạ non cần đất ráo hoặc chỉ tháo nước bùn xăm xắp mặt ruộng (1-2 cm). Rút bớt nước để tránh úng hạt giống giống");
      status = "warning";
    }
  } else if (growth_stage === "Đẻ nhánh") {
    // Cần đạm (N) vọt chồi
    if (npk.N < 100) {
      recommendations.push("Hàm lượng Đạm (N) thiếu trong giai đoạn đẻ nhánh rộ. Chồi lúa sẽ bị còi cọc và lùn xúp. Bổ sung ngay phân urê liều lượng 10-15 kg/ha trong vòng 3 ngày tới.");
      status = "warning";
    }
    if (water_level < 3) {
      recommendations.push("Cần duy trì mực nước sâu 3-5 cm trong lúc đẻ nhánh giúp gốc lúa phát triển đồng loạt và triệt cỏ dại.");
    }
  } else if (growth_stage === "Làm đồng") {
    // Cần Kali (K) đơm bông lớn
    if (npk.K < 75) {
      recommendations.push("Thiếu lượng Kali (K) mấu chốt tại giai đoạn Làm đồng. Đồng lúa bón thiếu kali sẽ có hạt nhỏ lép, cây lúa yếu dễ ngã đổ. Bón thúc đón đồng ngay clorua kali (KCl) từ 8-10 kg/công.");
      status = "warning";
    }
    if (waterLevelTarget(growth_stage, water_level) !== "ideal") {
      recommendations.push("Đoạn làm đồng mẫn cảm nước nặng. Duy trì mực nước đầm ấm từ 5-7 cm để lúa thụ phấn tốt nhất.");
      status = "warning";
    }
  } else if (growth_stage === "Trổ bông") {
    // Đòi hỏi K và nước đều đặn
    if (water_level < 5) {
      recommendations.push("Nguy cơ: Đất ruộng quá cạn nước khi trổ bông sẽ làm hoa lúa lép hạt hàng loạt. Bơm khẩn cấp duy trì nước tối thiểu đạt 5-8 cm.");
      status = "critical";
    }
    if (npk.K < 70) {
      recommendations.push("Phun bổ sung Kali Humate hoặc Kali trắng mặt lá để gạo vào hạt chắc hơn.");
    }
  } else if (growth_stage === "Chín") {
    if (water_level > 1) {
      recommendations.push("Giai đoạn Lúa chín vàng: Tiến hành tháo xả cạn kiệt ruộng trước thu hoạch 8-10 ngày giúp mặt đất săn khô dễ dàng gặt đập liên hợp.");
    }
  }

  // 2. Chẩn đoán pH đất nông nghiệp
  if (ph < 5.0) {
    recommendations.push("Cảnh báo phèn nguy cơ cao (pH = " + ph + "): Đất cực phèn có thể khiến gốc lúa ngộ độc phèn sắt phèn nhôm. Khuyến cáo bón bổ sung vôi xám nông nghiệp (300-400kg.ha) hoặc lân nung chảy Lâm Thao để nâng chỉ số pH đất kịp thời.");
    status = "warning";
    if (ph < 4.5) status = "critical";
  } else if (ph > 7.5) {
    recommendations.push("pH có xu hướng kiềm cao (pH = " + ph + "): Khuyến nghị đưa phân sunfat đạm hoặc bổ sung rơm rạ mục giúp đất cân bằng đới sinh học.");
    status = "warning";
  }

  // 3. Dự đoán nguy cơ sâu bệnh hại (Dựa trên khí tượng)
  if (temperature > 30 && humidity > 75) {
    disease_risk = "medium";
    if (growth_stage === "Làm đồng" || growth_stage === "Trổ bông") {
      disease_risk = "high";
      recommendations.push("Thời tiết oi bức kèm độ ẩm cao cực kỳ có lợi cho Bệnh Đạo Ôn (Pyricularia oryzae) cổ bông và rầy nâu sinh trưởng mạnh. Khuyên nông dân phun phòng định kỳ bằng tinh dầu tỏi tự nhiên hoặc chế phẩm Tilt Super.");
    } else {
      recommendations.push("Phát hiện nguy cơ vàng lá chín sớm do bào tử nấm. Cần dọn rác dọn bờ ruộng sạch sâu.");
    }
  }

  return {
    status,
    recommendations: recommendations.length > 0 ? recommendations : ["Các thông số nông ruộng đạt ngưỡng lý tưởng. Tiếp tục chu trình bón tưới định kì như kế hoạch."],
    disease_risk,
    crop_analysis: `Chi tiết phân tích: Ở nông kỳ '${growth_stage}', ruộng hiện có chỉ số pH khí tượng đất pH=${ph}, NPK=${npk.N}-${npk.P}-${npk.K}. Hệ thống Smart Rice AI khuyến cáo nông dân bảo tồn mực nước ${water_level}cm, theo dõi thêm hiện trạng bờ mương phòng bệnh rầy nâu dập dịch.`
  };
}

function waterLevelTarget(stage: string, current: number) {
  if (stage === "Gieo sạ" && current <= 2) return "ideal";
  if (stage === "Đẻ nhánh" && current >= 3 && current <= 5) return "ideal";
  if (stage === "Làm đồng" && current >= 5 && current <= 8) return "ideal";
  if (stage === "Trổ bông" && current >= 5 && current <= 8) return "ideal";
  if (stage === "Chín" && current <= 1) return "ideal";
  return "alert";
}

// ----------------------------------------------------
// REST API SYSTEM ROUTES
// ----------------------------------------------------

// 1. Get all Farms & stats
app.get("/api/farms", (req, res) => {
  res.json({ farms, categories: ["Dashboard", "Cảm biến", "Timeline", "AI Chat", "Log"] });
});

// 2. Change dynamic parameters (User roles, active growth stages etc)
app.patch("/api/farms/:id", (req, res) => {
  const { id } = req.params;
  const { growthStage, role, sensors } = req.body;
  const targetFarm = farms.find(f => f.id === id);

  if (targetFarm) {
    if (growthStage) targetFarm.growthStage = growthStage;
    if (role) targetFarm.role = role;
    if (sensors) {
      targetFarm.sensors = { ...targetFarm.sensors, ...sensors };
    }
    res.json({ success: true, farm: targetFarm });
  } else {
    res.status(404).json({ error: "Farm not found" });
  }
});

// 3. Get detailed sensor metrics and series for charting
app.get("/api/farms/:id/sensors", (req, res) => {
  const { id } = req.params;
  const range = (req.query.range as "today" | "week" | "month" | "crop") || "today";
  const farm = farms.find(f => f.id === id);

  if (!farm) {
    return res.status(404).json({ error: "Farm not found" });
  }

  // Slightly fluctuation of sensor state real-time for live update view feeling
  farm.sensors.N = Math.max(50, Math.min(200, farm.sensors.N + Math.round((Math.random() - 0.5) * 4)));
  farm.sensors.P = Math.max(20, Math.min(100, farm.sensors.P + Math.round((Math.random() - 0.5) * 2)));
  farm.sensors.K = Math.max(40, Math.min(150, farm.sensors.K + Math.round((Math.random() - 0.5) * 4)));
  farm.sensors.ph = parseFloat(Math.max(3.5, Math.min(9.5, farm.sensors.ph + (Math.random() - 0.5) * 0.05)).toFixed(2));
  farm.sensors.waterLevel = Math.max(0, parseFloat(Math.min(25, farm.sensors.waterLevel + (Math.random() - 0.5) * 0.2).toFixed(1)));
  farm.sensors.temperature = parseFloat(Math.max(15, Math.min(45, 30.5 + Math.sin(Date.now() / 10000) * 3 + (Math.random() - 0.5) * 0.5)).toFixed(1));
  farm.sensors.humidity = Math.max(40, Math.min(100, Math.round(75 + Math.cos(Date.now() / 15000) * 10 + (Math.random() - 0.5) * 2)));

  const chartSeries = getHistoricalData(farm, range);
  res.json({
    farm,
    series: chartSeries
  });
});

// 5. POST /api/ai/analyze - Unified AI Intelligent analysis engine using Gemini
app.post("/api/ai/analyze", async (req, res) => {
  const farm_name = req.body.farmName || req.body.farm_name || "Mẫu ruộng lúa thông minh";
  const growth_stage = req.body.growthStage || req.body.growth_stage || "Làm đồng";
  
  // Extract sensors safely from nested state or top-level body keys
  const sensors = req.body.sensors || {};
  const npk = req.body.npk || { 
    N: sensors.N !== undefined ? sensors.N : (req.body.N || 90), 
    P: sensors.P !== undefined ? sensors.P : (req.body.P || 35), 
    K: sensors.K !== undefined ? sensors.K : (req.body.K || 55) 
  };
  
  const ph = req.body.ph !== undefined ? req.body.ph : (sensors.ph !== undefined ? sensors.ph : 5.0);
  const water_level = req.body.water_level !== undefined ? req.body.water_level : (sensors.waterLevel !== undefined ? sensors.waterLevel : 5.0);
  const temperature = req.body.temperature !== undefined ? req.body.temperature : (sensors.temperature !== undefined ? sensors.temperature : 30);
  const humidity = req.body.humidity !== undefined ? req.body.humidity : (sensors.humidity !== undefined ? sensors.humidity : 80);

  // Get direct rule analysis as backing layer
  const basicAnalysis = evaluateLocalRules({ npk, ph, water_level, temperature, humidity, growth_stage });

  if (!ai) {
    // Return high quality deterministic rules when Gemini is unavailable
    const result = {
      ...basicAnalysis,
      isAiPowered: false,
      message: "Phân tích tự động nội địa hóa (Chưa gắn GEMINI_API_KEY)"
    };
    return res.json({
      ...result,
      analysis: result
    });
  }

  try {
    const prompt = `Bạn là Chuyên gia Nông Nghiệp Thông Minh IoT xuất sắc nhất tại Đồng Bằng Sông Cửu Long Việt Nam. 
Hãy thực hiện phân tích số liệu lúa và phản hồi bằng định dạng JSON thuần gốc (không có dấu lồng \`\`\`json ở ngoài, bắt đầu bằng dấu ngoặc nhọn '{' và kết thúc bằng '}').

THÔNG SỐ HIỆN TẠI:
- Tên ruộng: ${farm_name}
- Giai đoạn sinh trưởng: ${growth_stage}
- Hàm lượng dinh dưỡng đất NPK: Đạm (N)=${npk.N} mg/kg, Lân (P)=${npk.P} mg/kg, Kali (K)=${npk.K} mg/kg
- pH đất ruộng: ${ph}
- Mực nước trong ruộng: ${water_level} cm
- Nhiệt độ nông trường: ${temperature} °C
- Độ ẩm không khí: ${humidity} %

HƯỚNG DẪN ĐỊNH MỨC NÔNG HỌC CHO LÚA:
- pH hoàn mỹ: 5.5 - 6.5. Dưới 5.0 là phèn sắt phèn nhôm nặng đe dọa thối rễ lúa.
- Mực nước tương ứng từng kỳ nông vụ:
  * Gieo sạ: đất xăm xắp nước hay bùn khô ẩm (0-2cm).
  * Đẻ nhánh: tưới ngập nông (3-5cm).
  * Làm đồng: trữ mực nước đầm ấm (5-8cm).
  * Trổ bông: duy trì tuyệt đối ẩm ướt đầy nước (5-8cm).
  * Chín vàng gặt hái: thoát kiệt khô nước ruộng (0cm).
- Đạm (N) lý tưởng: 100-140. Lân (P) lý tưởng: 30-50. Kali (K) lý tưởng: 60-90.

MẪU PHẢN HỒI JSON PHẢI LÀ:
{
  "status": "good" | "warning" | "critical",
  "recommendations": [
    "Dẫn chứng cụ thể chỉ dẫn bón phân N, P, hoặc K tỷ lệ ra sao bằng Tiếng Việt...",
    "Chỉ dẫn chi tiết tưới tiêu lượng nước thích hợp...",
    "Biện pháp khắc chế phèn hữu hiệu nếu pH tụt..."
  ],
  "disease_risk": "low" | "medium" | "high",
  "crop_analysis": "Toàn văn tổng phân tích sức khỏe lúa, hướng phát triển và chỉ số nông trường dồi dào chi tiết bằng Tiếng Việt thân hữu dễ hiểu cho bà con nông dân."
}

Hãy phân tích cực kì thiết thực, khoa học kỹ lưỡng cho cây lúa vụ mùa này nhé!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text?.trim() || "{}";
    const aiData = JSON.parse(responseText);
    const finalResult = {
      status: aiData.status || basicAnalysis.status,
      recommendations: aiData.recommendations || basicAnalysis.recommendations,
      disease_risk: aiData.disease_risk || basicAnalysis.disease_risk,
      crop_analysis: aiData.crop_analysis || basicAnalysis.crop_analysis,
      isAiPowered: true
    };
    res.json({
      ...finalResult,
      analysis: finalResult
    });
  } catch (error) {
    console.error("Gemini Analyze Error:", error);
    const finalResult = {
      ...basicAnalysis,
      isAiPowered: false,
      message: "Có lỗi khi gọi Gemini, hệ thống tự động tải động cơ Phân tích Luật mầm của Smart Rice."
    };
    res.json({
      ...finalResult,
      analysis: finalResult
    });
  }
});

// 6. POST /api/ai/chat - Dynamic Contextual agricultural expert chatbot support
app.post("/api/ai/chat", async (req, res) => {
  const { message, history, farmContext } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const farmPromptText = farmContext ? 
    `Bối cảnh ruộng hiện tại nông dân đang theo dõi:
    - Ruộng: ${farmContext.name} (${farmContext.location})
    - Giai đoạn: ${farmContext.growthStage}
    - Chỉ số: NPK (${farmContext.sensors.N}-${farmContext.sensors.P}-${farmContext.sensors.K}), pH: ${farmContext.sensors.ph}, Mực nước: ${farmContext.sensors.waterLevel}cm, Nhiệt độ: ${farmContext.sensors.temperature}°C, Độ ẩm: ${farmContext.sensors.humidity}%` 
    : "Bối cảnh: Người dùng đang tham khảo kinh nghiệm canh tác lúa nước.";

  const fallbackResponses = [
    "Lúa vụ xuân phát triển rất nhạy cảm với phèn. Hiện chỉ số pH đất ruộng của bạn khá nhạy cảm, khuyên dùng phân lân nung chảy Lâm Thao.",
    "Bà con chú ý, bệnh đạo ôn thường bùng phát mạnh khi đêm lạnh sương mù dày và ngày oi bức súp ẩm kéo dài.",
    "Bổ sung Kali trắng ở cuối chu kì đồng sẽ giúp hạt lúa vàng sáng bóng và chắc hạt, bán được giá cao hơn đấy!",
    "Đối với lúa bị ngộ độc hữu cơ, hãy lập tức tháo cạn nước ruộng để rễ thông thoáng khí, bón hỗ trợ vôi xám nông nghiệp hoặc chế phẩm nấm đối kháng Trichoderma."
  ];

  if (!ai) {
    const matchedFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    return res.json({
      response: `[Hệ thống nông học offline]: Cảm ơn bác nông dân đã hỏi. ${matchedFallback} (Bật GEMINI_API_KEY trong Settings để bắt đầu chat trực tiếp với Chuyên Gia Trí Tuệ Nhân Tạo)`,
      isAiPowered: false
    });
  }

  try {
    const formattedHistory = (history || []).map((chat: any) => {
      return `${chat.role === "user" ? "Người dân" : "Chuyên gia"}: ${chat.content}`;
    }).join("\n");

    const prompt = `Bạn là "Kỹ Sư Đồng Smart Rice AI" - Một trợ lý trí tuệ nhân tạo nhiệt huyết, tận tình của nhà nông Việt Nam. 
Bạn nói tiếng Việt mộc mạc, gần gũi, chuyên nghiệp và có sự thấu hiểu sâu sắc nông học Việt Nam (tưới tiêu, bón phân đón đồng, làm cỏ, ngăn sương muối, hạn mặn ĐBSCL).

${farmPromptText}

Lịch sử trò chuyện trước đó:
${formattedHistory}

Nhà nông hỏi: "${message}"

Hãy trả lời thật chi tiết, có cấu trúc rõ ràng trật tự (dùng các gạch đầu dòng mượt mà nếu cần), cung cấp thông tin khoa học thực hành cụ thể về loại phân bón thương hiệu nội địa (ví dụ: Đầu Trâu, Lân Lâm Thao, đạm Phú Mỹ), chỉ dẫn liều lượng m3 nước hoặc kg phân bón mỗi sào, đề xuất cách phòng ngừa rầy nâu dập dịch chi tiết.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    res.json({
      response: response.text || "Xin lỗi nông dân, em gặp chút trục trặc khi suy nghĩ câu trả lời.",
      isAiPowered: true
    });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.json({
      response: `[Hệ Thống Lỗi Mạng]: Có lỗi kết nối AI. Chỉ dẫn an toàn: Khi mực nước rớt dưới 3cm giai đoạn đẻ nhánh, hãy tiếp bơm thêm nước sạch phù sa từ kênh rạch nội đồng nông khu.`,
      isAiPowered: false
    });
  }
});

// 7. POST /api/ai/report - Generate season-long automatic growth report
app.post("/api/ai/report", async (req, res) => {
  const { farm } = req.body;

  if (!farm) {
    return res.status(400).json({ error: "Farm is required to generate report." });
  }

  const staticReport = {
    title: `BÁO CÁO GIÁM SÁT SỨC KHỎE ĐỒNG ÁI - ${farm.name.toUpperCase()}`,
    date: new Date().toLocaleDateString("vi-VN"),
    growthStage: farm.growthStage,
    waterEfficiency: "Khá tốt - Thất thoát nước tối thiểu, độ ẩm duy trì dồi dào",
    soilFertilityStatus: `${farm.sensors.N < 100 ? "Thiếu Đạm nghiêm trọng," : ""} ${farm.sensors.K < 70 ? "Hụt lượng Kali đón đồng," : ""} Độ chua đạt mức phèn nhẹ pH ${farm.sensors.ph}`,
    predictedHarvestDate: "Khoảng 35-40 ngày sau đợt đón đồng hiện ứng",
    detailedComments: "Tổng quan ruộng sinh trưởng lúa tương đối xanh tốt, rễ lúa bám đầm dãi đất phù sa. Chú ý ngăn ngừa phèn đỏ tháo mương."
  };

  if (!ai) {
    const finalReport = {
      ...staticReport,
      isAiPowered: false,
      message: "Báo cáo nông trường cơ bản dựa trên toán quản lý (GEMINI_API_KEY chưa tích hợp)"
    };
    return res.json({
      ...finalReport,
      report: finalReport
    });
  }

  try {
    const prompt = `Bạn là nông học gia cao cấp của Liên Hợp Quốc hợp tác với Viện Lúa Đồng Bằng Sông Cửu Long.
Hãy soạn thảo một Báo cáo sức khỏe phát triển mùa vụ thông minh tự động hóa cao dựa vào số liệu nông hộ sau đây:

- Ruộng lúa: ${farm.name}
- Địa phận: ${farm.location}
- Diện tích: ${farm.size}
- Thời kỳ sinh trưởng: ${farm.growthStage}
- Chỉ số NPK hiện tại: N=${farm.sensors.N}, P=${farm.sensors.P}, K=${farm.sensors.K} mg/kg
- Giá trị pH: ${farm.sensors.ph}
- Trạng thái nguồn nước: ${farm.sensors.waterLevel} cm

Yêu cầu định dạng JSON phản hồi thuần gốc (Không bao gồm ký tự \`\`\`json hay markdown bọc ngoài nào cả):
{
  "title": "Tên báo cáo cực kỳ chuyên nghiệp bằng Tiếng Việt...",
  "date": "Ngày báo cáo...",
  "growthStage": "${farm.growthStage}",
  "waterEfficiency": "Đánh giá chi tiết hiệu suất tích nước và tưới sạch của ruộng nông hộ...",
  "soilFertilityStatus": "Báo cáo chi hóa lý của nông hóa NPK và pH đất lúc này...",
  "predictedHarvestDate": "Dự đoán sấp xỉ ngày mùa gặt (dựa vào chu kỳ từ ${farm.growthStage})...",
  "detailedComments": "Nhà nông học nhận xét toàn vẹn, hướng đi thiết thực bón phân hỗn hợp NPK Nông nghiệp Việt Nam, lịch rải vôi xông nước ngăn sâu bệnh gối lứa."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    const finalReport = {
      ...data,
      isAiPowered: true
    };
    res.json({
      ...finalReport,
      report: finalReport
    });
  } catch (err) {
    console.error("Gemini Report generation error:", err);
    const finalReport = {
      ...staticReport,
      isAiPowered: false,
      message: "Gặp lỗi kết nối khi chuẩn bị báo cáo AI. Tải dữ liệu báo cáo dã ngoại cứng."
    };
    res.json({
      ...finalReport,
      report: finalReport
    });
  }
});


// ----------------------------------------------------
// DEV/PRODUCTION VITE MIDDLEWARE CONFIG
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
