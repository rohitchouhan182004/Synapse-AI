import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface TwinNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  confidence: number;
  isBottleneck?: boolean;
  isCore?: boolean;
}

export interface TwinLink extends d3.SimulationLinkDatum<TwinNode> {
  source: string | TwinNode;
  target: string | TwinNode;
  relation: string;
}

interface DigitalTwinGraphProps {
  skillState: Record<string, { proficiency_score: number; confidence_score: number; evidence_count: number }>;
  bottlenecks?: Array<{ skill_slug: string; rationale: string }>;
  onSelectNode?: (node: TwinNode) => void;
  selectedNodeId?: string | null;
}

export const DigitalTwinGraph: React.FC<DigitalTwinGraphProps> = ({
  skillState,
  bottlenecks = [],
  onSelectNode,
  selectedNodeId,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);

  const bottleneckSlugs = new Set(bottlenecks.map((b) => b.skill_slug));

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 550;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // 1. Build Nodes
    const rawNodes: TwinNode[] = [
      { id: 'core-student', name: 'STUDENT CORE', category: 'Core', proficiency: 100, confidence: 100, isCore: true },
      { id: 'programming-fundamentals', name: 'Fundamentals', category: 'Basics', proficiency: 85, confidence: 90 },
      { id: 'java', name: 'Java', category: 'Programming', proficiency: skillState['java']?.proficiency_score ?? 82, confidence: skillState['java']?.confidence_score ?? 88 },
      { id: 'python', name: 'Python', category: 'Programming', proficiency: skillState['python']?.proficiency_score ?? 65, confidence: skillState['python']?.confidence_score ?? 70 },
      { id: 'oop', name: 'OOP', category: 'Software Eng', proficiency: skillState['oop']?.proficiency_score ?? 78, confidence: skillState['oop']?.confidence_score ?? 84 },
      { id: 'dsa', name: 'DSA', category: 'Algorithms', proficiency: skillState['dsa']?.proficiency_score ?? 42, confidence: skillState['dsa']?.confidence_score ?? 75 },
      { id: 'recursion', name: 'Recursion', category: 'Algorithms', proficiency: skillState['recursion']?.proficiency_score ?? 48, confidence: skillState['recursion']?.confidence_score ?? 65 },
      { id: 'trees', name: 'Trees & BST', category: 'Data Structures', proficiency: skillState['trees']?.proficiency_score ?? 31, confidence: skillState['trees']?.confidence_score ?? 70, isBottleneck: bottleneckSlugs.has('trees') },
      { id: 'graphs', name: 'Graphs', category: 'Data Structures', proficiency: skillState['graphs']?.proficiency_score ?? 28, confidence: skillState['graphs']?.confidence_score ?? 68 },
      { id: 'dynamic-programming', name: 'DP', category: 'Algorithms', proficiency: skillState['dynamic-programming']?.proficiency_score ?? 24, confidence: skillState['dynamic-programming']?.confidence_score ?? 65 },
      { id: 'sql', name: 'SQL & DB', category: 'Databases', proficiency: skillState['sql']?.proficiency_score ?? 74, confidence: skillState['sql']?.confidence_score ?? 80 },
      { id: 'db-optimization', name: 'Indexing', category: 'Databases', proficiency: skillState['db-optimization']?.proficiency_score ?? 50, confidence: skillState['db-optimization']?.confidence_score ?? 50 },
      { id: 'api-development', name: 'REST APIs', category: 'Web', proficiency: skillState['api-development']?.proficiency_score ?? 72, confidence: skillState['api-development']?.confidence_score ?? 78 },
      { id: 'system-design', name: 'System Design', category: 'Architecture', proficiency: skillState['system-design']?.proficiency_score ?? 35, confidence: skillState['system-design']?.confidence_score ?? 20 },
      { id: 'communication', name: 'Communication', category: 'Interviews', proficiency: skillState['communication']?.proficiency_score ?? 76, confidence: skillState['communication']?.confidence_score ?? 80 },
    ];

    // 2. Build Links
    const rawLinks: TwinLink[] = [
      { source: 'core-student', target: 'programming-fundamentals', relation: 'core' },
      { source: 'core-student', target: 'dsa', relation: 'core' },
      { source: 'core-student', target: 'sql', relation: 'core' },
      { source: 'core-student', target: 'communication', relation: 'core' },
      { source: 'programming-fundamentals', target: 'java', relation: 'syntax' },
      { source: 'programming-fundamentals', target: 'python', relation: 'syntax' },
      { source: 'programming-fundamentals', target: 'oop', relation: 'concept' },
      { source: 'oop', target: 'api-development', relation: 'architecture' },
      { source: 'api-development', target: 'system-design', relation: 'scale' },
      { source: 'dsa', target: 'recursion', relation: 'prerequisite' },
      { source: 'recursion', target: 'trees', relation: 'prerequisite' },
      { source: 'trees', target: 'graphs', relation: 'prerequisite' },
      { source: 'recursion', target: 'dynamic-programming', relation: 'prerequisite' },
      { source: 'dsa', target: 'dynamic-programming', relation: 'prerequisite' },
      { source: 'sql', target: 'db-optimization', relation: 'prerequisite' },
      { source: 'sql', target: 'system-design', relation: 'storage' },
    ];

    const g = svg.append('g').attr('class', 'main-group');

    // Zoom setup
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomTransform(event.transform);
      });

    svg.call(zoom);

    // Force simulation
    const simulation = d3
      .forceSimulation<TwinNode>(rawNodes)
      .force(
        'link',
        d3
          .forceLink<TwinNode, TwinLink>(rawLinks)
          .id((d) => d.id)
          .distance((d) => (d.relation === 'core' ? 90 : 75))
      )
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => (d.isCore ? 40 : 32)));

    // Render links
    const link = g
      .append('g')
      .selectAll('line')
      .data(rawLinks)
      .enter()
      .append('line')
      .attr('stroke', (d: any) => {
        if (d.source.id === 'trees' || d.target.id === 'trees') {
          return '#EF4444'; // Highlight bottleneck edge in red
        }
        return '#233042';
      })
      .attr('stroke-width', (d: any) => {
        if (d.source.id === 'trees' || d.target.id === 'trees') return 2;
        return 1.2;
      })
      .attr('stroke-dasharray', (d: any) => {
        if (d.source.id === 'trees' || d.target.id === 'trees') return '4 3';
        return 'none';
      })
      .attr('stroke-opacity', 0.7);

    // Render nodes
    const node = g
      .append('g')
      .selectAll('g')
      .data(rawNodes)
      .enter()
      .append('g')
      .attr('class', 'cursor-pointer')
      .on('click', (_, d) => {
        if (onSelectNode) onSelectNode(d);
      })
      .call(
        d3
          .drag<SVGGElement, TwinNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Outer Halo / Confidence Rings
    node
      .append('circle')
      .attr('r', (d) => (d.isCore ? 28 : 22))
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d.isCore) return '#B4F342';
        if (d.isBottleneck) return '#EF4444';
        if (d.proficiency >= 75) return '#B4F342';
        if (d.proficiency >= 50) return '#06B6D4';
        return '#F59E0B';
      })
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d) => (d.confidence < 60 ? '3 3' : 'none'))
      .attr('opacity', (d) => (d.id === selectedNodeId ? 1 : 0.6));

    // Inner Body Circle
    node
      .append('circle')
      .attr('r', (d) => (d.isCore ? 20 : 16))
      .attr('fill', (d) => {
        if (d.isCore) return '#0F141C';
        if (d.isBottleneck) return 'rgba(239, 68, 68, 0.25)';
        if (d.proficiency >= 75) return 'rgba(180, 243, 66, 0.2)';
        if (d.proficiency >= 50) return 'rgba(6, 182, 212, 0.2)';
        return 'rgba(245, 158, 11, 0.2)';
      })
      .attr('stroke', (d) => (d.id === selectedNodeId ? '#FFFFFF' : '#233042'))
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 2 : 1));

    // Score Text inside node
    node
      .append('text')
      .text((d) => (d.isCore ? 'CORE' : `${Math.round(d.proficiency)}`))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', (d) => (d.isCore ? '8px' : '10px'))
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '600')
      .attr('fill', (d) => {
        if (d.isCore) return '#B4F342';
        if (d.isBottleneck) return '#EF4444';
        if (d.proficiency >= 75) return '#B4F342';
        if (d.proficiency >= 50) return '#06B6D4';
        return '#F59E0B';
      });

    // Label under node
    node
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.isCore ? '36px' : '30px'))
      .attr('font-size', '10px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', (d) => (d.id === selectedNodeId ? '700' : '500'))
      .attr('fill', (d) => (d.id === selectedNodeId ? '#FFFFFF' : '#94A3B8'));

    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [skillState, bottlenecks, selectedNodeId]);

  return (
    <div ref={containerRef} className="relative w-full h-[550px] bg-synapse-surface/60 rounded-2xl border border-synapse-border circuit-grid overflow-hidden">
      {/* Legend & Telemetry Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 text-[10px] font-mono pointer-events-none">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-synapse-bg/80 border border-synapse-border text-synapse-lime">
          <div className="w-2 h-2 rounded-full bg-synapse-lime" />
          <span>Verified (&gt;=75)</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-synapse-bg/80 border border-synapse-border text-synapse-cyan">
          <div className="w-2 h-2 rounded-full bg-synapse-cyan" />
          <span>Developing (50-74)</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-synapse-bg/80 border border-synapse-border text-synapse-crimson">
          <AlertTriangle className="w-3 h-3 text-synapse-crimson" />
          <span>Bottleneck Vector</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-synapse-bg/80 border border-synapse-border text-synapse-amber">
          <span className="w-2 h-2 border border-dashed border-synapse-amber rounded-full" />
          <span>Uncertain (Low Conf)</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 text-[11px] font-mono text-synapse-subtle pointer-events-none">
        Drag nodes • Scroll to Zoom • Click node for evidence provenance
      </div>

      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
