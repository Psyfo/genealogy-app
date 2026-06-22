'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GraphData, GraphLink, GraphNode } from '@/types/graph';
import type {
  ForceGraphMethods,
  NodeObject,
} from 'react-force-graph-2d';

type ForceGraphComponent = typeof import('react-force-graph-2d')['default'];

const GEN_COLORS = ['#1f44c2', '#df3b2c', '#1b8f5d', '#c3338a', '#f3b324', '#6fb1da'];
const INK = '#15110d';
const PAPER = '#fffdf8';
const X_GAP = 90;
const GEN_GAP = 120;

type PositionedNode = GraphNode & { x: number; y: number; fx: number; fy: number };

function colorFor(generation: number): string {
  return GEN_COLORS[generation % GEN_COLORS.length];
}

/**
 * Deterministic layered layout: nodes sit in horizontal generation bands, and
 * within each band are ordered by the average x of their parents (a barycentre
 * sweep) to keep families together and reduce edge crossings. Positions are
 * pinned (fx/fy) so the diagram is stable rather than a drifting force cloud.
 */
function layout(data: GraphData): PositionedNode[] {
  const parentsOf = new Map<string, string[]>();
  const spousesOf = new Map<string, string[]>();
  for (const link of data.links) {
    if (link.type === 'PARENT_OF') {
      const list = parentsOf.get(link.target) ?? [];
      list.push(link.source);
      parentsOf.set(link.target, list);
    } else if (link.type === 'MARRIED_TO') {
      for (const [a, b] of [[link.source, link.target], [link.target, link.source]]) {
        const list = spousesOf.get(a) ?? [];
        list.push(b);
        spousesOf.set(a, list);
      }
    }
  }

  const byGen = new Map<number, GraphNode[]>();
  for (const node of data.nodes) {
    const list = byGen.get(node.generation) ?? [];
    list.push(node);
    byGen.set(node.generation, list);
  }

  const xOf = new Map<string, number>();
  const positioned: PositionedNode[] = [];
  const generations = [...byGen.keys()].sort((a, b) => a - b);

  for (const generation of generations) {
    const nodes = byGen.get(generation) ?? [];
    const inBand = new Map(nodes.map((node) => [node.id, node]));
    const candidates = [...nodes].sort((a, b) => {
      const ax = barycentre(a.id, parentsOf, spousesOf, xOf);
      const bx = barycentre(b.id, parentsOf, spousesOf, xOf);
      if (ax !== bx) return ax - bx;
      return (a.birthYear ?? 0) - (b.birthYear ?? 0) || a.name.localeCompare(b.name);
    });

    // Emit each person, then any same-band spouse right after, so couples stay
    // adjacent and marriage lines stay short.
    const ordered: GraphNode[] = [];
    const seen = new Set<string>();
    for (const node of candidates) {
      if (seen.has(node.id)) continue;
      ordered.push(node);
      seen.add(node.id);
      for (const spouseId of spousesOf.get(node.id) ?? []) {
        const spouse = inBand.get(spouseId);
        if (spouse && !seen.has(spouseId)) {
          ordered.push(spouse);
          seen.add(spouseId);
        }
      }
    }

    ordered.forEach((node, index) => {
      const x = (index - (ordered.length - 1) / 2) * X_GAP;
      const y = generation * GEN_GAP;
      xOf.set(node.id, x);
      positioned.push({ ...node, x, y, fx: x, fy: y });
    });
  }

  return positioned;
}

/** Average x of a node's parents, or — for those who married in — of a spouse's parents. */
function barycentre(
  id: string,
  parentsOf: Map<string, string[]>,
  spousesOf: Map<string, string[]>,
  xOf: Map<string, number>,
): number {
  const known = (parentsOf.get(id) ?? [])
    .map((p) => xOf.get(p))
    .filter((v): v is number => v !== undefined);
  if (known.length > 0) {
    return known.reduce((sum, v) => sum + v, 0) / known.length;
  }
  const viaSpouse = (spousesOf.get(id) ?? [])
    .flatMap((s) => parentsOf.get(s) ?? [])
    .map((p) => xOf.get(p))
    .filter((v): v is number => v !== undefined);
  if (viaSpouse.length > 0) {
    return viaSpouse.reduce((sum, v) => sum + v, 0) / viaSpouse.length;
  }
  return 0;
}

