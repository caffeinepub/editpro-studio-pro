import { motion } from "motion/react";
import PhotoEditor from "./components/PhotoEditor";

export default function App() {
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
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
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
              v2.0
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <PhotoEditor />
        </motion.div>
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
