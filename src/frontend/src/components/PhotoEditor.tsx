import {
  Clipboard,
  Contrast,
  Download,
  Droplets,
  Eraser,
  Eye,
  Feather,
  FlipHorizontal,
  FlipVertical,
  ImageIcon,
  Layers,
  Minus,
  Paintbrush,
  Palette,
  Plus,
  Redo2,
  RotateCcw,
  RotateCw,
  Sparkles,
  SunMedium,
  Thermometer,
  Type,
  Undo2,
  Upload,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

type Preset =
  | "normal"
  | "vivid"
  | "bw"
  | "warm"
  | "cool"
  | "fade"
  | "matte"
  | "cinematic"
  | "vintage"
  | "noir"
  | "sunset"
  | "neon"
  | "chrome"
  | "lomo"
  | "dreamy"
  | "dramatic"
  | "emerald"
  | "infrared"
  | "golden"
  | "arctic"
  | "pastel"
  | "urban"
  | "forest"
  | "coral"
  | "midnight"
  | "bronze"
  | "candy"
  | "haze"
  | "film"
  | "paradise"
  | "rose"
  | "teal"
  | "autumn"
  | "ocean"
  | "desert"
  | "lavender"
  | "cyberpunk"
  | "moody"
  | "bleach"
  | "cross"
  | "sienna"
  | "mint"
  | "dusk"
  | "retro"
  | "soft";

type ControlTab =
  | "adjustments"
  | "color"
  | "effects"
  | "transform"
  | "draw"
  | "presets";

type DrawMode = "brush" | "text" | "emoji" | "retouch";

interface FilterState {
  brightness: number;
  contrast: number;
  exposure: number;
  gamma: number;
  opacity: number;
  saturation: number;
  hue: number;
  temperature: number;
  tint: number;
  vibrance: number;
  highlights: number;
  shadows: number;
  blur: number;
  sharpen: number;
  sepia: number;
  grayscale: number;
  invert: number;
  vignette: number;
  noise: number;
  pixelate: number;
  clarity: number;
  dehaze: number;
  texture: number;
  structure: number;
}

interface TransformState {
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
}

type HistoryEntry =
  | { type: "filter"; filters: FilterState; transform: TransformState }
  | { type: "draw"; snapshot: string };

const DEFAULT_FILTERS: FilterState = {
  brightness: 100,
  contrast: 100,
  exposure: 0,
  gamma: 100,
  opacity: 100,
  saturation: 100,
  hue: 0,
  temperature: 0,
  tint: 0,
  vibrance: 100,
  highlights: 0,
  shadows: 0,
  blur: 0,
  sharpen: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
  vignette: 0,
  noise: 0,
  pixelate: 0,
  clarity: 0,
  dehaze: 0,
  texture: 0,
  structure: 0,
};

const DEFAULT_TRANSFORM: TransformState = {
  rotation: 0,
  flipH: false,
  flipV: false,
};

const EMOJI_LIST = [
  "⭐",
  "🔥",
  "❤️",
  "😊",
  "🎨",
  "✨",
  "👍",
  "🎉",
  "🌈",
  "💫",
  "🦋",
  "🍀",
];

const PRESETS: { id: Preset; label: string; emoji: string }[] = [
  { id: "normal", label: "Normal", emoji: "○" },
  { id: "vivid", label: "Vivid", emoji: "✦" },
  { id: "bw", label: "B&W", emoji: "◑" },
  { id: "warm", label: "Warm", emoji: "☀" },
  { id: "cool", label: "Cool", emoji: "❄" },
  { id: "fade", label: "Fade", emoji: "◌" },
  { id: "matte", label: "Matte", emoji: "▣" },
  { id: "cinematic", label: "Cinema", emoji: "🎞" },
  { id: "vintage", label: "Vintage", emoji: "📷" },
  { id: "noir", label: "Noir", emoji: "▪" },
  { id: "sunset", label: "Sunset", emoji: "🌅" },
  { id: "neon", label: "Neon", emoji: "⚡" },
  { id: "chrome", label: "Chrome", emoji: "⬡" },
  { id: "lomo", label: "Lomo", emoji: "📸" },
  { id: "dreamy", label: "Dreamy", emoji: "✨" },
  { id: "dramatic", label: "Dramatic", emoji: "🎭" },
  { id: "emerald", label: "Emerald", emoji: "💚" },
  { id: "infrared", label: "Infrared", emoji: "🔴" },
  { id: "golden", label: "Golden", emoji: "🌟" },
  { id: "arctic", label: "Arctic", emoji: "🧊" },
  { id: "pastel", label: "Pastel", emoji: "🌸" },
  { id: "urban", label: "Urban", emoji: "🏙" },
  { id: "forest", label: "Forest", emoji: "🌲" },
  { id: "coral", label: "Coral", emoji: "🪸" },
  { id: "midnight", label: "Midnight", emoji: "🌙" },
  { id: "bronze", label: "Bronze", emoji: "🥉" },
  { id: "candy", label: "Candy", emoji: "🍭" },
  { id: "haze", label: "Haze", emoji: "🌫" },
  { id: "film", label: "Film", emoji: "🎞" },
  { id: "paradise", label: "Paradise", emoji: "🌺" },
  { id: "rose", label: "Rose", emoji: "🌹" },
  { id: "teal", label: "Teal", emoji: "🩵" },
  { id: "autumn", label: "Autumn", emoji: "🍂" },
  { id: "ocean", label: "Ocean", emoji: "🌊" },
  { id: "desert", label: "Desert", emoji: "🏜" },
  { id: "lavender", label: "Lavender", emoji: "💜" },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🤖" },
  { id: "moody", label: "Moody", emoji: "🌧" },
  { id: "bleach", label: "Bleach", emoji: "⬜" },
  { id: "cross", label: "Cross", emoji: "✝" },
  { id: "sienna", label: "Sienna", emoji: "🟤" },
  { id: "mint", label: "Mint", emoji: "🌿" },
  { id: "dusk", label: "Dusk", emoji: "🌆" },
  { id: "retro", label: "Retro", emoji: "📺" },
  { id: "soft", label: "Soft", emoji: "☁" },
];

function applyPreset(preset: Preset): FilterState {
  switch (preset) {
    case "normal":
      return { ...DEFAULT_FILTERS };
    case "vivid":
      return {
        ...DEFAULT_FILTERS,
        brightness: 110,
        contrast: 120,
        saturation: 140,
        vibrance: 130,
      };
    case "bw":
      return { ...DEFAULT_FILTERS, grayscale: 100 };
    case "warm":
      return { ...DEFAULT_FILTERS, hue: 10, sepia: 40, temperature: 30 };
    case "cool":
      return { ...DEFAULT_FILTERS, saturation: 80, hue: 200, temperature: -30 };
    case "fade":
      return {
        ...DEFAULT_FILTERS,
        brightness: 110,
        contrast: 85,
        saturation: 70,
        sepia: 10,
        opacity: 90,
      };
    case "matte":
      return {
        ...DEFAULT_FILTERS,
        brightness: 105,
        contrast: 90,
        saturation: 80,
        grayscale: 10,
      };
    case "cinematic":
      return {
        ...DEFAULT_FILTERS,
        brightness: 95,
        contrast: 120,
        saturation: 80,
        hue: 10,
        highlights: -10,
        shadows: 10,
      };
    case "vintage":
      return {
        ...DEFAULT_FILTERS,
        brightness: 100,
        contrast: 90,
        sepia: 60,
        hue: 5,
        vignette: 30,
      };
    case "noir":
      return {
        ...DEFAULT_FILTERS,
        brightness: 90,
        contrast: 130,
        grayscale: 100,
        vignette: 40,
      };
    case "sunset":
      return {
        ...DEFAULT_FILTERS,
        brightness: 110,
        contrast: 110,
        saturation: 120,
        hue: 20,
        sepia: 25,
        temperature: 40,
      };
    case "neon":
      return {
        ...DEFAULT_FILTERS,
        brightness: 120,
        contrast: 130,
        saturation: 180,
        hue: 290,
        vibrance: 160,
      };
    case "chrome":
      return {
        ...DEFAULT_FILTERS,
        brightness: 105,
        contrast: 115,
        saturation: 90,
      };
    case "lomo":
      return {
        ...DEFAULT_FILTERS,
        brightness: 100,
        contrast: 130,
        saturation: 110,
        sepia: 15,
        vignette: 55,
        opacity: 92,
      };
    case "dreamy":
      return {
        ...DEFAULT_FILTERS,
        brightness: 115,
        contrast: 85,
        saturation: 80,
        blur: 1,
        opacity: 95,
        highlights: 20,
      };
    case "dramatic":
      return {
        ...DEFAULT_FILTERS,
        brightness: 90,
        contrast: 145,
        saturation: 60,
        highlights: -20,
        shadows: -15,
        vignette: 30,
      };
    case "emerald":
      return {
        ...DEFAULT_FILTERS,
        brightness: 100,
        contrast: 110,
        saturation: 130,
        hue: 140,
        temperature: -10,
      };
    case "infrared":
      return {
        ...DEFAULT_FILTERS,
        invert: 80,
        hue: 320,
        saturation: 150,
        contrast: 120,
      };
    case "golden":
      return {
        ...DEFAULT_FILTERS,
        brightness: 110,
        contrast: 105,
        saturation: 120,
        hue: 20,
        temperature: 40,
        highlights: 15,
        sepia: 20,
      };
    case "arctic":
      return {
        ...DEFAULT_FILTERS,
        brightness: 115,
        contrast: 95,
        saturation: 60,
        temperature: -50,
        hue: 195,
        highlights: 20,
      };
    case "pastel":
      return {
        ...DEFAULT_FILTERS,
        brightness: 115,
        contrast: 85,
        saturation: 60,
        vibrance: 80,
        opacity: 92,
        tint: 10,
      };
    case "urban":
      return {
        ...DEFAULT_FILTERS,
        brightness: 90,
        contrast: 135,
        saturation: 70,
        shadows: -20,
        vignette: 35,
        noise: 15,
      };
    case "forest":
      return {
        ...DEFAULT_FILTERS,
        brightness: 100,
        contrast: 110,
        saturation: 130,
        hue: 110,
        temperature: -10,
        shadows: 10,
      };
    case "coral":
      return {
        ...DEFAULT_FILTERS,
        brightness: 108,
        contrast: 105,
        saturation: 130,
        hue: 15,
        temperature: 25,
        tint: 15,
      };
    case "midnight":
      return {
        ...DEFAULT_FILTERS,
        brightness: 75,
        contrast: 130,
        saturation: 80,
        hue: 220,
        temperature: -40,
        vignette: 50,
      };
    case "bronze":
      return {
        ...DEFAULT_FILTERS,
        brightness: 105,
        contrast: 115,
        saturation: 100,
        hue: 30,
        temperature: 35,
        sepia: 30,
        shadows: -10,
      };
    case "candy":
      return {
        ...DEFAULT_FILTERS,
        brightness: 120,
        contrast: 110,
        saturation: 200,
        vibrance: 180,
        hue: 310,
        tint: 20,
      };
    case "haze":
      return {
        ...DEFAULT_FILTERS,
        brightness: 120,
        contrast: 75,
        saturation: 60,
        blur: 1,
        opacity: 88,
        highlights: 25,
      };
    case "film":
      return {
        ...DEFAULT_FILTERS,
        brightness: 100,
        contrast: 105,
        saturation: 85,
        sepia: 15,
        noise: 20,
        vignette: 25,
        shadows: 10,
      };
    case "paradise":
      return {
        ...DEFAULT_FILTERS,
        brightness: 115,
        contrast: 110,
        saturation: 160,
        hue: 165,
        temperature: -15,
        vibrance: 150,
        highlights: 10,
      };
    case "rose":
      return {
        ...DEFAULT_FILTERS,
        brightness: 108,
        contrast: 105,
        saturation: 120,
        hue: 340,
        temperature: 20,
        tint: 20,
      };
    case "teal":
      return {
        ...DEFAULT_FILTERS,
        brightness: 100,
        contrast: 110,
        saturation: 130,
        hue: 175,
        temperature: -20,
      };
    case "autumn":
      return {
        ...DEFAULT_FILTERS,
        brightness: 105,
        contrast: 115,
        saturation: 110,
        hue: 25,
        temperature: 35,
        sepia: 15,
        shadows: 10,
      };
    case "ocean":
      return {
        ...DEFAULT_FILTERS,
        brightness: 100,
        contrast: 110,
        saturation: 140,
        hue: 200,
        temperature: -30,
        highlights: 10,
      };
    case "desert":
      return {
        ...DEFAULT_FILTERS,
        brightness: 110,
        contrast: 105,
        saturation: 90,
        hue: 35,
        temperature: 50,
        sepia: 25,
      };
    case "lavender":
      return {
        ...DEFAULT_FILTERS,
        brightness: 110,
        contrast: 95,
        saturation: 80,
        hue: 270,
        tint: 25,
        opacity: 93,
      };
    case "cyberpunk":
      return {
        ...DEFAULT_FILTERS,
        brightness: 105,
        contrast: 145,
        saturation: 200,
        hue: 285,
        vibrance: 180,
        vignette: 30,
      };
    case "moody":
      return {
        ...DEFAULT_FILTERS,
        brightness: 85,
        contrast: 130,
        saturation: 70,
        shadows: -20,
        highlights: -15,
        vignette: 45,
      };
    case "bleach":
      return {
        ...DEFAULT_FILTERS,
        brightness: 120,
        contrast: 115,
        saturation: 50,
        highlights: 30,
        opacity: 90,
      };
    case "cross":
      return {
        ...DEFAULT_FILTERS,
        brightness: 105,
        contrast: 120,
        saturation: 130,
        hue: 195,
        sepia: 10,
        vignette: 20,
      };
    case "sienna":
      return {
        ...DEFAULT_FILTERS,
        brightness: 100,
        contrast: 110,
        saturation: 100,
        hue: 20,
        temperature: 30,
        sepia: 40,
        shadows: 5,
      };
    case "mint":
      return {
        ...DEFAULT_FILTERS,
        brightness: 108,
        contrast: 100,
        saturation: 110,
        hue: 150,
        temperature: -15,
        tint: 10,
      };
    case "dusk":
      return {
        ...DEFAULT_FILTERS,
        brightness: 90,
        contrast: 120,
        saturation: 130,
        hue: 15,
        temperature: 25,
        vignette: 30,
        highlights: -10,
      };
    case "retro":
      return {
        ...DEFAULT_FILTERS,
        brightness: 100,
        contrast: 95,
        saturation: 80,
        sepia: 35,
        noise: 18,
        vignette: 40,
        hue: 10,
      };
    case "soft":
      return {
        ...DEFAULT_FILTERS,
        brightness: 115,
        contrast: 85,
        saturation: 75,
        blur: 0.5,
        opacity: 94,
        highlights: 15,
        tint: 8,
      };
  }
}

function buildCssFilter(f: FilterState): string {
  const effectiveBrightness = f.brightness / 100 + f.exposure / 100;
  const gammaFactor = f.gamma / 100;
  const temperatureHue = f.temperature > 0 ? f.temperature / 4 : 0;
  const tintValue = f.tint > 0 ? f.tint / 100 : 0;
  // Clarity: midtone contrast boost
  const clarityContrast = 1 + (f.clarity / 100) * 0.5;
  const clarityBrightness = 1 - (f.clarity / 100) * 0.05;
  // Dehaze: contrast + saturation punch to cut through haze
  const dehazeContrast = 1 + (f.dehaze / 100) * 0.4;
  const dehazeSaturate = 1 + (f.dehaze / 100) * 0.3;
  // Structure: micro-contrast (subtle contrast layering)
  const structureContrast = 1 + (f.structure / 100) * 0.35;
  return [
    `brightness(${effectiveBrightness * clarityBrightness})`,
    `contrast(${(f.contrast / 100) * clarityContrast * dehazeContrast * structureContrast})`,
    `saturate(${(f.saturation / 100) * (f.vibrance / 100) * dehazeSaturate})`,
    `hue-rotate(${f.hue + temperatureHue}deg)`,
    `blur(${f.blur}px)`,
    `sepia(${f.sepia / 100})`,
    `grayscale(${f.grayscale / 100})`,
    `invert(${f.invert / 100})`,
    `opacity(${f.opacity / 100})`,
    tintValue > 0 ? `hue-rotate(${tintValue * 60}deg)` : "",
    f.highlights !== 0 ? `brightness(${1 + f.highlights / 200})` : "",
    f.shadows !== 0 ? `brightness(${1 + f.shadows / 400})` : "",
    `contrast(${gammaFactor})`,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildTransformCss(t: TransformState, zoom: number): string {
  const parts: string[] = [];
  if (t.rotation !== 0) parts.push(`rotate(${t.rotation}deg)`);
  if (t.flipH) parts.push("scaleX(-1)");
  if (t.flipV) parts.push("scaleY(-1)");
  parts.push(`scale(${zoom / 100})`);
  return parts.join(" ") || `scale(${zoom / 100})`;
}

function applySharpConvolution(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amount: number,
) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const factor = amount / 10;
  const kernel = [
    0,
    -factor,
    0,
    -factor,
    1 + 4 * factor,
    -factor,
    0,
    -factor,
    0,
  ];
  const output = new Uint8ClampedArray(data);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const ni = ((y + ky) * w + (x + kx)) * 4;
            val += data[ni + c] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        output[idx + c] = Math.min(255, Math.max(0, val));
      }
    }
  }
  imageData.data.set(output);
  ctx.putImageData(imageData, 0, 0);
}

