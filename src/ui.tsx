import type React from 'react';

// Small presentational building blocks shared by the document editor ribbon and dialogs.

export const dateLabel = (date: string, lang: string) =>
  new Date(date).toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export function Button({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
  compact = false,
  title,
  className = '',
}: {
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  compact?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <button
      className={`tool-button ${compact ? 'compact' : ''} ${active ? 'selected' : ''} ${className}`}
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
    >
      {Icon && <Icon size={17} strokeWidth={1.7} />}
      {!compact && <span>{label}</span>}
    </button>
  );
}
export function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ribbon-group">
      <div className="group-controls">{children}</div>
      <div className="group-label">{label}</div>
    </div>
  );
}