export function FamilyGraph({ data }: { data: GraphData }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const fittedRef = useRef(false);
  const [Graph, setGraph] = useState<ForceGraphComponent | null>(null);
  const [size, setSize] = useState({ width: 800, height: 560 });
  const [selected, setSelected] = useState<GraphNode | null>(null);

  const graphData = useMemo(
    () => ({ nodes: layout(data), links: data.links.map((link) => ({ ...link })) }),
    [data],
  );

  // Load the (browser-only) force graph after mount so we get a real ref.
  useEffect(() => {
    let active = true;
    void import('react-force-graph-2d').then((mod) => {
      if (active) setGraph(() => mod.default);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setSize({ width: rect.width, height: rect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-[72vh] min-h-[480px] w-full overflow-hidden rounded-lg border-2 border-ink bg-bone shadow-block"
    >
      {Graph && (
        <Graph
          ref={fgRef}
          graphData={graphData}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          nodeId="id"
          cooldownTicks={60}
          warmupTicks={20}
          onEngineStop={() => {
            if (!fittedRef.current) {
              fittedRef.current = true;
              fgRef.current?.zoomToFit(400, 60);
            }
          }}
          linkColor={(link) => ((link as GraphLink).type === 'MARRIED_TO' ? '#c3338a' : INK)}
          linkWidth={(link) => ((link as GraphLink).type === 'MARRIED_TO' ? 1.5 : 2)}
          linkLineDash={(link) => ((link as GraphLink).type === 'MARRIED_TO' ? [5, 4] : null)}
          linkDirectionalArrowLength={(link) =>
            (link as GraphLink).type === 'PARENT_OF' ? 4 : 0
          }
          linkDirectionalArrowRelPos={0.92}
          onNodeClick={(node: NodeObject) => setSelected(node as PositionedNode)}
          onBackgroundClick={() => setSelected(null)}
          nodePointerAreaPaint={(node: NodeObject, color, ctx) => {
            const n = node as PositionedNode;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(n.x, n.y, 10, 0, 2 * Math.PI);
            ctx.fill();
          }}
          nodeCanvasObject={(node: NodeObject, ctx, globalScale) => {
            const n = node as PositionedNode;
            const color = colorFor(n.generation);
            const radius = 6;
            const isSelected = selected?.id === n.id;

            if (isSelected) {
              ctx.beginPath();
              ctx.arc(n.x, n.y, radius + 3.5, 0, 2 * Math.PI);
              ctx.strokeStyle = '#1f44c2';
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = n.living ? color : PAPER;
            ctx.fill();
            ctx.lineWidth = (n.living ? 1.5 : 2.5) / globalScale;
            ctx.strokeStyle = n.living ? INK : color;
            ctx.stroke();

            const label = n.name.split(' ')[0];
            const fontSize = Math.max(11 / globalScale, 3);
            ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.lineWidth = 3 / globalScale;
            ctx.strokeStyle = 'rgba(245,239,226,0.95)';
            ctx.strokeText(label, n.x, n.y + radius + 2.5);
            ctx.fillStyle = INK;
            ctx.fillText(label, n.x, n.y + radius + 2.5);
          }}
        />
      )}

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1.5 rounded-sm border-2 border-ink bg-paper/90 px-3 py-2 text-xs shadow-block-sm backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-0 w-5 border-b-2 border-ink" />
          <span>Parent → child</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-0 w-5 border-b-2 border-dashed border-magenta" />
          <span>Marriage</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block size-3 rounded-full border-2 border-ink bg-cobalt" />
          <span>Living</span>
          <span className="ml-1 inline-block size-3 rounded-full border-2 border-cobalt bg-paper" />
          <span>In memory</span>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="absolute right-3 top-3 w-60 rounded-sm border-2 border-ink bg-paper p-4 shadow-block">
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Close"
            className="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-sand hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
          <p className="pr-6 font-display text-lg font-bold leading-tight">{selected.name}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="neutral" className="font-mono tabular-nums">
              {selected.birthYear ?? '—'}
              {selected.deathYear ? `–${selected.deathYear}` : selected.living ? '–' : ''}
            </Badge>
            <Badge tone="cobalt">Generation {selected.generation + 1}</Badge>
          </div>
          <Link
            href={`/people/${selected.id}`}
            className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'mt-3 w-full')}
          >
            View profile
          </Link>
        </div>
      )}
    </div>
  );
}
