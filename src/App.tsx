import { useMemo, useState } from 'react';
import { curveLinear, curveMonotoneX, curveNatural, curveStepAfter } from '@visx/curve';
import { DialRoot, useDialKit } from 'dialkit';
import 'dialkit/styles.css';
import AreaChart, { Area } from '@/chart/area-chart';
import AreaChartLoading from '@/chart/area-chart-loading';
import Baseline from '@/chart/baseline';
import Grid from '@/chart/grid';
import { ChartTooltip } from '@/chart/tooltip';
import { TooltipContent } from '@/chart/tooltip/tooltip-content';
import styles from './App.module.css';

/**
 * The trend chart on its own, with a DialKit panel to tune it live. Standalone
 * extract of Nuvora's Overview chart (the bklit kit in ./chart, with local
 * edits noted in each file).
 *
 * Sales only, this week by default, on its own up-and-down series (the
 * Overview's fixtures rise too smoothly to show the chart off). Everything the
 * chart does is on the panel: range, how many points and how much they swing,
 * line colours / width / curve, the hover tint and decolour, grid, baseline,
 * edge fade, the loading state, and a replay of the entrance reveal.
 */

const CURVES = {
  natural: curveNatural,
  monotone: curveMonotoneX,
  linear: curveLinear,
  step: curveStepAfter,
} as const;

/** The fixture's day — the week ends on it, the hours hang off it. */
const TODAY = new Date(2026, 8, 30);

/** Small seeded PRNG, so the series is the same on every load. */
function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * This period against the one before, swinging up and down: a wave plus a
 * little noise, scaled by `swing`. Sales in whole dollars.
 */
function makeSeries(range: 'week' | 'day', count: number, swing: number) {
  const rand = seeded(7);
  const base = range === 'week' ? 48000 : 5200;
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(TODAY);
    if (range === 'week') date.setDate(TODAY.getDate() - (count - 1 - i));
    else date.setHours(9 + i, 0, 0, 0);
    const wave = Math.sin(i * 1.35 + 0.4) * 0.65 + (rand() - 0.5) * 0.7;
    const past = Math.sin(i * 1.35 - 0.7) * 0.55 + (rand() - 0.5) * 0.7;
    return {
      date,
      current: Math.round(base * (1 + swing * wave)),
      previous: Math.round(base * 0.9 * (1 + swing * past)),
    };
  });
}

const money = (dollars: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(dollars);
const hourFmt = (date: Date) => `${String(date.getHours()).padStart(2, '0')}:00`;
const dayFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

export function App() {
  const [take, setTake] = useState(0);

  const dial = useDialKit(
    'Trend chart',
    {
      range: {
        type: 'select',
        options: [
          { value: 'week', label: 'This week' },
          { value: 'day', label: 'Today' },
        ],
        default: 'week',
      },
      points: [7, 5, 24, 1],
      swing: [0.35, 0, 0.8, 0.05],
      lines: {
        current: { type: 'color', default: '#335cff' },
        previous: { type: 'color', default: '#00a39b' },
        width: [2, 1, 4, 0.5],
        curve: {
          type: 'select',
          options: ['natural', 'monotone', 'linear', 'step'],
          default: 'natural',
        },
      },
      hover: {
        decolour: true,
        tint: [0.25, 0, 0.6, 0.05],
        dim: [0.5, 0.1, 1, 0.05],
      },
      chrome: {
        grid: true,
        baseline: true,
        fadeEdges: true,
      },
      loading: false,
      replay: { type: 'action', label: 'Replay reveal' },
    },
    { onAction: (action) => action === 'replay' && setTake((n) => n + 1) },
  );

  const range = dial.range as 'week' | 'day';
  const data = useMemo(
    () => makeSeries(range, dial.points, dial.swing),
    [range, dial.points, dial.swing],
  );
  const labels =
    range === 'week'
      ? {
          current: 'This week',
          previous: 'Week before',
          title: 'Sales, this week against the last.',
        }
      : {
          current: 'Today',
          previous: 'Yesterday',
          title: 'Sales, today against yesterday.',
        };
  const curve = CURVES[dial.lines.curve as keyof typeof CURVES];
  const margin = { top: 16, right: 24, bottom: 40, left: 24 };

  return (
    <main className={styles.stage}>
      <div className={styles.frame}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Trend chart</p>
          <h1 className={styles.title}>{labels.title}</h1>
        </header>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Sales</h2>

          <div className={styles.plot}>
            {dial.loading ? (
              <AreaChartLoading margin={margin} />
            ) : (
              <AreaChart
                // Remount on replay and whenever the shape of the series changes,
                // so the reveal plays rather than a morph.
                key={`${take}-${range}-${dial.points}-${dial.lines.curve}`}
                data={data}
                margin={margin}
                labelFormat={range === 'day' ? (d) => `Today ${hourFmt(d)}` : undefined}
              >
                {dial.chrome.grid && (
                  <Grid
                    horizontal
                    numTicksRows={4}
                    stroke="var(--color-text-faint)"
                    strokeOpacity={0.6}
                    strokeDasharray="2 4"
                  />
                )}
                {dial.chrome.baseline && <Baseline />}
                <Area
                  dataKey="previous"
                  fill={dial.lines.previous}
                  stroke={dial.lines.previous}
                  strokeWidth={dial.lines.width}
                  curve={curve}
                  fadeEdges={dial.chrome.fadeEdges}
                  fillOpacity={dial.hover.tint * 0.8}
                  decolorOnHover={dial.hover.decolour}
                  dimOpacity={dial.hover.dim}
                />
                <Area
                  dataKey="current"
                  fill={dial.lines.current}
                  stroke={dial.lines.current}
                  strokeWidth={dial.lines.width}
                  curve={curve}
                  fadeEdges={dial.chrome.fadeEdges}
                  fillOpacity={dial.hover.tint}
                  decolorOnHover={dial.hover.decolour}
                  dimOpacity={dial.hover.dim}
                />
                <ChartTooltip
                  content={({ point }) => (
                    <TooltipContent
                      title={
                        range === 'day'
                          ? hourFmt(point.date as Date)
                          : dayFmt.format(point.date as Date)
                      }
                      rows={[
                        {
                          label: labels.current,
                          value: money(point.current as number),
                          color: dial.lines.current,
                        },
                        {
                          label: labels.previous,
                          value: money(point.previous as number),
                          color: dial.lines.previous,
                        },
                      ]}
                    />
                  )}
                />
              </AreaChart>
            )}
          </div>

          <div className={styles.legend}>
            <span className={styles.key}>
              <i className={styles.line} style={{ background: dial.lines.current }} />
              {labels.current}
            </span>
            <span className={styles.key}>
              <i className={styles.line} style={{ background: dial.lines.previous }} />
              {labels.previous}
            </span>
          </div>
        </section>
      </div>

      {/* productionEnabled: the panel is the point of the hosted demo. */}
      <DialRoot position="top-right" defaultOpen productionEnabled />
    </main>
  );
}
