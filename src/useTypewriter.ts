import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { EditorView } from '@codemirror/view';
import { cmToSource } from './core';
import type { Mode } from './core';
import { pmToSource, type EditorBridge } from './editors';

type Surface = 'visual' | 'code';
interface Options {
  bridge: RefObject<EditorBridge>;
  root: RefObject<HTMLDivElement | null>;
  canvas: RefObject<HTMLDivElement | null>;
  mode: Mode;
  enabled: boolean;
  active: boolean;
  blocked: boolean;
  zoom: number;
  layoutKey: string;
}

/** Scroll only on caret activity or layout changes, never on manual scrolling. */
export function useTypewriter(options: Options) {
  const latest = useRef(options);
  latest.current = options;
  const frame = useRef<number | null>(null);
  const schedule = useCallback((origin: Surface) => {
    const o = latest.current;
    if (!o.enabled || !o.active || o.blocked || o.mode === 'read') return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const state = latest.current,
        b = state.bridge.current;
      if (!state.enabled || !state.active || state.blocked || state.mode === 'read') return;
      let sourcePosition: number;
      if (origin === 'code') {
        const editor = b.code;
        if (!editor || !editor.state.selection.main.empty || editor.composing) return;
        const position = editor.state.selection.main.head;
        editor.dispatch({ effects: EditorView.scrollIntoView(position, { y: 'center' }) });
        sourcePosition = cmToSource(b.source, position);
      } else {
        const editor = b.editor;
        if (!editor || !editor.state.selection.empty || editor.view.composing) return;
        const scroller =
          state.mode === 'split'
            ? state.root.current?.querySelector<HTMLElement>('.visual-scroll')
            : state.canvas.current;
        if (!scroller) return;
        const position = editor.state.selection.head;
        try {
          const caret = editor.view.coordsAtPos(position),
            pane = scroller.getBoundingClientRect();
          const delta = (caret.top + caret.bottom) / 2 - (pane.top + scroller.clientHeight / 2);
          if (Math.abs(delta) > 1)
            scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: 'instant' });
        } catch {
          return;
        }
        sourcePosition = pmToSource(b, position, position).from;
      }
      // Existing navigation maps source positions without moving the other caret or focus.
      if (state.mode === 'split') b.onNavigate?.(sourcePosition, origin);
    });
  }, []);

  useEffect(() => {
    const { root, canvas, bridge, enabled, active, mode } = options;
    const element = root.current;
    if (!element || !active) return;
    const updateLayout = () => {
      const visual = mode === 'split' ? element.querySelector<HTMLElement>('.visual-scroll') : canvas.current;
      const code = bridge.current.code;
      element.style.setProperty('--visual-focus-space', Math.max(0, (visual?.clientHeight || 0) / 2) + 'px');
      element.style.setProperty(
        '--code-focus-space',
        Math.max(0, (code?.scrollDOM.clientHeight || 0) / 2) + 'px',
      );
      code?.requestMeasure();
      if (enabled) schedule(bridge.current.editor?.isFocused ? 'visual' : code ? 'code' : 'visual');
    };
    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    if (canvas.current) observer.observe(canvas.current);
    const visual = element.querySelector('.visual-scroll');
    if (visual) observer.observe(visual);
    if (bridge.current.code) observer.observe(bridge.current.code.scrollDOM);
    return () => {
      observer.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [options.enabled, options.active, options.mode, options.zoom, options.layoutKey, schedule]);
  return schedule;
}
