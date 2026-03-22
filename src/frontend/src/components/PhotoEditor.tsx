import {
  Contrast,
  Download,
  ImageIcon,
  Palette,
  RotateCcw,
  SunMedium,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

type Preset = "normal" | "vivid" | "bw" | "warm" | "cool";

const PRESETS: { id: Preset; label: string; emoji: string }[] = [
  { id: "normal", label: "Normal", emoji: "○" },
  { id: "vivid", label: "Vivid", emoji: "✦" },
  { id: "bw", label: "B&W", emoji: "◑" },
  { id: "warm", label: "Warm", emoji: "☀" },
  { id: "cool", label: "Cool", emoji: "❄" },
];

function applyPreset(preset: Preset) {
  switch (preset) {
    case "normal":
      return {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        grayscale: 0,
        sepia: 0,
      };
    case "vivid":
      return {
        brightness: 110,
        contrast: 120,
        saturation: 140,
        hue: 0,
        grayscale: 0,
        sepia: 0,
      };
    case "bw":
      return {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        grayscale: 100,
        sepia: 0,
      };
    case "warm":
      return {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 10,
        grayscale: 0,
        sepia: 40,
      };
    case "cool":
      return {
        brightness: 100,
        contrast: 100,
        saturation: 80,
        hue: 200,
        grayscale: 0,
        sepia: 0,
      };
  }
}

export default function PhotoEditor() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [activePreset, setActivePreset] = useState<Preset>("normal");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cssFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) grayscale(${grayscale}%) sepia(${sepia}%)`;

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setImageName(file.name);
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
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHue(0);
    setGrayscale(0);
    setSepia(0);
    setActivePreset("normal");
  };

  const handlePreset = (preset: Preset) => {
    const vals = applyPreset(preset);
    setBrightness(vals.brightness);
    setContrast(vals.contrast);
    setSaturation(vals.saturation);
    setHue(vals.hue);
    setGrayscale(vals.grayscale);
    setSepia(vals.sepia);
    setActivePreset(preset);
  };

  const handleDownload = () => {
    if (!imageUrl || !imageEl) return;
    const canvas = document.createElement("canvas");
    canvas.width = imageEl.naturalWidth;
    canvas.height = imageEl.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.filter = cssFilter;
    ctx.drawImage(imageEl, 0, 0);
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

  const isModified =
    brightness !== 100 ||
    contrast !== 100 ||
    saturation !== 100 ||
    hue !== 0 ||
    grayscale !== 0 ||
    sepia !== 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Preview Area */}
      <div className="lg:col-span-3">
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
            <div
              className="relative w-full h-full flex items-center justify-center p-4"
              style={{ minHeight: "420px" }}
            >
              <img
                src={imageUrl}
                alt="Uploaded preview"
                ref={(el) => setImageEl(el)}
                className="max-w-full max-h-[500px] rounded-xl object-contain"
                style={{
                  filter: cssFilter,
                  transition: "filter 0.1s ease",
                }}
              />
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
          ) : (
            <label
              htmlFor="photo-file-input"
              className="flex flex-col items-center justify-center h-full cursor-pointer transition-all duration-200"
              style={{
                minHeight: "420px",
                border: `2px dashed ${isDragging ? "oklch(0.74 0.13 207)" : "oklch(0.25 0 0)"}`,
                background: isDragging
                  ? "oklch(0.74 0.13 207 / 0.05)"
                  : "transparent",
                margin: "1px",
                borderRadius: "1rem",
                display: "flex",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "oklch(0.16 0 0)" }}
              >
                <ImageIcon
                  size={28}
                  style={{ color: "oklch(0.74 0.13 207)" }}
                />
              </div>
              <p className="text-base font-semibold text-foreground mb-1">
                Drop an image here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
              <p className="text-xs mt-2" style={{ color: "oklch(0.5 0 0)" }}>
                PNG, JPG, WEBP, GIF
              </p>
            </label>
          )}
        </div>
        {imageName && (
          <p className="text-xs text-muted-foreground mt-2 ml-1 truncate">
            📎 {imageName}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Upload */}
        <ControlCard>
          <SectionLabel icon={<Upload size={14} />}>Upload Image</SectionLabel>
          <input
            ref={fileInputRef}
            id="photo-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            data-ocid="photo.upload_button"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-3"
            style={{
              background: "oklch(0.16 0 0)",
              border: "1.5px solid oklch(0.74 0.13 207 / 0.4)",
              color: "oklch(0.74 0.13 207)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(0.74 0.13 207 / 0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(0.16 0 0)";
            }}
          >
            <Upload size={14} />
            Choose File
          </button>
        </ControlCard>

        {/* Presets */}
        <ControlCard>
          <SectionLabel icon={<Palette size={14} />}>Presets</SectionLabel>
          <div className="flex flex-wrap gap-2 mt-3">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePreset(p.id)}
                className="flex-1 min-w-0 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150"
                style={{
                  background:
                    activePreset === p.id
                      ? "oklch(0.74 0.13 207 / 0.2)"
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
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </ControlCard>

        {/* Sliders */}
        <ControlCard>
          <div className="flex flex-col gap-4">
            <SliderRow
              label="Brightness"
              icon={<SunMedium size={14} />}
              min={50}
              max={150}
              value={brightness}
              onChange={setBrightness}
              ocid="photo.input"
            />
            <SliderRow
              label="Contrast"
              icon={<Contrast size={14} />}
              min={50}
              max={150}
              value={contrast}
              onChange={setContrast}
              ocid="photo.input"
            />
            <SliderRow
              label="Saturation"
              icon={<Palette size={14} />}
              min={0}
              max={200}
              value={saturation}
              onChange={setSaturation}
              ocid="photo.input"
            />
            <SliderRow
              label="Hue Rotate"
              icon={<RotateCcw size={14} />}
              min={0}
              max={360}
              value={hue}
              onChange={setHue}
              unit="°"
              ocid="photo.input"
            />
          </div>
        </ControlCard>

        {/* Toggles */}
        <ControlCard>
          <SectionLabel>Effects</SectionLabel>
          <div className="flex flex-col gap-3 mt-3">
            <ToggleRow
              label="Grayscale"
              value={grayscale === 100}
              onChange={(v) => setGrayscale(v ? 100 : 0)}
            />
            <ToggleRow
              label="Sepia"
              value={sepia === 100}
              onChange={(v) => setSepia(v ? 100 : 0)}
            />
          </div>
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

          <motion.button
            type="button"
            onClick={handleReset}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              background: "oklch(0.16 0 0)",
              border: "1.5px solid oklch(0.22 0 0)",
              color: "oklch(0.67 0 0)",
            }}
            data-ocid="photo.secondary_button"
          >
            Reset Filters
          </motion.button>
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
              B:{brightness}% · C:{contrast}% · S:{saturation}% · H:{hue}° ·
              Gray:{grayscale}% · Sepia:{sepia}%
            </p>
          </motion.div>
        )}
      </div>
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
  unit = "%",
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
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <SectionLabel icon={icon}>{label}</SectionLabel>
        <ValueBadge value={value} unit={unit} />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        aria-label={label}
        style={{ "--range-progress": `${progress}%` } as React.CSSProperties}
        data-ocid={ocid}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: "oklch(0.45 0 0)" }}>
          {min}
          {unit}
        </span>
        <span className="text-xs" style={{ color: "oklch(0.45 0 0)" }}>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "oklch(0.67 0 0)" }}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative w-10 h-5 rounded-full transition-all duration-200"
        style={{
          background: value ? "oklch(0.74 0.13 207)" : "oklch(0.22 0 0)",
        }}
        aria-pressed={value}
        data-ocid="photo.toggle"
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
          style={{
            background: "white",
            left: value ? "calc(100% - 1.1rem)" : "2px",
          }}
        />
      </button>
    </div>
  );
}

function ControlCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "oklch(0.12 0 0)",
        border: "1px solid oklch(0.22 0 0)",
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({
  children,
  icon,
}: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
      style={{ color: "oklch(0.67 0 0)" }}
    >
      {icon}
      {children}
    </p>
  );
}

function ValueBadge({ value, unit = "%" }: { value: number; unit?: string }) {
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded"
      style={{
        background: "oklch(0.74 0.13 207 / 0.12)",
        color: "oklch(0.74 0.13 207)",
      }}
    >
      {value}
      {unit}
    </span>
  );
}
