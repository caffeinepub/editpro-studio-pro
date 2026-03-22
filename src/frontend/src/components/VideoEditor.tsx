import {
  AlertTriangle,
  CheckCircle,
  Download,
  Loader2,
  Scissors,
  Upload,
  VideoIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

type Status =
  | { type: "idle" }
  | { type: "loading-ffmpeg" }
  | { type: "processing" }
  | { type: "done"; url: string; filename: string }
  | { type: "error"; message: string };

declare global {
  interface Window {
    FFmpeg?: {
      createFFmpeg: (opts: {
        log: boolean;
        logger?: (info: { message: string }) => void;
      }) => {
        load: () => Promise<void>;
        isLoaded: () => boolean;
        run: (...args: string[]) => Promise<void>;
        FS: (
          cmd: string,
          name: string,
          data?: Uint8Array,
        ) => Uint8Array | undefined;
      };
      fetchFile: (file: File | string) => Promise<Uint8Array>;
    };
  }
}

export default function VideoEditor() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [logs, setLogs] = useState<string[]>([]);
  const [crossOriginIsolated, setCrossOriginIsolated] = useState<
    boolean | null
  >(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadUrlRef = useRef<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logCountRef = useRef(0);

  useEffect(() => {
    setCrossOriginIsolated(window.crossOriginIsolated ?? false);
  }, []);

  useEffect(() => {
    if (crossOriginIsolated === true) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/ffmpeg.min.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
    return undefined;
  }, [crossOriginIsolated]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
    };
  }, [videoUrl]);

  // Auto-scroll logs to bottom when log count changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional trigger on logCountRef
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logCountRef.current]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) return;
    const url = URL.createObjectURL(file);
    setVideoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setVideoFile(file);
    setVideoName(file.name);
    setStatus({ type: "idle" });
    setLogs([]);
    logCountRef.current = 0;
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

  const handleTrimExport = async () => {
    if (!videoFile) return;

    const FFmpegLib = window.FFmpeg;
    if (!FFmpegLib) {
      setStatus({
        type: "error",
        message: "FFmpeg not loaded yet. Please wait and try again.",
      });
      return;
    }

    try {
      setStatus({ type: "loading-ffmpeg" });
      setLogs([]);
      logCountRef.current = 0;

      const ffmpeg = FFmpegLib.createFFmpeg({
        log: true,
        logger: ({ message }) => {
          logCountRef.current += 1;
          setLogs((prev) => [...prev.slice(-4), message]);
        },
      });

      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }

      setStatus({ type: "processing" });

      const inputName = `input.${videoFile.name.split(".").pop() ?? "mp4"}`;
      const outputName = "output.mp4";

      const fileData = await FFmpegLib.fetchFile(videoFile);
      ffmpeg.FS("writeFile", inputName, fileData);

      await ffmpeg.run(
        "-ss",
        String(startTime),
        "-to",
        String(endTime),
        "-i",
        inputName,
        "-vf",
        "drawtext=text='EditPro':fontsize=24:fontcolor=white:x=10:y=h-th-10",
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        outputName,
      );

      const data = ffmpeg.FS("readFile", outputName) as Uint8Array;
      const blob = new Blob([data.buffer as ArrayBuffer], {
        type: "video/mp4",
      });
      const url = URL.createObjectURL(blob);

      if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = url;

      const baseName = videoFile.name.replace(/\.[^.]+$/, "");
      setStatus({ type: "done", url, filename: `${baseName}_editpro.mp4` });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err instanceof Error ? err.message : "An unknown error occurred.",
      });
    }
  };

  if (crossOriginIsolated === null) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "300px" }}
      >
        <div
          className="flex items-center gap-3"
          style={{ color: "oklch(0.67 0 0)" }}
        >
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Checking environment...</span>
        </div>
      </div>
    );
  }

  const isProcessing =
    status.type === "loading-ffmpeg" || status.type === "processing";
  const isTrimDisabled = !videoFile || !crossOriginIsolated || isProcessing;
  const showLogs =
    logs.length > 0 &&
    (isProcessing || status.type === "done" || status.type === "error");

  return (
    <div className="flex flex-col gap-6">
      {/* COOP/COEP Warning */}
      {!crossOriginIsolated && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 flex gap-3"
          style={{
            background: "oklch(0.55 0.15 50 / 0.1)",
            border: "1px solid oklch(0.55 0.15 50 / 0.4)",
          }}
          data-ocid="video.error_state"
        >
          <AlertTriangle
            size={18}
            style={{ color: "oklch(0.78 0.18 65)" }}
            className="mt-0.5 flex-shrink-0"
          />
          <div>
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: "oklch(0.78 0.18 65)" }}
            >
              FFmpeg Processing Unavailable
            </p>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "oklch(0.67 0 0)" }}
            >
              FFmpeg video processing requires cross-origin isolation (COOP/COEP
              headers), which is not available in this environment. Video
              editing features — including trim and watermark export — are
              currently unavailable. You can still upload and preview videos.
            </p>
          </div>
        </motion.div>
      )}

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
            data-ocid="video.dropzone"
          >
            {videoUrl ? (
              <div
                className="relative flex items-center justify-center p-4"
                style={{ minHeight: "420px" }}
              >
                {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded video */}
                <video
                  src={videoUrl}
                  controls
                  className="max-w-full max-h-[480px] rounded-xl"
                  style={{ background: "#000" }}
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
                htmlFor="video-file-input"
                className="flex flex-col items-center justify-center h-full cursor-pointer transition-all duration-200"
                style={{
                  minHeight: "420px",
                  border: `2px dashed ${
                    isDragging ? "oklch(0.74 0.13 207)" : "oklch(0.25 0 0)"
                  }`,
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
                  <VideoIcon
                    size={28}
                    style={{ color: "oklch(0.74 0.13 207)" }}
                  />
                </div>
                <p className="text-base font-semibold text-foreground mb-1">
                  Drop a video here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
                <p className="text-xs mt-2" style={{ color: "oklch(0.5 0 0)" }}>
                  MP4, MOV, WEBM, AVI
                </p>
              </label>
            )}
          </div>
          {videoName && (
            <p className="text-xs text-muted-foreground mt-2 ml-1 truncate">
              📎 {videoName}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Upload */}
          <ControlCard>
            <SectionLabel icon={<Upload size={14} />}>
              Upload Video
            </SectionLabel>
            <input
              ref={fileInputRef}
              id="video-file-input"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              data-ocid="video.upload_button"
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

          {/* Trim times */}
          <ControlCard>
            <SectionLabel icon={<Scissors size={14} />}>
              Trim Range (seconds)
            </SectionLabel>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label
                  htmlFor="trim-start"
                  className="block text-xs mb-1.5"
                  style={{ color: "oklch(0.55 0 0)" }}
                >
                  Start Time
                </label>
                <input
                  id="trim-start"
                  type="number"
                  min={0}
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(Math.max(0, Number(e.target.value)))
                  }
                  className="w-full px-3 py-2 rounded-lg text-sm font-medium outline-none transition-all"
                  style={{
                    background: "oklch(0.09 0 0)",
                    border: "1.5px solid oklch(0.22 0 0)",
                    color: "oklch(0.93 0 0)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.74 0.13 207)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.22 0 0)";
                  }}
                  data-ocid="video.input"
                />
              </div>
              <div>
                <label
                  htmlFor="trim-end"
                  className="block text-xs mb-1.5"
                  style={{ color: "oklch(0.55 0 0)" }}
                >
                  End Time
                </label>
                <input
                  id="trim-end"
                  type="number"
                  min={0}
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(Math.max(0, Number(e.target.value)))
                  }
                  className="w-full px-3 py-2 rounded-lg text-sm font-medium outline-none transition-all"
                  style={{
                    background: "oklch(0.09 0 0)",
                    border: "1.5px solid oklch(0.22 0 0)",
                    color: "oklch(0.93 0 0)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.74 0.13 207)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.22 0 0)";
                  }}
                  data-ocid="video.input"
                />
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: "oklch(0.45 0 0)" }}>
              Watermark "EditPro" will be added at bottom-left
            </p>
          </ControlCard>

          {/* Trim & Export button */}
          <motion.button
            type="button"
            onClick={handleTrimExport}
            disabled={isTrimDisabled}
            whileHover={{ scale: isTrimDisabled ? 1 : 1.01 }}
            whileTap={{ scale: isTrimDisabled ? 1 : 0.98 }}
            className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background: isTrimDisabled
                ? "oklch(0.25 0 0)"
                : "oklch(0.62 0.22 35)",
              color: isTrimDisabled ? "oklch(0.45 0 0)" : "white",
              cursor: isTrimDisabled ? "not-allowed" : "pointer",
            }}
            data-ocid="video.primary_button"
          >
            {isProcessing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Scissors size={16} />
            )}
            {status.type === "loading-ffmpeg"
              ? "Loading FFmpeg..."
              : status.type === "processing"
                ? "Processing..."
                : "Trim & Export"}
          </motion.button>

          {/* FFmpeg Log Terminal */}
          {showLogs && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg overflow-hidden"
              style={{
                background: "oklch(0.07 0 0)",
                border: "1px solid oklch(0.18 0 0)",
              }}
              data-ocid="video.loading_state"
            >
              <div
                className="flex items-center gap-2 px-3 py-2 border-b"
                style={{ borderColor: "oklch(0.18 0 0)" }}
              >
                <div className="flex gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: "oklch(0.6 0.2 25)" }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: "oklch(0.7 0.15 65)" }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: "oklch(0.65 0.15 145)" }}
                  />
                </div>
                <span
                  className="text-xs"
                  style={{
                    fontFamily: "monospace",
                    color: "oklch(0.45 0 0)",
                  }}
                >
                  ffmpeg log
                </span>
                {isProcessing && (
                  <Loader2
                    size={11}
                    className="animate-spin ml-auto"
                    style={{ color: "oklch(0.74 0.13 207)" }}
                  />
                )}
              </div>
              <div
                className="px-3 py-2 overflow-y-auto"
                style={{ maxHeight: "120px" }}
              >
                {logs.map((line, i) => (
                  <p
                    // biome-ignore lint/suspicious/noArrayIndexKey: log lines use index as key
                    key={i}
                    className="text-xs leading-relaxed"
                    style={{
                      fontFamily: "monospace",
                      color:
                        line.includes("error") || line.includes("Error")
                          ? "oklch(0.7 0.2 27)"
                          : "oklch(0.6 0 0)",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {line}
                  </p>
                ))}
                <div ref={logsEndRef} />
              </div>
            </motion.div>
          )}

          {/* Status messages */}
          {status.type !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg px-4 py-3"
              style={{
                background:
                  status.type === "error"
                    ? "oklch(0.577 0.245 27 / 0.1)"
                    : status.type === "done"
                      ? "oklch(0.84 0.18 152 / 0.08)"
                      : "oklch(0.74 0.13 207 / 0.08)",
                border:
                  status.type === "error"
                    ? "1px solid oklch(0.577 0.245 27 / 0.3)"
                    : status.type === "done"
                      ? "1px solid oklch(0.84 0.18 152 / 0.3)"
                      : "1px solid oklch(0.74 0.13 207 / 0.2)",
              }}
              data-ocid={
                status.type === "done"
                  ? "video.success_state"
                  : status.type === "error"
                    ? "video.error_state"
                    : "video.loading_state"
              }
            >
              {status.type === "loading-ffmpeg" && (
                <div className="flex items-center gap-2">
                  <Loader2
                    size={14}
                    className="animate-spin"
                    style={{ color: "oklch(0.74 0.13 207)" }}
                  />
                  <p
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.74 0.13 207)" }}
                  >
                    Loading FFmpeg...
                  </p>
                </div>
              )}
              {status.type === "processing" && (
                <div className="flex items-center gap-2">
                  <Loader2
                    size={14}
                    className="animate-spin"
                    style={{ color: "oklch(0.74 0.13 207)" }}
                  />
                  <p
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.74 0.13 207)" }}
                  >
                    Processing video...
                  </p>
                </div>
              )}
              {status.type === "error" && (
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={14}
                    style={{ color: "oklch(0.7 0.2 27)" }}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <p className="text-xs" style={{ color: "oklch(0.7 0.2 27)" }}>
                    {status.message}
                  </p>
                </div>
              )}
              {status.type === "done" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      size={14}
                      style={{ color: "oklch(0.84 0.18 152)" }}
                    />
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.84 0.18 152)" }}
                    >
                      Export complete!
                    </p>
                  </div>
                  <a
                    href={status.url}
                    download={status.filename}
                    className="flex items-center gap-2 text-xs font-bold py-2 px-3 rounded-lg transition-all"
                    style={{
                      color: "oklch(0.84 0.18 152)",
                      background: "oklch(0.84 0.18 152 / 0.1)",
                      border: "1px solid oklch(0.84 0.18 152 / 0.3)",
                      textDecoration: "none",
                    }}
                    data-ocid="video.button"
                  >
                    <Download size={13} />
                    Download {status.filename}
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
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
