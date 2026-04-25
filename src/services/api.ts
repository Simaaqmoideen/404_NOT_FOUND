// ── api.ts ─────────────────────────────────────────────────────────────────
// Connects the BinWise frontend to the FastAPI/YOLOv8 backend.
// Falls back gracefully to mock classification if backend is unavailable.

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export interface BackendDetection {
  class: string;
  confidence: number;        // 0-100
  bbox?: { x: number; y: number; width: number; height: number };
  bin?: string;
  wasteType?: string;
}

export interface DetectImageResponse {
  success: boolean;
  detections: BackendDetection[];
  frame_time_ms?: number;
  message?: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  stream_url?: string;
}

/** Check if the backend is alive */
export async function checkHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Set the DroidCam / IP stream URL on the backend */
export async function setStreamUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/set-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Capture one frame from the live stream and detect */
export async function detectFromStream(): Promise<DetectImageResponse> {
  try {
    const res = await fetch(`${BASE_URL}/detect-frame`, {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err: any) {
    return { success: false, detections: [], message: err.message };
  }
}

/** Upload an image blob/file and detect waste */
export async function detectFromImage(imageBlob: Blob): Promise<DetectImageResponse> {
  try {
    // Ensure the blob is passed as a File object to explicitly set the MIME type,
    // otherwise FastAPI might reject it if the browser sends it as application/octet-stream.
    const file = new File([imageBlob], 'capture.jpg', { type: imageBlob.type || 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/detect-image`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err: any) {
    return { success: false, detections: [], message: err.message };
  }
}

// ── Waste type mapping from YOLO labels ────────────────────────────────────
const WASTE_LABEL_MAP: Record<string, string> = {
  // Plastic
  plastic: 'plastic', bottle: 'plastic', 'water bottle': 'plastic',
  'plastic bag': 'plastic', container: 'plastic', cup: 'plastic',
  bag: 'plastic', jug: 'plastic', straw: 'plastic', pen: 'plastic',
  toothbrush: 'plastic', comb: 'plastic',
  // Metal
  can: 'metal', tin: 'metal', iron: 'metal', aluminum: 'metal',
  scissors: 'metal', knife: 'metal', fork: 'metal', spoon: 'metal',
  pot: 'metal', pan: 'metal', hammer: 'metal', wrench: 'metal',
  // Organic
  banana: 'organic', apple: 'organic', orange: 'organic', food: 'organic',
  lettuce: 'organic', broccoli: 'organic', carrot: 'organic',
  leaf: 'organic', flower: 'organic', fruit: 'organic', vegetable: 'organic',
  pizza: 'organic', bread: 'organic', sandwich: 'organic',
  // Paper
  book: 'paper', newspaper: 'paper', cardboard: 'paper', envelope: 'paper',
  notebook: 'paper', magazine: 'paper', tissue: 'paper', box: 'paper',
};

export function mapLabelToWasteType(label: string): string {
  const lower = label.toLowerCase();
  for (const [key, type] of Object.entries(WASTE_LABEL_MAP)) {
    if (lower.includes(key)) return type;
  }
  // YOLO class names that come pre-mapped from our custom model
  if (lower.startsWith('plastic')) return 'plastic';
  if (lower.startsWith('organic') || lower.startsWith('wet')) return 'organic';
  if (lower.startsWith('metal')) return 'metal';
  if (lower.startsWith('paper') || lower.startsWith('cardboard')) return 'paper';
  return 'plastic'; // safe default
}

/** Pick the top detection and return a normalized result */
export function extractTopDetection(resp: DetectImageResponse): {
  wasteType: string;
  confidence: number;
  rawLabel: string;
} | null {
  if (!resp.success || !resp.detections?.length) return null;
  const top = resp.detections.reduce((a, b) => (b.confidence > a.confidence ? b : a)) as any;
  
  // The detection-demo backend returns 'label' and 'waste_category'.
  // Older backends might return 'class', 'wasteType', or 'bin'.
  const rawLabel = top.label || top.class || 'unknown';
  const wasteType = top.waste_category || top.wasteType || top.bin || mapLabelToWasteType(rawLabel);
  
  // Normalize to 0-100
  let rawConf = top.confidence * (top.confidence < 1 ? 100 : 1);
  
  return {
    wasteType,
    confidence: parseFloat(rawConf.toFixed(1)),
    rawLabel,
  };
}
