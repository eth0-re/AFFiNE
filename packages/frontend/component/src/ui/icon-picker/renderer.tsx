import type { ImgHTMLAttributes, ReactNode } from 'react';

import { AffineIconRenderer } from './renderer/affine-icon';
import { type IconData, IconType } from './type';

export const IconRenderer = ({
  data,
  fallback,
  className,
  style,
  width,
  height,
  ...props
}: {
  data?: IconData;
  fallback?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
}) => {
  if (!data) {
    return fallback ?? null;
  }

  if (data.type === IconType.Emoji && data.unicode) {
    return data.unicode;
  }
  if (data.type === IconType.AffineIcon && data.name) {
    return (
      <AffineIconRenderer
        name={data.name}
        color={data.color}
        width={width}
        height={height}
        className={className}
        style={style}
        {...(props as any)}
      />
    );
  }
  if (data.type === IconType.Blob && data.source) {
    return (
      <img
        src={data.source}
        alt="Custom icon"
        className={className}
        style={{
          width: width ?? '1em',
          height: height ?? '1em',
          objectFit: 'cover',
          borderRadius: '6px',
          display: 'inline-block',
          verticalAlign: 'middle',
          imageRendering: 'auto',
          ...style,
        }}
        {...(props as ImgHTMLAttributes<HTMLImageElement>)}
      />
    );
  }

  return fallback ?? null;
};
