import { useState, useEffect } from "react";
import { X } from "lucide-react";

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|opios|chrome/i.test(ua);
  return isIos && isSafari;
}

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

const DISMISSED_KEY = "ios-install-banner-dismissed";

export function IOSInstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isIosSafari() && !isStandalone() && !localStorage.getItem(DISMISSED_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div
        className="relative bg-card border border-border rounded-2xl shadow-xl p-4 pr-10 flex items-start gap-3 pointer-events-auto"
        role="banner"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
          🏛️
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground leading-snug">
            Добавьте на экран Домой
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Нажмите{" "}
            <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
              <ShareIcon />
            </span>{" "}
            внизу экрана, затем «На экран Домой»
          </p>
        </div>

        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/60 transition-colors"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Arrow pointing down toward Safari toolbar */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-b border-r border-border rotate-45 rounded-sm" />
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline h-4 w-4 align-middle text-primary"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
