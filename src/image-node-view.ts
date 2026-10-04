import { NodeSelection } from '@tiptap/pm/state';
import type { NodeViewRendererProps } from '@tiptap/core';
import type { EditorBridge } from './editors';
import type { RefObject } from 'react';
import { imageDimension } from './image-format';

export function imageNodeView({ node: initial, editor, getPos }: NodeViewRendererProps, bridge: RefObject<EditorBridge>, resolve: (src: string, b: EditorBridge) => string) {
  let node = initial, selected = false, dragging = false, cleanup: (() => void) | null = null;
  const dom = document.createElement('span'); dom.className = 'image-node'; dom.contentEditable = 'false';
  const img = document.createElement('img'); img.draggable = false; img.referrerPolicy = 'no-referrer';
  const controls = document.createElement('span'); controls.className = 'image-resize-controls';
  const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'image-reset'; reset.textContent = bridge.current.t('imageReset'); reset.title = bridge.current.t('imageReset');
  const updateSize = (width: number | null, height: number | null) => {
    const pos = getPos(); if (pos === undefined || !editor.isEditable) return;
    const current = editor.state.doc.nodeAt(pos); if (current?.type.name !== 'image') return;
    if (current.attrs.width === width && current.attrs.height === height) return;
    editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { ...current.attrs, width, height }).setMeta('imageResize', true));
  };
  const displaySize = (width: number | null, height: number | null) => {
    img.style.width = width ? `calc(${width}px * var(--zoom, 1))` : '';
    img.style.height = !width && height ? `calc(${height}px * var(--zoom, 1))` : '';
  };
  const render = () => {
    const src = resolve(node.attrs.src, bridge.current);
    dom.classList.toggle('image-placeholder', !src);
    dom.classList.toggle('image-selected', selected && editor.isEditable && !!src);
    if (src) {
      if (img.getAttribute('src') !== src) img.src = src;
      img.alt = node.attrs.alt || ''; img.title = node.attrs.title || '';
      for (const dimension of ['width', 'height'] as const) {
        const value = imageDimension(node.attrs[dimension]);
        if (value) img.setAttribute(dimension, String(value)); else img.removeAttribute(dimension);
      }
      if (!dragging) displaySize(imageDimension(node.attrs.width), imageDimension(node.attrs.height));
      if (dom.firstChild !== img) dom.replaceChildren(img, controls);
    } else dom.textContent = '▧ ' + (node.attrs.alt || bridge.current.t('image')) + ' · ' + bridge.current.t(/^https?:/i.test(node.attrs.src) ? 'imageBlocked' : 'imageMissing');
    reset.hidden = !node.attrs.width && !node.attrs.height;
  };
  img.addEventListener('click', e => {
    if (!editor.isEditable) return;
    e.preventDefault(); const pos = getPos(); if (pos === undefined) return;
    editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos)));
    editor.commands.focus(undefined, { scrollIntoView: false });
    bridge.current.onFocus?.('visual');
  });
  reset.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); updateSize(null, null); });
  for (const direction of ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']) {
    const handle = document.createElement('button'); handle.type = 'button'; handle.className = 'image-resize-handle'; handle.dataset.resize = direction;
    handle.title = bridge.current.t('imageResizeHelp'); handle.setAttribute('aria-label', bridge.current.t('imageResize') + ' · ' + direction.toUpperCase());
    handle.addEventListener('pointerdown', e => {
      if (e.button !== 0 || !editor.isEditable || dragging) return;
      e.preventDefault(); e.stopPropagation();
      const rect = img.getBoundingClientRect(), startX = e.clientX, startY = e.clientY;
      if (!rect.width || !rect.height) return;
      const zoom = parseFloat(getComputedStyle(img).getPropertyValue('--zoom')) || 1;
      const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : rect.width / rect.height;
      const parentWidth = dom.parentElement?.clientWidth || rect.width;
      const maximum = Math.max(1, Math.floor(parentWidth / zoom)), minimum = Math.min(48, maximum);
      let width = imageDimension(node.attrs.width) || Math.round(rect.width / zoom), moved = false;
      dragging = true; dom.classList.add('image-resizing');
      const move = (event: PointerEvent) => {
        if (event.pointerId !== e.pointerId) return;
        const dx = event.clientX - startX, dy = event.clientY - startY;
        moved ||= Math.abs(dx) + Math.abs(dy) > 2;
        const horizontal = direction.includes('e') ? dx : -dx, vertical = (direction.includes('s') ? dy : -dy) * ratio;
        const delta = direction === 'n' || direction === 's' ? vertical : direction.length === 2 ? Math.abs(horizontal) >= Math.abs(vertical) ? horizontal : vertical : horizontal;
        width = Math.max(minimum, Math.min(maximum, Math.round((rect.width + delta) / zoom)));
        displaySize(width, Math.max(1, Math.round(width / ratio)));
      };
      const finish = (event: PointerEvent) => {
        if (event.pointerId !== e.pointerId) return;
        cleanup?.();
        if (event.type === 'pointerup' && moved) updateSize(width, Math.max(1, Math.round(width / ratio)));
        else render();
      };
      const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cleanup?.(); render(); } };
      cleanup = () => {
        dragging = false; dom.classList.remove('image-resizing');
        document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', finish); document.removeEventListener('pointercancel', finish); document.removeEventListener('keydown', key, true); cleanup = null;
      };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', finish); document.addEventListener('pointercancel', finish); document.addEventListener('keydown', key, true);
    });
    handle.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) || !editor.isEditable) return;
      e.preventDefault(); e.stopPropagation();
      const zoom = parseFloat(getComputedStyle(img).getPropertyValue('--zoom')) || 1;
      const rect = img.getBoundingClientRect(), ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : rect.width / rect.height;
      const maximum = Math.max(1, Math.floor((dom.parentElement?.clientWidth || rect.width) / zoom));
      const current = imageDimension(node.attrs.width) || Math.round(rect.width / zoom);
      const width = Math.max(Math.min(48, maximum), Math.min(maximum, current + (e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 20 : 5)));
      updateSize(width, Math.max(1, Math.round(width / ratio)));
    });
    controls.append(handle);
  }
  controls.append(reset); render();
  return {
    dom,
    update(next: typeof node) { if (next.type !== node.type) return false; node = next; render(); return true; },
    selectNode() { selected = true; render(); },
    deselectNode() { selected = false; render(); },
    stopEvent(event: Event) { return controls.contains(event.target as Node); },
    ignoreMutation() { return true; },
    destroy() { cleanup?.(); }
  };
}