/* ---- Sub-components ---- */

function ControlCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "oklch(0.12 0 0)",
        border: "1px solid oklch(0.2 0 0)",
      }}
    >
      {title && (
        <p
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: "oklch(0.45 0 0)" }}
        >
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

function SectionLabel({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-2"
      style={{ color: "oklch(0.55 0 0)" }}
    >
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wider">
        {children}
      </span>
    </div>
  );
}

function SliderRow({
  label,
  icon,
  min,
  max,
  value,
  onChange,
  unit = "",
  ocid,
}: {
  label: string;
  icon?: React.ReactNode;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  ocid?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-1.5"
          style={{ color: "oklch(0.6 0 0)" }}
        >
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <span
          className="text-xs font-mono font-bold px-1.5 py-0.5 rounded"
          style={{
            background: "oklch(0.16 0 0)",
            color: "oklch(0.74 0.13 207)",
            minWidth: "38px",
            textAlign: "center",
          }}
        >
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, oklch(0.74 0.13 207) ${
            ((value - min) / (max - min)) * 100
          }%, oklch(0.22 0 0) ${((value - min) / (max - min)) * 100}%)`,
          accentColor: "oklch(0.74 0.13 207)",
        }}
        data-ocid={ocid}
      />
    </div>
  );
}

export default function PhotoEditor() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [imageFileSize, setImageFileSize] = useState<number>(0);
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS });
  const [transform, setTransform] = useState<TransformState>({
    ...DEFAULT_TRANSFORM,
  });
  const [activePreset, setActivePreset] = useState<Preset>("normal");
  const [isDragging, setIsDragging] = useState(false);
  const [controlTab, setControlTab] = useState<ControlTab>("adjustments");
  const [zoom, setZoom] = useState(100);
  const [compareMode, setCompareMode] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Drawing state
  const [drawMode, setDrawMode] = useState<DrawMode>("brush");
  const [brushSize, setBrushSize] = useState(12);
  const [brushOpacity, setBrushOpacity] = useState(80);
  const [brushColor, setBrushColor] = useState("#ff3366");
  const [eraserMode, setEraserMode] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("⭐");
  const [textContent, setTextContent] = useState("Hello!");
  const [textSize, setTextSize] = useState(32);
  const [textColor, setTextColor] = useState("#ffffff");
  const [hasDrawing, setHasDrawing] = useState(false);
  const [retouchMode, setRetouchMode] = useState<"soften" | "heal" | "spotfix">(
    "soften",
  );
  const [retouchStrength, setRetouchStrength] = useState(40);
  const [retouchSize, setRetouchSize] = useState(30);

  // Undo / Redo stacks
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const cssFilter = buildCssFilter(filters);
  const transformCss = buildTransformCss(transform, zoom);
  const sharpenMatrix =
    filters.sharpen > 0
      ? (() => {
          const f = filters.sharpen / 10;
          return `0 -${f} 0 -${f} ${1 + 4 * f} -${f} 0 -${f} 0`;
        })()
      : null;

  const vignetteStyle =
    filters.vignette > 0
      ? {
          boxShadow: `inset 0 0 ${filters.vignette * 3}px ${filters.vignette * 1.5}px rgba(0,0,0,${filters.vignette / 100})`,
        }
      : {};

  // ---- Drawing helpers ----
  const syncCanvasSize = useCallback(() => {
    const canvas = drawCanvasRef.current;
    const wrapper = imageWrapperRef.current;
    if (!canvas || !wrapper) return;
    const img = wrapper.querySelector("img");
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const wrapRect = wrapper.getBoundingClientRect();
    canvas.style.left = `${rect.left - wrapRect.left}px`;
    canvas.style.top = `${rect.top - wrapRect.top}px`;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    if (
      canvas.width !== Math.round(rect.width) ||
      canvas.height !== Math.round(rect.height)
    ) {
      // Save current drawing before resize
      const oldCtx = canvas.getContext("2d");
      let dataUrl: string | null = null;
      if (oldCtx && hasDrawing) {
        dataUrl = canvas.toDataURL();
      }
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
      // Restore drawing if any
      if (dataUrl) {
        const img2 = new Image();
        img2.onload = () => {
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);
        };
        img2.src = dataUrl;
      }
    }
  }, [hasDrawing]);

  // Keep canvas synced with image size
  useEffect(() => {
    if (!imageEl) return;
    const observer = new ResizeObserver(() => syncCanvasSize());
    if (imageWrapperRef.current) observer.observe(imageWrapperRef.current);
    syncCanvasSize();
    return () => observer.disconnect();
  }, [imageEl, syncCanvasSize]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      if (ctrlOrMeta && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (ctrlOrMeta && e.key === "y") ||
        (ctrlOrMeta && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const pushFilterHistory = useCallback((f: FilterState, t: TransformState) => {
    setUndoStack((prev) => [
      ...prev.slice(-49),
      { type: "filter", filters: f, transform: t },
    ]);
    setRedoStack([]);
  }, []);

  const pushDrawHistory = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const snapshot = canvas.toDataURL();
    setUndoStack((prev) => [...prev.slice(-49), { type: "draw", snapshot }]);
    setRedoStack([]);
    setHasDrawing(true);
  }, []);

  const handleUndo = () => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const newStack = prev.slice(0, -1);
      if (last.type === "filter") {
        setFilters(last.filters);
        setTransform(last.transform);
        setRedoStack((r) => [
          ...r,
          { type: "filter", filters: last.filters, transform: last.transform },
        ]);
      } else {
        // draw undo: restore previous snapshot or clear
        const prevDraw = newStack.filter((e) => e.type === "draw");
        const canvas = drawCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (!ctx) return newStack;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (prevDraw.length > 0) {
            const prev2 = prevDraw[prevDraw.length - 1] as {
              type: "draw";
              snapshot: string;
            };
            const img2 = new Image();
            img2.onload = () => ctx.drawImage(img2, 0, 0);
            img2.src = prev2.snapshot;
          } else {
            setHasDrawing(false);
          }
        }
        setRedoStack((r) => [...r, { type: "draw", snapshot: last.snapshot }]);
      }
      return newStack;
    });
  };

  const handleRedo = () => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const newRedo = prev.slice(0, -1);
      if (last.type === "filter") {
        setFilters(last.filters);
        setTransform(last.transform);
        setUndoStack((u) => [
          ...u,
          { type: "filter", filters: last.filters, transform: last.transform },
        ]);
      } else {
        const canvas = drawCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (!ctx) return newRedo;
          const img2 = new Image();
          img2.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img2, 0, 0);
            setHasDrawing(true);
          };
          img2.src = last.snapshot;
        }
        setUndoStack((u) => [...u, { type: "draw", snapshot: last.snapshot }]);
      }
      return newRedo;
    });
  };

  const setFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        pushFilterHistory(prev, transform);
        return next;
      });
      setActivePreset("normal");
    },
    [transform, pushFilterHistory],
  );

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setImageName(file.name);
    setImageFileSize(file.size);
    // Clear drawing
    const canvas = drawCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawing(false);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleReset = () => {
    pushFilterHistory(filters, transform);
    setFilters({ ...DEFAULT_FILTERS });
    setTransform({ ...DEFAULT_TRANSFORM });
    setActivePreset("normal");
    setZoom(100);
    setCompareMode(false);
  };

  const handlePreset = (preset: Preset) => {
    pushFilterHistory(filters, transform);
    setFilters(applyPreset(preset));
    setActivePreset(preset);
  };

  const adjustZoom = (delta: number) => {
    setZoom((z) => Math.min(300, Math.max(50, z + delta)));
  };

  // ---- Drawing event handlers ----
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageUrl) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const pos = getCanvasPos(e);

    if (drawMode === "text") {
      ctx.save();
      ctx.globalAlpha = brushOpacity / 100;
      ctx.font = `bold ${textSize}px sans-serif`;
      ctx.fillStyle = textColor;
      ctx.fillText(textContent, pos.x, pos.y);
      ctx.restore();
      pushDrawHistory();
      return;
    }

    if (drawMode === "emoji") {
      ctx.save();
      ctx.font = `${brushSize * 2}px serif`;
      ctx.fillText(selectedEmoji, pos.x - brushSize, pos.y + brushSize);
      ctx.restore();
      pushDrawHistory();
      return;
    }

    if (drawMode === "retouch") {
      isDrawingRef.current = true;
      lastPosRef.current = pos;
      if (retouchMode === "spotfix") {
        const offscreen = document.createElement("canvas");
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
        const offCtx = offscreen.getContext("2d")!;
        offCtx.filter = `blur(${retouchSize / 3}px)`;
        offCtx.drawImage(canvas, 0, 0);
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, retouchSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = retouchStrength / 150;
        ctx.drawImage(offscreen, 0, 0);
        ctx.restore();
        setHasDrawing(true);
      }
      return;
    }

    // Brush mode
    isDrawingRef.current = true;
    lastPosRef.current = pos;

    ctx.save();
    ctx.globalCompositeOperation = eraserMode
      ? "destination-out"
      : "source-over";
    ctx.globalAlpha = brushOpacity / 100;
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = eraserMode ? "rgba(0,0,0,1)" : brushColor;
    ctx.fill();
    ctx.restore();
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (
      !isDrawingRef.current ||
      (drawMode !== "brush" && drawMode !== "retouch")
    )
      return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPosRef.current) return;

    const pos = getCanvasPos(e);
    ctx.save();
    ctx.globalCompositeOperation = eraserMode
      ? "destination-out"
      : "source-over";
    ctx.globalAlpha = brushOpacity / 100;
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (drawMode === "retouch") {
      ctx.restore();
      if (retouchMode === "soften") {
        ctx.save();
        ctx.globalAlpha = (retouchStrength / 100) * 0.3;
        ctx.filter = `blur(${retouchSize / 3}px)`;
        ctx.fillStyle = "rgba(255, 220, 185, 0.15)";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, retouchSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (retouchMode === "heal") {
        const offscreen = document.createElement("canvas");
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
        const offCtx = offscreen.getContext("2d")!;
        offCtx.filter = `blur(${retouchSize / 4}px)`;
        offCtx.drawImage(canvas, 0, 0);
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, retouchSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = retouchStrength / 200;
        ctx.drawImage(offscreen, 0, 0);
        ctx.restore();
      }
      lastPosRef.current = pos;
      setHasDrawing(true);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.restore();
    lastPosRef.current = pos;
    setHasDrawing(true);
  };

  const handleCanvasMouseUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPosRef.current = null;
      pushDrawHistory();
    }
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Save before clearing
      const snapshot = canvas.toDataURL();
      setUndoStack((prev) => [...prev, { type: "draw", snapshot }]);
      setRedoStack([]);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawing(false);
    }
  };

  // ---- Export ----
  const buildDownloadCanvas = () => {
    if (!imageUrl || !imageEl) return null;
    const canvas = document.createElement("canvas");
    const nat = { w: imageEl.naturalWidth, h: imageEl.naturalHeight };

    const rotated = transform.rotation === 90 || transform.rotation === 270;
    canvas.width = rotated ? nat.h : nat.w;
    canvas.height = rotated ? nat.w : nat.h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (transform.rotation !== 0)
      ctx.rotate((transform.rotation * Math.PI) / 180);
    if (transform.flipH) ctx.scale(-1, 1);
    if (transform.flipV) ctx.scale(1, -1);
    ctx.filter = cssFilter;
    ctx.drawImage(imageEl, -nat.w / 2, -nat.h / 2, nat.w, nat.h);
    ctx.restore();

    if (filters.sharpen > 0) {
      ctx.filter = "none";
      applySharpConvolution(ctx, canvas.width, canvas.height, filters.sharpen);
    }

    if (filters.vignette > 0) {
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.3,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.7,
      );
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, `rgba(0,0,0,${filters.vignette / 100})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Composite drawing layer
    const drawCanvas = drawCanvasRef.current;
    if (drawCanvas && hasDrawing) {
      ctx.drawImage(drawCanvas, 0, 0, canvas.width, canvas.height);
    }

    return canvas;
  };

  const handleDownload = () => {
    const canvas = buildDownloadCanvas();
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${imageName.replace(/\.[^.]+$/, "")}_edited.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const handleCopyToClipboard = async () => {
    const canvas = buildDownloadCanvas();
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 1500);
      } catch {
        // Clipboard API not supported
      }
    }, "image/png");
  };

  const isModified =
    filters.brightness !== 100 ||
    filters.contrast !== 100 ||
    filters.saturation !== 100 ||
    filters.hue !== 0 ||
    filters.opacity !== 100 ||
    filters.blur !== 0 ||
    filters.sharpen !== 0 ||
    filters.texture !== 0 ||
    filters.clarity !== 0 ||
    filters.dehaze !== 0 ||
    filters.structure !== 0 ||
    filters.sepia !== 0 ||
    filters.grayscale !== 0 ||
    filters.invert !== 0 ||
    filters.exposure !== 0 ||
    filters.gamma !== 100 ||
    filters.temperature !== 0 ||
    filters.tint !== 0 ||
    filters.vibrance !== 100 ||
    filters.highlights !== 0 ||
    filters.shadows !== 0 ||
    filters.vignette !== 0 ||
    filters.noise !== 0 ||
    filters.pixelate !== 0 ||
    transform.rotation !== 0 ||
    transform.flipH ||
    transform.flipV;

  const tabs: { id: ControlTab; label: string }[] = [
    { id: "adjustments", label: "Adjust" },
    { id: "color", label: "Color" },
    { id: "effects", label: "Effects" },
    { id: "transform", label: "Transform" },
    { id: "draw", label: "🖌 Draw" },
    { id: "presets", label: "Presets" },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* SVG Sharpen filter + Noise texture */}
      <svg
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <defs>
          {sharpenMatrix && (
            <filter id="sharpen-filter">
              <feConvolveMatrix
                order="3"
                kernelMatrix={sharpenMatrix}
                preserveAlpha="true"
              />
            </filter>
          )}
          <filter id="noise-filter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" />
          </filter>
        </defs>
      </svg>

      {/* Preview Area */}
      <div className="lg:col-span-3">
        {/* Toolbar: Zoom + Compare + Undo/Redo */}
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {/* Undo */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              title="Undo (Ctrl+Z)"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: "oklch(0.16 0 0)",
                border: "1px solid oklch(0.22 0 0)",
                color:
                  undoStack.length === 0 ? "oklch(0.3 0 0)" : "oklch(0.67 0 0)",
                cursor: undoStack.length === 0 ? "not-allowed" : "pointer",
              }}
              data-ocid="photo.secondary_button"
            >
              <Undo2 size={13} />
            </button>
            {/* Redo */}
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title="Redo (Ctrl+Y)"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: "oklch(0.16 0 0)",
                border: "1px solid oklch(0.22 0 0)",
                color:
                  redoStack.length === 0 ? "oklch(0.3 0 0)" : "oklch(0.67 0 0)",
                cursor: redoStack.length === 0 ? "not-allowed" : "pointer",
              }}
              data-ocid="photo.secondary_button"
            >
              <Redo2 size={13} />
            </button>
            <div
              style={{
                width: 1,
                height: 20,
                background: "oklch(0.22 0 0)",
                margin: "0 2px",
              }}
            />
            {/* Zoom */}
            <button
              type="button"
              onClick={() => adjustZoom(-25)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: "oklch(0.16 0 0)",
                border: "1px solid oklch(0.22 0 0)",
                color: "oklch(0.67 0 0)",
              }}
              data-ocid="photo.secondary_button"
            >
              <Minus size={12} />
            </button>
            <span
              className="text-xs font-bold px-2 py-1 rounded"
              style={{
                background: "oklch(0.14 0 0)",
                color: "oklch(0.74 0.13 207)",
                minWidth: "42px",
                textAlign: "center",
              }}
            >
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => adjustZoom(25)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: "oklch(0.16 0 0)",
                border: "1px solid oklch(0.22 0 0)",
                color: "oklch(0.67 0 0)",
              }}
              data-ocid="photo.secondary_button"
            >
              <Plus size={12} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCompareMode((c) => !c)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: compareMode
                ? "oklch(0.74 0.13 207 / 0.15)"
                : "oklch(0.16 0 0)",
              border: compareMode
                ? "1.5px solid oklch(0.74 0.13 207)"
                : "1.5px solid oklch(0.22 0 0)",
              color: compareMode ? "oklch(0.74 0.13 207)" : "oklch(0.67 0 0)",
            }}
            data-ocid="photo.toggle"
          >
            Before / After
          </button>
        </div>

        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            background: "oklch(0.12 0 0)",
            borderColor: "oklch(0.22 0 0)",
            minHeight: "420px",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          data-ocid="photo.dropzone"
        >
          {imageUrl ? (
            compareMode ? (
              /* Compare Mode: side by side */
              <div className="flex w-full" style={{ minHeight: "420px" }}>
                <div
                  className="flex-1 flex flex-col items-center justify-center p-3 relative"
                  style={{ borderRight: "1px solid oklch(0.22 0 0)" }}
                >
                  <span
                    className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded z-10"
                    style={{
                      background: "oklch(0.1 0 0 / 0.9)",
                      color: "oklch(0.67 0 0)",
                    }}
                  >
                    Before
                  </span>
                  <img
                    src={imageUrl}
                    alt="Original"
                    className="max-w-full rounded-lg object-contain"
                    style={{ maxHeight: "380px" }}
                  />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-3 relative">
                  <span
                    className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded z-10"
                    style={{
                      background: "oklch(0.74 0.13 207 / 0.9)",
                      color: "oklch(0.09 0 0)",
                    }}
                  >
                    After
                  </span>
                  <div className="relative" style={vignetteStyle}>
                    <img
                      src={imageUrl}
                      alt="Edited preview"
                      className="max-w-full rounded-lg object-contain"
                      style={{
                        maxHeight: "380px",
                        filter:
                          filters.sharpen > 0
                            ? `${cssFilter} url(#sharpen-filter)`
                            : cssFilter,
                        transform: buildTransformCss(transform, 100),
                        transition: "filter 0.1s ease",
                      }}
                    />
                    {filters.noise > 0 && (
                      <div
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        style={{ opacity: filters.noise / 200 }}
                      >
                        <svg
                          aria-hidden="true"
                          width="100%"
                          height="100%"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <filter id="noise-overlay">
                            <feTurbulence
                              type="fractalNoise"
                              baseFrequency="0.9"
                              numOctaves="4"
                            />
                            <feColorMatrix type="saturate" values="0" />
                          </filter>
                          <rect
                            width="100%"
                            height="100%"
                            filter="url(#noise-overlay)"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Normal Mode */
              <div
                ref={imageWrapperRef}
                className="relative w-full h-full flex items-center justify-center p-4"
                style={{ minHeight: "420px" }}
              >
                <div className="relative" style={vignetteStyle}>
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    ref={(el) => {
                      setImageEl(el);
                    }}
                    onLoad={syncCanvasSize}
                    className="max-w-full rounded-xl object-contain block"
                    style={{
                      maxHeight: "480px",
                      filter:
                        filters.sharpen > 0
                          ? `${cssFilter} url(#sharpen-filter)`
                          : cssFilter,
                      transform: transformCss,
                      transition: "filter 0.1s ease, transform 0.2s ease",
                    }}
                  />
                  {filters.noise > 0 && (
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        opacity: filters.noise / 200,
                        mixBlendMode: "overlay",
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        width="100%"
                        height="100%"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ borderRadius: "0.75rem" }}
                      >
                        <filter id="n2">
                          <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.9"
                            numOctaves="4"
                          />
                          <feColorMatrix type="saturate" values="0" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#n2)" />
                      </svg>
                    </div>
                  )}
                  {/* Drawing canvas overlay */}
                  <canvas
                    ref={drawCanvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    className="absolute rounded-xl"
                    style={{
                      cursor:
                        controlTab === "draw"
                          ? drawMode === "brush"
                            ? eraserMode
                              ? "cell"
                              : "crosshair"
                            : drawMode === "text"
                              ? "text"
                              : drawMode === "retouch"
                                ? "crosshair"
                                : "copy"
                          : "default",
                      pointerEvents: controlTab === "draw" ? "auto" : "none",
                      opacity: 1,
                      touchAction: "none",
                    }}
                    data-ocid="photo.canvas_target"
                  />
                </div>
                {isDragging && (
                  <div
                    className="absolute inset-0 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "oklch(0.74 0.13 207 / 0.15)",
                      border: "2px dashed oklch(0.74 0.13 207)",
                    }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{ color: "oklch(0.74 0.13 207)" }}
                    >
                      Drop to replace
                    </p>
                  </div>
                )}
              </div>
            )
          ) : (
            <label
              htmlFor="photo-file-input"
              className="flex flex-col items-center justify-center gap-4 cursor-pointer"
              style={{ minHeight: "420px" }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: isDragging
                    ? "oklch(0.74 0.13 207 / 0.15)"
                    : "oklch(0.16 0 0)",
                  border: isDragging
                    ? "2px dashed oklch(0.74 0.13 207)"
                    : "2px dashed oklch(0.28 0 0)",
                }}
              >
                <ImageIcon
                  size={28}
                  style={{
                    color: isDragging
                      ? "oklch(0.74 0.13 207)"
                      : "oklch(0.45 0 0)",
                  }}
                />
              </div>
              <div className="text-center">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.7 0 0)" }}
                >
                  Drop an image here
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "oklch(0.45 0 0)" }}
                >
                  or click to browse
                </p>
              </div>
            </label>
          )}
        </div>

        {/* Image Info Bar */}
        {imageEl && imageUrl && (
          <div
            className="mt-2 px-3 py-2 rounded-lg flex items-center gap-4 flex-wrap"
            style={{
              background: "oklch(0.12 0 0)",
              border: "1px solid oklch(0.18 0 0)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <ImageIcon size={12} style={{ color: "oklch(0.45 0 0)" }} />
              <span
                className="text-xs font-mono"
                style={{ color: "oklch(0.55 0 0)" }}
              >
                {imageEl.naturalWidth} × {imageEl.naturalHeight}px
              </span>
            </div>
            {imageFileSize > 0 && (
              <span
                className="text-xs font-mono"
                style={{ color: "oklch(0.45 0 0)" }}
              >
                {formatFileSize(imageFileSize)}
              </span>
            )}
            <span
              className="text-xs font-mono truncate max-w-[160px]"
              style={{ color: "oklch(0.4 0 0)" }}
            >
              {imageName}
            </span>
            {hasDrawing && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: "oklch(0.74 0.13 207 / 0.12)",
                  color: "oklch(0.74 0.13 207)",
                  border: "1px solid oklch(0.74 0.13 207 / 0.3)",
                }}
              >
                🖌 Drawing active
              </span>
            )}
          </div>
        )}

        {/* Upload button */}
        <div className="mt-3">
          <input
            id="photo-file-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{
              background: "oklch(0.16 0 0)",
              border: "1.5px dashed oklch(0.28 0 0)",
              color: "oklch(0.55 0 0)",
            }}
            data-ocid="photo.upload_button"
          >
            <Upload size={14} />
            {imageUrl ? "Replace Image" : "Upload Image"}
          </motion.button>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <ControlCard>
          {/* Tab bar */}
          <div
            className="flex gap-1 flex-wrap mb-5 pb-4"
            style={{ borderBottom: "1px solid oklch(0.18 0 0)" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setControlTab(tab.id)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background:
                    controlTab === tab.id
                      ? "oklch(0.74 0.13 207 / 0.15)"
                      : "transparent",
                  border:
                    controlTab === tab.id
                      ? "1px solid oklch(0.74 0.13 207 / 0.5)"
                      : "1px solid transparent",
                  color:
                    controlTab === tab.id
                      ? "oklch(0.74 0.13 207)"
                      : "oklch(0.55 0 0)",
                  whiteSpace: "nowrap",
                }}
                data-ocid="photo.tab"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Adjustments Tab */}
            {controlTab === "adjustments" && (
              <motion.div
                key="adjustments"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-4"
              >
                <SliderRow
                  label="Brightness"
                  icon={<SunMedium size={14} />}
                  min={50}
                  max={150}
                  value={filters.brightness}
                  onChange={(v) => setFilter("brightness", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Contrast"
                  icon={<Contrast size={14} />}
                  min={50}
                  max={150}
                  value={filters.contrast}
                  onChange={(v) => setFilter("contrast", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Exposure"
                  icon={<Zap size={14} />}
                  min={-100}
                  max={100}
                  value={filters.exposure}
                  onChange={(v) => setFilter("exposure", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Gamma"
                  icon={<Layers size={14} />}
                  min={50}
                  max={200}
                  value={filters.gamma}
                  onChange={(v) => setFilter("gamma", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Opacity"
                  icon={<Eye size={14} />}
                  min={50}
                  max={100}
                  value={filters.opacity}
                  onChange={(v) => setFilter("opacity", v)}
                  ocid="photo.input"
                />
              </motion.div>
            )}

            {/* Color Tab */}
            {controlTab === "color" && (
              <motion.div
                key="color"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-4"
              >
                <SliderRow
                  label="Saturation"
                  icon={<Palette size={14} />}
                  min={0}
                  max={200}
                  value={filters.saturation}
                  onChange={(v) => setFilter("saturation", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Hue Rotate"
                  icon={<RotateCcw size={14} />}
                  min={0}
                  max={360}
                  value={filters.hue}
                  onChange={(v) => setFilter("hue", v)}
                  unit="°"
                  ocid="photo.input"
                />
                <SliderRow
                  label="Temperature"
                  icon={<Thermometer size={14} />}
                  min={-100}
                  max={100}
                  value={filters.temperature}
                  onChange={(v) => setFilter("temperature", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Tint"
                  icon={<Droplets size={14} />}
                  min={-100}
                  max={100}
                  value={filters.tint}
                  onChange={(v) => setFilter("tint", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Vibrance"
                  icon={<Zap size={14} />}
                  min={0}
                  max={200}
                  value={filters.vibrance}
                  onChange={(v) => setFilter("vibrance", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Highlights"
                  icon={<SunMedium size={14} />}
                  min={-100}
                  max={100}
                  value={filters.highlights}
                  onChange={(v) => setFilter("highlights", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Shadows"
                  icon={<Eye size={14} />}
                  min={-100}
                  max={100}
                  value={filters.shadows}
                  onChange={(v) => setFilter("shadows", v)}
                  ocid="photo.input"
                />
              </motion.div>
            )}

            {/* Effects Tab */}
            {controlTab === "effects" && (
              <motion.div
                key="effects"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-4"
              >
                <SliderRow
                  label="Blur"
                  icon={<Droplets size={14} />}
                  min={0}
                  max={20}
                  value={filters.blur}
                  onChange={(v) => setFilter("blur", v)}
                  unit="px"
                  ocid="photo.input"
                />
                <SliderRow
                  label="Sharpen"
                  icon={<Zap size={14} />}
                  min={0}
                  max={10}
                  value={filters.sharpen}
                  onChange={(v) => setFilter("sharpen", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Sepia"
                  icon={<Feather size={14} />}
                  min={0}
                  max={100}
                  value={filters.sepia}
                  onChange={(v) => setFilter("sepia", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Grayscale"
                  icon={<FlipHorizontal size={14} />}
                  min={0}
                  max={100}
                  value={filters.grayscale}
                  onChange={(v) => setFilter("grayscale", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Invert"
                  icon={<Contrast size={14} />}
                  min={0}
                  max={100}
                  value={filters.invert}
                  onChange={(v) => setFilter("invert", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Vignette"
                  icon={<Eye size={14} />}
                  min={0}
                  max={100}
                  value={filters.vignette}
                  onChange={(v) => setFilter("vignette", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Noise"
                  icon={<Layers size={14} />}
                  min={0}
                  max={100}
                  value={filters.noise}
                  onChange={(v) => setFilter("noise", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Pixelate"
                  icon={<Palette size={14} />}
                  min={0}
                  max={50}
                  value={filters.pixelate}
                  onChange={(v) => setFilter("pixelate", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Clarity"
                  icon={<Zap size={14} />}
                  min={0}
                  max={100}
                  value={filters.clarity}
                  onChange={(v) => setFilter("clarity", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Dehaze"
                  icon={<Eye size={14} />}
                  min={0}
                  max={100}
                  value={filters.dehaze}
                  onChange={(v) => setFilter("dehaze", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Texture"
                  icon={<Layers size={14} />}
                  min={0}
                  max={100}
                  value={filters.texture}
                  onChange={(v) => setFilter("texture", v)}
                  ocid="photo.input"
                />
                <SliderRow
                  label="Structure"
                  icon={<Contrast size={14} />}
                  min={0}
                  max={100}
                  value={filters.structure}
                  onChange={(v) => setFilter("structure", v)}
                  ocid="photo.input"
                />
              </motion.div>
            )}

            {/* Transform Tab */}
            {controlTab === "transform" && (
              <motion.div
                key="transform"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <SectionLabel icon={<RotateCw size={14} />}>
                    Rotation
                  </SectionLabel>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {([0, 90, 180, 270] as const).map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => {
                          pushFilterHistory(filters, transform);
                          setTransform((t) => ({ ...t, rotation: deg }));
                        }}
                        className="py-2 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background:
                            transform.rotation === deg
                              ? "oklch(0.74 0.13 207 / 0.2)"
                              : "oklch(0.16 0 0)",
                          border:
                            transform.rotation === deg
                              ? "1.5px solid oklch(0.74 0.13 207)"
                              : "1.5px solid oklch(0.22 0 0)",
                          color:
                            transform.rotation === deg
                              ? "oklch(0.74 0.13 207)"
                              : "oklch(0.67 0 0)",
                        }}
                        data-ocid="photo.toggle"
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <SectionLabel icon={<FlipHorizontal size={14} />}>
                    Flip
                  </SectionLabel>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        pushFilterHistory(filters, transform);
                        setTransform((t) => ({ ...t, flipH: !t.flipH }));
                      }}
                      className="py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
                      style={{
                        background: transform.flipH
                          ? "oklch(0.74 0.13 207 / 0.2)"
                          : "oklch(0.16 0 0)",
                        border: transform.flipH
                          ? "1.5px solid oklch(0.74 0.13 207)"
                          : "1.5px solid oklch(0.22 0 0)",
                        color: transform.flipH
                          ? "oklch(0.74 0.13 207)"
                          : "oklch(0.67 0 0)",
                      }}
                      data-ocid="photo.toggle"
                    >
                      <FlipHorizontal size={14} /> Horizontal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        pushFilterHistory(filters, transform);
                        setTransform((t) => ({ ...t, flipV: !t.flipV }));
                      }}
                      className="py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
                      style={{
                        background: transform.flipV
                          ? "oklch(0.74 0.13 207 / 0.2)"
                          : "oklch(0.16 0 0)",
                        border: transform.flipV
                          ? "1.5px solid oklch(0.74 0.13 207)"
                          : "1.5px solid oklch(0.22 0 0)",
                        color: transform.flipV
                          ? "oklch(0.74 0.13 207)"
                          : "oklch(0.67 0 0)",
                      }}
                      data-ocid="photo.toggle"
                    >
                      <FlipVertical size={14} /> Vertical
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Draw Tab */}
            {controlTab === "draw" && (
              <motion.div
                key="draw"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-5"
              >
                {/* Mode selector */}
                <div>
                  <SectionLabel icon={<Paintbrush size={14} />}>
                    Draw Mode
                  </SectionLabel>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {[
                      {
                        id: "brush" as DrawMode,
                        label: "Brush",
                        icon: <Paintbrush size={13} />,
                      },
                      {
                        id: "text" as DrawMode,
                        label: "Text",
                        icon: <Type size={13} />,
                      },
                      {
                        id: "emoji" as DrawMode,
                        label: "Emoji",
                        icon: <span style={{ fontSize: 13 }}>😊</span>,
                      },
                      {
                        id: "retouch" as DrawMode,
                        label: "Retouch",
                        icon: <Sparkles size={13} />,
                      },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setDrawMode(m.id)}
                        className="py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        style={{
                          background:
                            drawMode === m.id
                              ? "oklch(0.74 0.13 207 / 0.2)"
                              : "oklch(0.16 0 0)",
                          border:
                            drawMode === m.id
                              ? "1.5px solid oklch(0.74 0.13 207)"
                              : "1.5px solid oklch(0.22 0 0)",
                          color:
                            drawMode === m.id
                              ? "oklch(0.74 0.13 207)"
                              : "oklch(0.67 0 0)",
                        }}
                        data-ocid="photo.toggle"
                      >
                        {m.icon}
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {!imageUrl && (
                    <p
                      className="text-xs mt-2"
                      style={{ color: "oklch(0.45 0 0)" }}
                    >
                      Upload an image to start drawing
                    </p>
                  )}
                </div>

                {/* Brush Settings */}
                {drawMode === "brush" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <SectionLabel icon={<Paintbrush size={14} />}>
                        Brush
                      </SectionLabel>
                      <button
                        type="button"
                        onClick={() => setEraserMode((e) => !e)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                        style={{
                          background: eraserMode
                            ? "oklch(0.62 0.22 35 / 0.2)"
                            : "oklch(0.16 0 0)",
                          border: eraserMode
                            ? "1.5px solid oklch(0.62 0.22 35)"
                            : "1.5px solid oklch(0.22 0 0)",
                          color: eraserMode
                            ? "oklch(0.62 0.22 35)"
                            : "oklch(0.67 0 0)",
                        }}
                        data-ocid="photo.toggle"
                      >
                        <Eraser size={12} />
                        {eraserMode ? "Eraser ON" : "Eraser"}
                      </button>
                    </div>
                    <SliderRow
                      label="Brush Size"
                      min={1}
                      max={100}
                      value={brushSize}
                      onChange={setBrushSize}
                      unit="px"
                      ocid="photo.input"
                    />
                    <SliderRow
                      label="Opacity"
                      min={1}
                      max={100}
                      value={brushOpacity}
                      onChange={setBrushOpacity}
                      unit="%"
                      ocid="photo.input"
                    />
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-medium"
                        style={{ color: "oklch(0.6 0 0)" }}
                      >
                        Color
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md border"
                          style={{
                            background: brushColor,
                            borderColor: "oklch(0.3 0 0)",
                          }}
                        />
                        <input
                          type="color"
                          value={brushColor}
                          onChange={(e) => setBrushColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                          }}
                          data-ocid="photo.input"
                        />
                      </div>
                    </div>
                    {/* Quick color swatches */}
                    <div className="flex gap-1.5 flex-wrap">
                      {[
                        "#ffffff",
                        "#000000",
                        "#ff3366",
                        "#ff9500",
                        "#ffdd00",
                        "#4cff72",
                        "#00c8ff",
                        "#a855f7",
                      ].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setBrushColor(c)}
                          className="w-6 h-6 rounded-md transition-transform hover:scale-110"
                          style={{
                            background: c,
                            border:
                              brushColor === c
                                ? "2px solid oklch(0.74 0.13 207)"
                                : "2px solid oklch(0.28 0 0)",
                          }}
                          title={c}
                          data-ocid="photo.toggle"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Text Settings */}
                {drawMode === "text" && (
                  <div className="flex flex-col gap-4">
                    <SectionLabel icon={<Type size={14} />}>
                      Text Tool
                    </SectionLabel>
                    <p className="text-xs" style={{ color: "oklch(0.45 0 0)" }}>
                      Click on the image to place text
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="draw-text-input"
                        className="text-xs font-medium"
                        style={{ color: "oklch(0.6 0 0)" }}
                      >
                        Text Content
                      </label>
                      <input
                        id="draw-text-input"
                        type="text"
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Enter text…"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: "oklch(0.16 0 0)",
                          border: "1px solid oklch(0.24 0 0)",
                          color: "oklch(0.82 0 0)",
                          outline: "none",
                        }}
                        data-ocid="photo.input"
                      />
                    </div>
                    <SliderRow
                      label="Font Size"
                      min={8}
                      max={120}
                      value={textSize}
                      onChange={setTextSize}
                      unit="px"
                      ocid="photo.input"
                    />
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-medium"
                        style={{ color: "oklch(0.6 0 0)" }}
                      >
                        Text Color
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md border"
                          style={{
                            background: textColor,
                            borderColor: "oklch(0.3 0 0)",
                          }}
                        />
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                          }}
                          data-ocid="photo.input"
                        />
                      </div>
                    </div>
                    <SliderRow
                      label="Opacity"
                      min={1}
                      max={100}
                      value={brushOpacity}
                      onChange={setBrushOpacity}
                      unit="%"
                      ocid="photo.input"
                    />
                  </div>
                )}

                {/* Emoji Settings */}
                {drawMode === "emoji" && (
                  <div className="flex flex-col gap-4">
                    <SectionLabel>Emoji Stickers</SectionLabel>
                    <p className="text-xs" style={{ color: "oklch(0.45 0 0)" }}>
                      Pick an emoji, then click the image to stamp it
                    </p>
                    <div className="grid grid-cols-6 gap-1.5">
                      {EMOJI_LIST.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSelectedEmoji(emoji)}
                          className="h-9 rounded-lg text-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{
                            background:
                              selectedEmoji === emoji
                                ? "oklch(0.74 0.13 207 / 0.2)"
                                : "oklch(0.16 0 0)",
                            border:
                              selectedEmoji === emoji
                                ? "1.5px solid oklch(0.74 0.13 207)"
                                : "1.5px solid oklch(0.22 0 0)",
                          }}
                          data-ocid="photo.toggle"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <SliderRow
                      label="Stamp Size"
                      min={8}
                      max={100}
                      value={brushSize}
                      onChange={setBrushSize}
                      unit="px"
                      ocid="photo.input"
                    />
                  </div>
                )}

                {/* Retouch Settings */}
                {drawMode === "retouch" && (
                  <div className="flex flex-col gap-4">
                    <SectionLabel icon={<Sparkles size={14} />}>
                      Retouch Brush
                    </SectionLabel>
                    <p className="text-xs" style={{ color: "oklch(0.45 0 0)" }}>
                      {retouchMode === "soften" &&
                        "Smooth skin texture with a gentle softening effect"}
                      {retouchMode === "heal" &&
                        "Blend and remove blemishes by merging with surrounding pixels"}
                      {retouchMode === "spotfix" &&
                        "Click on a single spot to instantly fix it"}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(["soften", "heal", "spotfix"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setRetouchMode(mode)}
                          className="py-2 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background:
                              retouchMode === mode
                                ? "oklch(0.72 0.15 330 / 0.2)"
                                : "oklch(0.16 0 0)",
                            border:
                              retouchMode === mode
                                ? "1.5px solid oklch(0.72 0.15 330)"
                                : "1.5px solid oklch(0.22 0 0)",
                            color:
                              retouchMode === mode
                                ? "oklch(0.82 0.12 330)"
                                : "oklch(0.67 0 0)",
                          }}
                          data-ocid="photo.toggle"
                        >
                          {mode === "soften"
                            ? "Soften"
                            : mode === "heal"
                              ? "Heal"
                              : "Spot Fix"}
                        </button>
                      ))}
                    </div>
                    <SliderRow
                      label="Brush Size"
                      min={5}
                      max={120}
                      value={retouchSize}
                      onChange={setRetouchSize}
                      unit="px"
                      ocid="photo.input"
                    />
                    <SliderRow
                      label="Strength"
                      min={1}
                      max={100}
                      value={retouchStrength}
                      onChange={setRetouchStrength}
                      unit="%"
                      ocid="photo.input"
                    />
                  </div>
                )}

                {/* Clear Drawing */}
                <button
                  type="button"
                  onClick={clearDrawing}
                  disabled={!hasDrawing}
                  className="w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: hasDrawing
                      ? "oklch(0.62 0.22 35 / 0.1)"
                      : "oklch(0.14 0 0)",
                    border: hasDrawing
                      ? "1.5px solid oklch(0.62 0.22 35 / 0.5)"
                      : "1.5px solid oklch(0.2 0 0)",
                    color: hasDrawing
                      ? "oklch(0.62 0.22 35)"
                      : "oklch(0.35 0 0)",
                    cursor: hasDrawing ? "pointer" : "not-allowed",
                  }}
                  data-ocid="photo.delete_button"
                >
                  <Eraser size={13} /> Clear Drawing
                </button>
              </motion.div>
            )}

            {/* Presets Tab */}
            {controlTab === "presets" && (
              <motion.div
                key="presets"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePreset(p.id)}
                      className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03]"
                      style={{
                        background:
                          activePreset === p.id
                            ? "oklch(0.74 0.13 207 / 0.15)"
                            : "oklch(0.16 0 0)",
                        border:
                          activePreset === p.id
                            ? "1.5px solid oklch(0.74 0.13 207)"
                            : "1.5px solid oklch(0.22 0 0)",
                        color:
                          activePreset === p.id
                            ? "oklch(0.74 0.13 207)"
                            : "oklch(0.67 0 0)",
                      }}
                      data-ocid="photo.tab"
                    >
                      <span className="text-base">{p.emoji}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ControlCard>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <motion.button
            type="button"
            onClick={handleDownload}
            disabled={!imageUrl}
            whileHover={{ scale: !imageUrl ? 1 : 1.01 }}
            whileTap={{ scale: !imageUrl ? 1 : 0.98 }}
            className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background: !imageUrl ? "oklch(0.25 0 0)" : "oklch(0.62 0.22 35)",
              color: !imageUrl ? "oklch(0.45 0 0)" : "white",
              cursor: !imageUrl ? "not-allowed" : "pointer",
            }}
            data-ocid="photo.primary_button"
          >
            <Download size={16} />
            Download Edited Image
          </motion.button>

          <div className="flex gap-2">
            <motion.button
              type="button"
              onClick={handleCopyToClipboard}
              disabled={!imageUrl}
              whileHover={{ scale: !imageUrl ? 1 : 1.01 }}
              whileTap={{ scale: !imageUrl ? 1 : 0.98 }}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 relative overflow-hidden"
              style={{
                background: copiedToast
                  ? "oklch(0.84 0.18 152 / 0.2)"
                  : "oklch(0.16 0 0)",
                border: copiedToast
                  ? "1.5px solid oklch(0.84 0.18 152)"
                  : "1.5px solid oklch(0.22 0 0)",
                color: copiedToast ? "oklch(0.84 0.18 152)" : "oklch(0.67 0 0)",
                cursor: !imageUrl ? "not-allowed" : "pointer",
              }}
              data-ocid="photo.secondary_button"
            >
              <Clipboard size={14} />
              {copiedToast ? "Copied!" : "Copy PNG"}
            </motion.button>

            <motion.button
              type="button"
              onClick={handleReset}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: "oklch(0.16 0 0)",
                border: "1.5px solid oklch(0.22 0 0)",
                color: "oklch(0.67 0 0)",
              }}
              data-ocid="photo.secondary_button"
            >
              Reset All
            </motion.button>
          </div>
        </div>

        {/* Filter Status */}
        {imageUrl && isModified && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg px-4 py-3"
            style={{
              background: "oklch(0.74 0.13 207 / 0.08)",
              border: "1px solid oklch(0.74 0.13 207 / 0.2)",
            }}
          >
            <p
              className="text-xs font-medium"
              style={{ color: "oklch(0.74 0.13 207)" }}
            >
              ✦ Live filters applied
            </p>
            <p className="text-xs mt-1" style={{ color: "oklch(0.55 0 0)" }}>
              B:{filters.brightness}% · C:{filters.contrast}%
              {filters.exposure !== 0 ? ` · Exp:${filters.exposure}` : ""}
              {filters.saturation !== 100
                ? ` · Sat:${filters.saturation}%`
                : ""}
              {filters.sepia > 0 ? ` · Sepia:${filters.sepia}%` : ""}
              {filters.grayscale > 0 ? ` · Gray:${filters.grayscale}%` : ""}
              {filters.blur > 0 ? ` · Blur:${filters.blur}px` : ""}
              {filters.vignette > 0 ? ` · Vgn:${filters.vignette}%` : ""}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
