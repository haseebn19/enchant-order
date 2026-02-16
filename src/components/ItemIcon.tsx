import { useState } from 'react';
import { getItemIconUrl, getItemIconFallbackUrl } from '../data/itemIcons';

interface ItemIconProps {
  namespace: string;
  label: string;
  size?: number;
  className?: string;
}

export function ItemIcon({ namespace, label, size = 24, className = '' }: ItemIconProps) {
  const localUrl = getItemIconUrl(namespace);
  const fallbackUrl = getItemIconFallbackUrl(namespace);
  const [src, setSrc] = useState(localUrl);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`item-icon-fallback ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.5) }}
        title={label}
      >
        {label.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={`item-icon-img ${className}`}
      width={size}
      height={size}
      loading="lazy"
      onError={() => {
        if (fallbackUrl && src === localUrl) {
          setSrc(fallbackUrl);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
