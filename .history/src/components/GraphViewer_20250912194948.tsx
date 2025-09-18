'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d'),
  { 
    ssr: false,
    loading: () => <div className="loading-graph">Loading graph...</div>
  }
) as React.ComponentType<any>;

interface GraphNode {
  id: string;
  name: string;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface ForceGraphMethods {
  canvas?: () => HTMLCanvasElement;
}

export default function GraphViewer() {
  const [data, setData] = useState<GraphData | null>(null);
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [isClient, setIsClient] = useState(false);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);

  useEffect(() => {
    // Set client-side flag
    setIsClient(true);
    
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/graph');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const graphData: GraphData = await res.json();
        if (!cancelled) setData(graphData);
      } catch (e) {
        console.error('[GraphViewer] fetch error', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getCanvas = (): HTMLCanvasElement | undefined => {
    const maybe = fgRef.current as unknown as {
      canvas?: () => HTMLCanvasElement;
    };
    return maybe?.canvas?.();
  };

  const setCursor = (value: string) => {
    const canvas = getCanvas();
    (canvas ?? document.body).style.cursor = value;
  };

  const colorFor = (id: string): string => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    const hue = h % 360;
    return `hsl(${hue} 65% 55%)`;
  };

  const nodePaint = (
    node: GraphNode & { x?: number; y?: number },
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
    const fontSize = 12 / globalScale;
    const x = (node as { x?: number }).x ?? 0;
    const y = (node as { y?: number }).y ?? 0;
    const radius = hoverNode === node ? 8 : 5;

    // Node circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = colorFor(node.id);
    ctx.fill();
    if (hoverNode === node) {
      ctx.lineWidth = 2 / globalScale;
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();
    }

    // Label pill
    const label = node.name;
    ctx.font = `${fontSize}px Inter, Sans-Serif`;
    const padding = 4 / globalScale;
    const metrics = ctx.measureText(label);
    const textW = metrics.width + padding * 2;
    const textH = fontSize + padding * 2;
    const rectX = x + radius + 6 / globalScale;
    const rectY = y - textH / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(rectX, rectY, textW, textH, 4 / globalScale);
      ctx.fill();
    } else {
      ctx.fillRect(rectX, rectY, textW, textH);
    }

    ctx.fillStyle = '#0f172a';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, rectX + padding, y);
  };

  // Don't render on server-side
  if (!isClient) {
    return (
      <div className="loading-graph">
        <div className="loading-spinner"></div>
        <p>Loading graph...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loading-graph">
        <div className="loading-spinner"></div>
        <p>Loading graph data...</p>
      </div>
    );
  }

  return (
    <div className="graph-container">
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        backgroundColor="#0f172a"
        nodeId="id"
        nodeLabel="name"
        linkLabel="type"
        linkColor={(l: GraphLink) =>
          hoverNode && (l.source === hoverNode || l.target === hoverNode)
            ? "#f59e0b"
            : "#64748b"
        }
        linkWidth={(l: GraphLink) =>
          hoverNode && (l.source === hoverNode || l.target === hoverNode)
            ? 2.5
            : 1
        }
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={0.95}
        onNodeHover={(node: GraphNode | null) => {
          setHoverNode(node);
          setCursor(node ? "pointer" : "default");
        }}
        nodeCanvasObject={nodePaint}
        nodePointerAreaPaint={(node: GraphNode & { x?: number; y?: number }, color: string, ctx: CanvasRenderingContext2D) => {
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.fill();
        }}
        height={600}
        width={1000}
      />
      
      <style jsx>{`
        .graph-container {
          border-radius: 12px;
          border: 2px solid rgba(166, 94, 58, 0.2);
          background: rgba(166, 94, 58, 0.05);
          padding: 1rem;
          box-shadow: 0 4px 6px rgba(166, 94, 58, 0.1);
        }

        .loading-graph {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: #a65e3a;
          text-align: center;
        }

        .loading-spinner {
          width: 2rem;
          height: 2rem;
          border: 3px solid rgba(166, 94, 58, 0.2);
          border-top: 3px solid #a65e3a;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-graph p {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
