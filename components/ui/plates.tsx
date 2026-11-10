import type { ReactNode } from "react";
import type { PlateId } from "@/lib/content/editorial";

/**
 * Scientific figure plates, drawn in code so they stay crisp, light, and on brand.
 * They are schematic illustrations, not data: nothing here encodes a real recording or scan.
 * Strokes use currentColor (navy on light plates) with a single orange accent.
 */
const ORANGE = "#FC6A01";
const round = (n: number) => Math.round(n * 10) / 10;

/** Small deterministic generator so server and client draw identical figures. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function InterfacePlate() {
  const active = new Set(["2-1", "3-1", "3-2", "4-2", "5-3", "2-3"]);
  const dots: ReactNode[] = [];
  const leads: ReactNode[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 8; c++) {
      const x = 70 + c * 30;
      const y = 60 + r * 30;
      const on = active.has(`${c}-${r}`);
      dots.push(
        <circle key={`${c}-${r}`} cx={x} cy={y} r={on ? 6 : 4} fill={on ? ORANGE : "none"} stroke={on ? ORANGE : "currentColor"} strokeWidth="1.5" />,
      );
    }
    const y = 60 + r * 30;
    leads.push(<path key={r} d={`M294 ${y} H318 Q338 ${y} 338 ${round(y + (135 - y) * 0.5)} V${126 + r * 4} H356`} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />);
  }
  return (
    <>
      <rect x="48" y="38" width="254" height="194" rx="16" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      {leads}
      {dots}
      <rect x="356" y="118" width="16" height="36" rx="4" fill="currentColor" />
      <path d="M48 256 H302" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <path d="M48 251 V261 M302 251 V261" stroke="currentColor" strokeWidth="1" opacity="0.35" />
    </>
  );
}

function NetworkPlate() {
  const layers = [4, 6, 6, 3];
  const pos = layers.map((n, l) => Array.from({ length: n }, (_, i) => ({ x: 70 + l * 87, y: 150 + (i - (n - 1) / 2) * 38 })));
  const path = [1, 3, 2, 1];
  const links: ReactNode[] = [];
  for (let l = 0; l < pos.length - 1; l++) {
    pos[l].forEach((a, i) =>
      pos[l + 1].forEach((b, j) => {
        const hot = path[l] === i && path[l + 1] === j;
        links.push(
          <line key={`${l}-${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={hot ? ORANGE : "currentColor"} strokeWidth={hot ? 2 : 1} opacity={hot ? 1 : 0.16} />,
        );
      }),
    );
  }
  return (
    <>
      {links}
      {pos.flatMap((layer, l) =>
        layer.map((p, i) => {
          const hot = path[l] === i;
          return <circle key={`${l}-${i}`} cx={p.x} cy={p.y} r="7" fill={hot ? ORANGE : "var(--plate-bg, #DDE8F1)"} stroke={hot ? ORANGE : "currentColor"} strokeWidth="1.5" />;
        }),
      )}
    </>
  );
}

function ImagingPlate() {
  return (
    <>
      <ellipse cx="200" cy="150" rx="96" ry="116" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="200" cy="152" rx="84" ry="103" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M200 52 V250" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M176 118 C150 124 146 176 172 186 C186 176 186 128 176 118 Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
      <path d="M224 118 C250 124 254 176 228 186 C214 176 214 128 224 118 Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
      <path d="M140 96 C160 80 182 78 196 92 M260 96 C240 80 218 78 204 92 M136 204 C158 226 184 228 196 212 M264 204 C242 226 216 228 204 212" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <circle cx="244" cy="112" r="14" fill="none" stroke={ORANGE} strokeWidth="2" />
      <path d="M254 102 L286 70 H318" fill="none" stroke={ORANGE} strokeWidth="1.5" />
      <path d="M40 150 H84 M316 150 H360 M200 14 V30 M200 270 V286" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M44 ${70 + i * 20} h8`} stroke="currentColor" strokeWidth="1" opacity="0.4" />
      ))}
    </>
  );
}

function ModulationPlate() {
  const pulses = [70, 100, 130, 220, 250, 280];
  return (
    <>
      <circle cx="166" cy="78" r="36" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="234" cy="78" r="36" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="166" cy="78" r="24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <circle cx="234" cy="78" r="24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      {[18, 34, 50].map((r, i) => (
        <path key={r} d={`M${200 - r} 122 Q200 ${134 + r * 1.1} ${200 + r} 122`} fill="none" stroke={ORANGE} strokeWidth="1.5" opacity={1 - i * 0.28} />
      ))}
      <path d="M60 176 C110 160 150 196 200 180 C250 164 290 196 340 178" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <path
        d={`M48 246 ${pulses.map((x) => `H${x} V222 H${x + 10} V246`).join(" ")} H352`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </>
  );
}

function NeuronPlate() {
  const rand = seeded(11);
  const branches: ReactNode[] = [];
  const grow = (x: number, y: number, angle: number, length: number, depth: number, key: string) => {
    const x2 = x + Math.cos(angle) * length;
    const y2 = y + Math.sin(angle) * length;
    branches.push(<line key={key} x1={round(x)} y1={round(y)} x2={round(x2)} y2={round(y2)} stroke="currentColor" strokeWidth={round(0.6 + depth * 0.5)} strokeLinecap="round" />);
    if (depth === 0) return;
    const spread = 0.38 + rand() * 0.3;
    grow(x2, y2, angle - spread, length * 0.74, depth - 1, key + "a");
    grow(x2, y2, angle + spread * (0.7 + rand() * 0.5), length * 0.7, depth - 1, key + "b");
  };
  [-2.7, -2.05, -1.35, 2.5, 1.9].forEach((a, i) => grow(128 + Math.cos(a) * 16, 150 + Math.sin(a) * 16, a, 34, 3, `d${i}`));
  return (
    <>
      {branches}
      <path d="M146 152 C190 158 214 136 252 142 S318 168 350 150" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {[176, 212, 248, 284].map((x, i) => (
        <rect key={x} x={x} y={[149, 136, 138, 151][i]} width="22" height="9" rx="4" fill="var(--plate-bg, #DDE8F1)" stroke="currentColor" strokeWidth="1" transform={`rotate(${[6, -8, 10, 12][i]} ${x + 11} ${[153, 140, 142, 155][i]})`} />
      ))}
      <path d="M350 150 l14 -12 M350 150 l16 2 M350 150 l10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="366" cy="137" r="3" fill={ORANGE} />
      <circle cx="368" cy="152" r="3" fill={ORANGE} />
      <circle cx="361" cy="166" r="3" fill={ORANGE} />
      <circle cx="128" cy="150" r="18" fill={ORANGE} />
      <circle cx="128" cy="150" r="6" fill="var(--plate-bg, #DDE8F1)" opacity="0.9" />
    </>
  );
}

function SignalPlate() {
  const rand = seeded(7);
  const rows = 5;
  const traces: ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const y0 = 62 + r * 44;
    const f1 = 0.05 + rand() * 0.05;
    const f2 = 0.17 + rand() * 0.1;
    const p = rand() * 6;
    const point = (x: number) => {
      const burst = r === 2 ? Math.exp(-((x - 236) ** 2) / 900) : 0;
      return `${x},${round(y0 + Math.sin(x * f1 + p) * 6 + Math.sin(x * f2 + p * 2) * 3 + Math.sin(x * 0.6) * 15 * burst)}`;
    };
    const xs = Array.from({ length: 151 }, (_, i) => 48 + i * 2);
    traces.push(<polyline key={r} points={xs.map(point).join(" ")} fill="none" stroke="currentColor" strokeWidth="1.3" opacity={r === 2 ? 0.9 : 0.55} />);
    if (r === 2) {
      traces.push(<polyline key="hot" points={xs.filter((x) => x >= 196 && x <= 276).map(point).join(" ")} fill="none" stroke={ORANGE} strokeWidth="2" />);
    }
  }
  return (
    <>
      <rect x="196" y="34" width="80" height="232" rx="8" fill={ORANGE} opacity="0.08" />
      {traces}
      <path d="M48 276 H348" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${48 + i * 50} 272 v8`} stroke="currentColor" strokeWidth="1" opacity="0.35" />
      ))}
    </>
  );
}

function ContourPlate() {
  const rings = 9;
  const curves: ReactNode[] = [];
  for (let k = 0; k < rings; k++) {
    const scale = 1 - k * 0.1;
    const pts: string[] = [];
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const wobble = 1 + 0.16 * Math.sin(a * 3 + k * 0.5) + 0.09 * Math.sin(a * 5 - k * 0.8) + 0.05 * Math.cos(a * 7 + k);
      const x = 205 + Math.cos(a) * 168 * scale * wobble + k * 5;
      const y = 150 + Math.sin(a) * 112 * scale * wobble - k * 3;
      pts.push(`${round(x)},${round(y)}`);
    }
    const hot = k === 6;
    curves.push(<polygon key={k} points={pts.join(" ")} fill="none" stroke={hot ? ORANGE : "currentColor"} strokeWidth={hot ? 2 : 1.1} opacity={hot ? 1 : 0.25 + k * 0.07} strokeLinejoin="round" />);
  }
  return (
    <>
      {curves}
      <circle cx="248" cy="128" r="4" fill={ORANGE} />
    </>
  );
}

const plates: Record<PlateId, () => ReactNode> = {
  interface: InterfacePlate,
  network: NetworkPlate,
  imaging: ImagingPlate,
  modulation: ModulationPlate,
  neuron: NeuronPlate,
  signal: SignalPlate,
  contour: ContourPlate,
};

export function Plate({ id, className = "" }: { id: PlateId; className?: string }) {
  const Figure = plates[id];
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true" focusable="false" className={className} preserveAspectRatio="xMidYMid meet">
      <Figure />
    </svg>
  );
}
