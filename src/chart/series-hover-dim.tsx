"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useChartHover } from "./chart-context";
import { useChartLegendHover } from "./chart-legend-hover";

interface SeriesHoverDimProps {
  /** Skip the dim entirely. */
  enabled?: boolean;
  /** Opacity to fade to while the chart is being hovered. */
  dimOpacity?: number;
  /** Tween duration in seconds. */
  durationSec?: number;
  /** Series index for multi-series legend hover dimming. */
  seriesIndex?: number;
  /** Local edit: also drain the colour (grayscale) while dimmed. Default: false */
  desaturate?: boolean;
  /** Stable chart visuals — area fill, stroke line, dashed tail, etc. */
  children: ReactNode;
}

/**
 * Wraps stable series visuals with a hover-driven opacity animation.
 *
 * The wrapper subscribes to chart hover state internally so the parent (Area /
 * Line) can stay on the stable context slice. Children come in as a React prop:
 * because the parent is not re-rendering on hover, the children element
 * reference stays identical and React skips re-rendering them when this
 * wrapper re-renders. That keeps expensive subtrees (`SeriesDashTailOverlay`
 * and its `getPointAtLength` binary search) quiescent on cursor motion.
 */
export function SeriesHoverDim({
  enabled = true,
  dimOpacity = 0.5,
  durationSec = 0.4,
  seriesIndex,
  desaturate = false,
  children,
}: SeriesHoverDimProps) {
  const { tooltipData, selection } = useChartHover();
  const { hoveredIndex: legendHoveredIndex } = useChartLegendHover();
  const isChartHovering = tooltipData !== null || selection?.active === true;
  const isLegendDimmed =
    legendHoveredIndex !== null &&
    seriesIndex !== undefined &&
    legendHoveredIndex !== seriesIndex;
  const dimmed = enabled && (isChartHovering || isLegendDimmed);
  const opacity = dimmed ? dimOpacity : 1;
  if (desaturate) {
    // Local edit: grey the series out on hover. Plain style + CSS transition —
    // the target lands in the DOM at once and the browser eases to it.
    return (
      <g
        style={{
          opacity,
          filter: dimmed ? "grayscale(1)" : "none",
          transition: `opacity ${durationSec}s ease-in-out, filter ${durationSec}s ease-in-out`,
        }}
      >
        {children}
      </g>
    );
  }
  return (
    <motion.g
      animate={{ opacity }}
      initial={{ opacity: 1 }}
      transition={{ duration: durationSec, ease: "easeInOut" }}
    >
      {children}
    </motion.g>
  );
}

SeriesHoverDim.displayName = "SeriesHoverDim";

export default SeriesHoverDim;
