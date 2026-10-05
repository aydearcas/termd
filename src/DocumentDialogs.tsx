import type React from 'react';
import { FolderOpen } from 'lucide-react';
import { blocksOf, type stats, type DocState, type Settings } from './core';
import type { TranslationKey } from './i18n';

// Simple dialogs of the document editor. They only render what the editor passes in;
// all state and actions stay in DocumentEditor (App.tsx).

type Translate = (key: TranslationKey) => string;
type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
type Size = { rows: number; cols: number };
type LinkData = { label: string; url: string };
type ImageFields = { alt: string; src: string };
type CodeData = { lang: string; text: string };

export function TableDialog({
  t,
  gridSize,
  setGridSize,
  tableSize,
  setTableSize,
  insertTable,
}: {
  t: Translate;
  gridSize: Size;
  setGridSize: SetState<Size>;
  tableSize: Size;
  setTableSize: SetState<Size>;
  insertTable: (rows?: number, cols?: number) => void;
}) {
  return (
    <>
      <div className="table-grid">
        {Array.from({ length: 64 }, (_, i) => (
          <button
            key={i}
            className={i % 8 < gridSize.cols && Math.floor(i / 8) < gridSize.rows ? 'filled' : ''}
            aria-label={`${(i % 8) + 1} ${t('columns')}, ${Math.floor(i / 8) + 1} ${t('rows')}`}
            onMouseEnter={() => setGridSize({ cols: (i % 8) + 1, rows: Math.floor(i / 8) + 1 })}
            onFocus={() => setGridSize({ cols: (i % 8) + 1, rows: Math.floor(i / 8) + 1 })}
            onClick={() => insertTable(Math.floor(i / 8) + 1, (i % 8) + 1)}
          />
        ))}
      </div>
      <p className="muted">
        {gridSize.cols || tableSize.cols} × {gridSize.rows || tableSize.rows} · {t('tableHint')}
      </p>
      <div className="form-row">
        <label>
          {t('columns')}
          <input
            autoFocus
            type="number"
            min="1"
            max="20"
            value={tableSize.cols}
            onChange={e => setTableSize({ ...tableSize, cols: Number(e.target.value) })}
          />
        </label>
        <label>
          {t('rows')}
          <input
            type="number"
            min="1"
            max="100"
            value={tableSize.rows}
            onChange={e => setTableSize({ ...tableSize, rows: Number(e.target.value) })}
          />
        </label>
      </div>
      <div className="modal-actions">
        <button className="primary-button" onClick={() => insertTable()}>
          {t('insert')}
        </button>
      </div>
    </>
  );
}

export function LinkDialog({
  t,
  linkData,
  setLinkData,
  insertLink,
}: {
  t: Translate;
  linkData: LinkData;
  setLinkData: SetState<LinkData>;
  insertLink: () => void;
}) {
  return (
    <>
      <label>
        {t('label')}
        <input
          autoFocus
          value={linkData.label}
          onChange={e => setLinkData({ ...linkData, label: e.target.value })}
        />
      </label>
      <label>
        {t('url')}
        <input
          value={linkData.url}
          placeholder="https://"
          onChange={e => setLinkData({ ...linkData, url: e.target.value })}
          onKeyDown={e => {
            if (e.key === 'Enter') insertLink();
          }}
        />
      </label>
      <div className="modal-actions">
        <button className="primary-button" onClick={insertLink}>
          {t('insert')}
        </button>
      </div>
    </>
  );
}

export function ImageDialog({
  t,
  imageData,
  setImageData,
  imageInput,
  insertImage,
}: {
  t: Translate;
  imageData: ImageFields;
  setImageData: SetState<ImageFields>;
  imageInput: React.RefObject<HTMLInputElement | null>;
  insertImage: () => void;
}) {
  return (
    <>
      <label>
        {t('alt')}
        <input
          autoFocus
          value={imageData.alt}
          onChange={e => setImageData({ ...imageData, alt: e.target.value })}
        />
      </label>
      <label>
        {t('url')}
        <input
          value={imageData.src}
          placeholder="https:// / assets/"
          onChange={e => setImageData({ ...imageData, src: e.target.value })}
        />
      </label>
      <button className="outline-button" onClick={() => imageInput.current?.click()}>
        <FolderOpen size={15} />
        {t('localImage')}
      </button>
      <p className="muted">{t('localImageHelp')}</p>
      <div className="modal-actions">
        <button className="primary-button" onClick={insertImage}>
          {t('insert')}
        </button>
      </div>
    </>
  );
}

export function CodeBlockDialog({
  t,
  codeData,
  setCodeData,
  insertCodeBlock,
}: {
  t: Translate;
  codeData: CodeData;
  setCodeData: SetState<CodeData>;
  insertCodeBlock: () => void;
}) {
  return (
    <>
      <label>
        {t('codeLanguage')}
        <input
          autoFocus
          value={codeData.lang}
          onChange={e => setCodeData({ ...codeData, lang: e.target.value })}
          placeholder="python, javascript, text…"
        />
      </label>
      <textarea
        className="code-input"
        value={codeData.text}
        rows={7}
        onChange={e => setCodeData({ ...codeData, text: e.target.value })}
      />
      <div className="modal-actions">
        <button className="primary-button" onClick={insertCodeBlock}>
          {t('insert')}
        </button>
      </div>
    </>
  );
}

export function ExportReportDialog({
  t,
  exportWarnings,
  setModal,
}: {
  t: Translate;
  exportWarnings: string[];
  setModal: (modal: string | null) => void;
}) {
  return (
    <>
      <p>{t('exportReady')}</p>
      <ul className="export-notes">
        {exportWarnings.map(note => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <div className="modal-actions">
        <button className="primary-button" onClick={() => setModal(null)}>
          {t('close')}
        </button>
      </div>
    </>
  );
}

export function StatsDialog({
  t,
  info,
  doc,
  settings,
}: {
  t: Translate;
  info: ReturnType<typeof stats>;
  doc: DocState;
  settings: Settings;
}) {
  return (
    <>
      <div className="statistics-grid">
        {[
          [info.words, 'words'],
          [info.chars, 'characters'],
          [info.headers, 'heading'],
          [info.tables, 'table'],
          [doc.comments.length, 'comments'],
          [blocksOf(doc.source).filter(b => b.protected).length, 'protectedCount'],
        ].map(([value, key]) => (
          <div key={key}>
            <strong>{Number(value).toLocaleString(settings.lang)}</strong>
            <span>{t(key as TranslationKey)}</span>
          </div>
        ))}
      </div>
      <p className="muted">
        {settings.lang === 'es'
          ? 'Se excluyen del conteo de palabras los bloques de código, HTML y definiciones de enlaces.'
          : 'Code blocks, HTML and link definitions are excluded from the word count.'}
      </p>
    </>
  );
}
