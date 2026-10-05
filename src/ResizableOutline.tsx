import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

const bounded = (value: number) => Math.min(1.8, Math.max(1, Number.isFinite(value) ? value : 1));
export function ResizableOutline({
  scale,
  onResize,
  lang,
  children,
}: {
  scale: number;
  onResize: (scale: number) => void;
  lang: 'es' | 'en';
  children: ReactNode;
}) {
  const panel = useRef<HTMLElement>(null);
  const [preview, setPreview] = useState<number | null>(null),
    [minimum, setMinimum] = useState(218);
  const drag = useRef<{ x: number; scale: number; minimum: number; pointer: number } | null>(null),
    draft = useRef(1);
  const current = bounded(preview ?? scale);
  const readMinimum = () =>
    panel.current
      ? parseFloat(getComputedStyle(panel.current).getPropertyValue('--outline-min-width')) || 218
      : 218;
  useEffect(() => {
    let disposed = false;
    const update = () => {
      if (!disposed && panel.current) setMinimum(readMinimum());
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(panel.current!);
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, []);
  function cancel(handle: HTMLElement) {
    const pointer = drag.current?.pointer;
    drag.current = null;
    setPreview(null);
    if (pointer !== undefined && handle.hasPointerCapture(pointer)) handle.releasePointerCapture(pointer);
  }
  return (
    <aside
      ref={panel}
      className={`outline-panel${preview !== null ? ' is-resizing' : ''}`}
      style={{ '--outline-scale': current } as CSSProperties}
    >
      {children}
      <div
        className="outline-resizer"
        role="separator"
        aria-orientation="vertical"
        tabIndex={0}
        aria-label={lang === 'es' ? 'Ancho del índice' : 'Outline width'}
        title={
          lang === 'es'
            ? 'Arrastra para ajustar el ancho del índice (100–180 %)'
            : 'Drag to resize the outline (100–180%)'
        }
        aria-valuemin={minimum}
        aria-valuemax={Math.round(minimum * 1.8)}
        aria-valuenow={Math.round(minimum * current)}
        onPointerDown={event => {
          if (event.button !== 0 || !event.isPrimary) return;
          event.preventDefault();
          event.currentTarget.focus({ preventScroll: true });
          drag.current = {
            x: event.clientX,
            scale: current,
            minimum: readMinimum(),
            pointer: event.pointerId,
          };
          draft.current = current;
          setPreview(current);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={event => {
          const start = drag.current;
          if (!start || start.pointer !== event.pointerId) return;
          draft.current = bounded(start.scale + (event.clientX - start.x) / start.minimum);
          setPreview(draft.current);
        }}
        onPointerUp={event => {
          if (drag.current?.pointer !== event.pointerId) return;
          const next = draft.current;
          cancel(event.currentTarget);
          onResize(next);
        }}
        onPointerCancel={event => cancel(event.currentTarget)}
        onLostPointerCapture={event => {
          if (drag.current) cancel(event.currentTarget);
        }}
        onKeyDown={event => {
          if (event.key === 'Escape' && drag.current) {
            event.preventDefault();
            cancel(event.currentTarget);
            return;
          }
          const next =
            event.key === 'Home'
              ? 1
              : event.key === 'End'
                ? 1.8
                : event.key === 'ArrowLeft'
                  ? current - 0.05
                  : event.key === 'ArrowRight'
                    ? current + 0.05
                    : null;
          if (next !== null) {
            event.preventDefault();
            onResize(bounded(next));
          }
        }}
      />
    </aside>
  );
}
