export interface SensorData {
  N: number;
  P: number;
  K: number;
  ph: number;
  waterLevel: number;
  temperature: number;
  humidity: number;
}

export interface NodeInfo {
  id: string;
  latOffset: number;
  lngOffset: number;
  status: "online" | "offline";
  battery: number;
  lastPing: string;
  type: "lora_gateway" | "soil_node" | "water_node";
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  size: string;
  growthStage: string;
  role: "Admin" | "Kỹ sư" | "Nông dân";
  sensors: SensorData;
  nodes: NodeInfo[];
  cooperationStatus?: string;
}

export interface ChartPoint {
  date: string;
  N: number;
  P: number;
  K: number;
  ph: number;
  waterLevel: number;
  temperature: number;
  humidity: number;
}

export interface DiaryLog {
  id: string;
  farmId: string;
  date: string;
  author: string;
  category: string;
  content: string;
  cost: string;
}

export interface AIAnalysisResult {
  status: "good" | "warning" | "critical";
  recommendations: string[];
  disease_risk: "low" | "medium" | "high";
  crop_analysis: string;
  isAiPowered?: boolean;
  message?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AIReportResult {
  title: string;
  date: string;
  growthStage: string;
  waterEfficiency: string;
  soilFertilityStatus: string;
  predictedHarvestDate: string;
  detailedComments: string;
  isAiPowered?: boolean;
}
