import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALL_LOGGED_KEY = "pwa-install-logged";

function sendInstallEvent() {
  fetch("https://sp.osk.msu.ru/?event=install&q=pwa", { keepalive: true, mode: "no-cors" }).catch(() => {});
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      sendInstallEvent();
      localStorage.setItem(INSTALL_LOGGED_KEY, "1");
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    // iOS Safari: appinstalled never fires — detect first launch in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      if (!localStorage.getItem(INSTALL_LOGGED_KEY)) {
        sendInstallEvent();
        localStorage.setItem(INSTALL_LOGGED_KEY, "1");
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      sendInstallEvent();
      localStorage.setItem(INSTALL_LOGGED_KEY, "1");
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  };

  const canInstall = !!installPrompt && !isInstalled;

  return { canInstall, install, isInstalled };
}
