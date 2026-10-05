import type React from 'react';
import type { Settings, Mode } from './core';
import { es, en, type TranslationKey } from './i18n';
export function SettingsPanel({
  settings,
  setSettings,
  onRecent,
  onClearDrafts,
}: {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  onRecent: () => void;
  onClearDrafts: () => void;
}) {
  const t = (key: TranslationKey) => (settings.lang === 'en' ? en : es)[key] || key;
  function changeSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }
  return (
    <div className="settings-content">
      <section>
        <h3>{t('general')}</h3>
        <label>
          {t('language')}
          <select
            autoFocus
            value={settings.lang}
            onChange={e => changeSetting('lang', e.target.value as 'es' | 'en')}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          {t('author')}
          <input
            value={settings.author}
            maxLength={80}
            placeholder={t('anonymous')}
            onChange={e => changeSetting('author', e.target.value)}
          />
        </label>
        <label>
          {t('initialMode')}
          <select
            value={settings.initialMode}
            onChange={e => changeSetting('initialMode', e.target.value as Mode)}
          >
            {(['visual', 'code', 'split', 'read'] as Mode[]).map(m => (
              <option key={m} value={m}>
                {t(m)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {settings.lang === 'es' ? 'Modo de vista dividida' : 'Split view mode'}
          <select
            aria-label={settings.lang === 'es' ? 'Modo de vista dividida' : 'Split view mode'}
            value={settings.splitMode}
            onChange={e => changeSetting('splitMode', e.target.value as Settings['splitMode'])}
          >
            <option value="editable">
              {settings.lang === 'es' ? 'Código + visual editable' : 'Code + editable visual'}
            </option>
            <option value="preview">{settings.lang === 'es' ? 'Código + lectura' : 'Code + reading'}</option>
          </select>
        </label>
        <label className="settings-toggle">
          {t('autoClose')}
          <input
            type="checkbox"
            checked={settings.autoClose}
            onChange={e => changeSetting('autoClose', e.target.checked)}
          />
        </label>
        <p className="muted">{t('autoCloseHelp')}</p>
        <p>
          {settings.lang === 'es'
            ? 'Código + visual editable es la opción predeterminada. Los cambios se reflejan inmediatamente en ambas vistas. Cada panel tiene su propio scroll; un clic desplaza el otro al mismo fragmento. La barra de herramientas actúa sobre el panel en el que estás editando.'
            : 'Code + editable visual is the default. Changes appear immediately in both views. Each pane scrolls independently; clicking scrolls the other to the same passage. The toolbar acts on the pane where you are editing.'}
        </p>
      </section>
      <section>
        <h3>{t('appearance')}</h3>
        <label>
          {t('fontSize')}
          <input
            type="number"
            min="12"
            max="28"
            value={settings.fontSize}
            onChange={e => changeSetting('fontSize', Math.min(28, Math.max(12, Number(e.target.value))))}
          />
        </label>
        <label>
          {t('lineHeight')}
          <input
            type="number"
            min="1.2"
            max="2.5"
            step="0.1"
            value={settings.lineHeight}
            onChange={e => changeSetting('lineHeight', Math.min(2.5, Math.max(1.2, Number(e.target.value))))}
          />
        </label>
        <label>
          {t('width')}
          <select value={settings.width} onChange={e => changeSetting('width', Number(e.target.value))}>
            <option value="680">680 px</option>
            <option value="810">810 px</option>
            <option value="1000">1000 px</option>
          </select>
        </label>
        {(['serif', 'bubble'] as const).map(key => (
          <label className="settings-toggle" key={key}>
            {t(key)}
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={e => changeSetting(key, e.target.checked)}
            />
          </label>
        ))}
      </section>
      <section>
        <h3>{t('code')}</h3>
        {(['lineNumbers', 'wrap'] as const).map(key => (
          <label className="settings-toggle" key={key}>
            {t(key)}
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={e => changeSetting(key, e.target.checked)}
            />
          </label>
        ))}
      </section>
      <section>
        <h3>{t('save')}</h3>
        <label className="settings-toggle">
          {t('recovery')}
          <input
            type="checkbox"
            checked={settings.recovery}
            onChange={e => changeSetting('recovery', e.target.checked)}
          />
        </label>
        <p>{t('recoveryHelp')}</p>
        <label className="settings-toggle">
          {t('remote')}
          <input
            type="checkbox"
            checked={settings.remoteImages}
            onChange={e => changeSetting('remoteImages', e.target.checked)}
          />
        </label>
        <p>{t('remoteHelp')}</p>
      </section>
      <section>
        <h3>{t('data')}</h3>
        <button className="outline-button" onClick={onRecent}>
          {t('recent')}
        </button>
        <button className="text-button danger" onClick={onClearDrafts}>
          {t('clearDrafts')}
        </button>
        <p>{t('about')}</p>
      </section>
    </div>
  );
}
