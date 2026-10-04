import { useEffect, useRef, useState, type RefObject } from 'react';

/** Keep the layout in sync with browser fullscreen, including Escape exits. */
export function useFullscreen(root: RefObject<HTMLDivElement | null>) {
  const [fullscreen, setFullscreen] = useState(false);
  const pending = useRef(false);
  useEffect(() => {
    const changed = () => setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, [root]);
  async function exitFullscreen() {
    if (document.fullscreenElement === root.current) {
      try { await document.exitFullscreen(); } catch { /* Keep the visible exit available. */ }
    } else setFullscreen(false);
  }
  async function toggleFullscreen() {
    if (pending.current) return;
    if (fullscreen || document.fullscreenElement === root.current) { await exitFullscreen(); return; }
    const element = root.current;
    if (!element) return;
    pending.current = true;
    try {
      if (document.fullscreenEnabled && element.requestFullscreen) await element.requestFullscreen();
      else setFullscreen(true);
    } catch { setFullscreen(true); /* Fall back to the expanded editor in restricted browsers. */ }
    finally { pending.current = false; }
  }
  return { fullscreen, toggleFullscreen, exitFullscreen };
}
