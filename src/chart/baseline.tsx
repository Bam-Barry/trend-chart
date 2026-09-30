"use client";

import { chartCssVars, useChartStable } from "./chart-context";

/**
 * Local addition (not from the registry): the line the series rest on, and a
 * dot under each data point — the owner's reference, in place of the dashed
 * grid. Registered as clip-excluded in `chart-child-passthrough.ts`, like Grid,
 * so it stays put through the series reveal.
 */
export interface BaselineProps {
  /** Rule colour. Default: var(--chart-grid) */
  stroke?: string;
  /** Dot colour. Default: var(--chart-label) */
  dotFill?: string;
  /** Dot radius, px. Default: 2.5 */
  dotRadius?: number;
  /** Gap between the rule and the dots, px. Default: 14 */
  dotOffset?: number;
}

export function Baseline({
  stroke = chartCssVars.grid,
  dotFill = "var(--chart-label)",
  dotRadius = 2.5,
  dotOffset = 14,
}: BaselineProps) {
  const { data, xScale, xAccessor, innerWidth, innerHeight, margin } =
    useChartStable();
  return (
    <g pointerEvents="none">
      <line
        stroke={stroke}
        strokeWidth={1}
        x1={-margin.left}
        x2={innerWidth + margin.right}
        y1={innerHeight}
        y2={innerHeight}
      />
      {data.map((d, index) => {
        const x = xScale(xAccessor(d));
        if (x === undefined) return null;
        return (
          <circle
            cx={x}
            cy={innerHeight + dotOffset}
            fill={dotFill}
            // biome-ignore lint/suspicious/noArrayIndexKey: one dot per data point, order fixed
            key={index}
            r={dotRadius}
          />
        );
      })}
    </g>
  );
}

Baseline.displayName = "Baseline";

export default Baseline;
