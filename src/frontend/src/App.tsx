import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import PhotoEditor from "./components/PhotoEditor";
import VideoEditor from "./components/VideoEditor";

type Tab = "photo" | "video";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("photo");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-border"
        style={{ background: "oklch(0.12 0 0)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.62 0.22 35)" }}
              aria-hidden="true"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="white"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              EditPro Studio{" "}
              <span style={{ color: "oklch(0.74 0.13 207)" }}>PRO</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full border"
              style={{
                color: "oklch(0.74 0.13 207)",
                borderColor: "oklch(0.74 0.13 207 / 0.3)",
                background: "oklch(0.74 0.13 207 / 0.08)",
              }}
            >
              v1.0
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          <TabButton
            active={activeTab === "photo"}
            onClick={() => setActiveTab("photo")}
            data-ocid="photo_tab"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            Photo Editor
          </TabButton>
          <TabButton
            active={activeTab === "video"}
            onClick={() => setActiveTab("video")}
            data-ocid="video_tab"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
            Video Editor
          </TabButton>
        </div>

        {/* Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {activeTab === "photo" ? <PhotoEditor /> : <VideoEditor />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with{" "}
            <span style={{ color: "oklch(0.62 0.22 35)" }}>♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              style={{ color: "oklch(0.74 0.13 207)" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  "data-ocid": dataOcid,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  "data-ocid"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={dataOcid}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
      style={{
        background: active ? "oklch(0.74 0.13 207 / 0.1)" : "oklch(0.14 0 0)",
        border: `1.5px solid ${
          active ? "oklch(0.74 0.13 207)" : "oklch(0.22 0 0)"
        }`,
        color: active ? "oklch(0.74 0.13 207)" : "oklch(0.67 0 0)",
        boxShadow: active ? "0 0 12px oklch(0.74 0.13 207 / 0.2)" : "none",
      }}
    >
      {children}
    </button>
  );
}
