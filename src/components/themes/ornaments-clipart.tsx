"use client";

import { ORNAMENT_SVGS } from "./generated-ornaments";

/**
 * Render ornamen SVG hasil unggahan (CC0) dengan warna mengikuti palet tema.
 * SVG memakai fill/stroke "currentColor" — cukup atur CSS color pada wrapper.
 */
export function ClipArt({
  name,
  className = "",
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const svg = ORNAMENT_SVGS[name];
  if (!svg) return null;
  return (
    <span
      aria-hidden
      className={`clipart pointer-events-none select-none ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
