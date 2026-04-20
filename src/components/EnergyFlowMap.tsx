import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Line, Marker } from 'react-simple-maps'
import { type EnergySnapshot } from '../api/transelectrica'
import { formatMW } from '../utils/format'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json'

type FlowKey = keyof Pick<
  EnergySnapshot,
  'flowBulgaria' | 'flowHungary' | 'flowSerbia' | 'flowUkraine' | 'flowMoldova'
>

interface NeighborDef {
  name: string
  flag: string
  iso: number
  coords: [number, number]
  flowKey: FlowKey
}

const NEIGHBORS: NeighborDef[] = [
  { name: 'Bulgaria', flag: '🇧🇬', iso: 100, coords: [25.5, 42.8], flowKey: 'flowBulgaria' },
  { name: 'Hungary',  flag: '🇭🇺', iso: 348, coords: [19.5, 47.2], flowKey: 'flowHungary'  },
  { name: 'Serbia',   flag: '🇷🇸', iso: 688, coords: [21.0, 44.0], flowKey: 'flowSerbia'   },
  { name: 'Ukraine',  flag: '🇺🇦', iso: 804, coords: [30.0, 49.0], flowKey: 'flowUkraine'  },
  { name: 'Moldova',  flag: '🇲🇩', iso: 498, coords: [28.5, 47.0], flowKey: 'flowMoldova'  },
]

const ROMANIA_CENTER: [number, number] = [24.9, 45.9]

const HIGHLIGHT_ISOS = new Set([642, ...NEIGHBORS.map((n) => n.iso)])

function strokeWidth(mw: number): number {
  const w = 1 + (Math.abs(mw) / 2000) * 3
  return Math.min(4, Math.max(1, w))
}

function animDuration(mw: number): string {
  const abs = Math.abs(mw)
  // linear interpolation: 100 MW → 5s, 2500 MW → 1.5s
  const t = Math.min(1, Math.max(0, (abs - 100) / (2500 - 100)))
  const s = 5 - t * (5 - 1.5)
  return `${s.toFixed(2)}s`
}

interface TooltipState {
  name: string
  flag: string
  mw: number
  direction: 'import' | 'export'
  x: number
  y: number
}

interface Props {
  latest: EnergySnapshot | null
}

export function EnergyFlowMap({ latest }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  return (
    <div className="bg-slate-800 rounded-xl p-4 relative">
      <span className="text-xs text-slate-400 uppercase tracking-wider">Cross-Border Flows</span>

      <div className="mt-2 w-full relative" style={{ aspectRatio: '800 / 420' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [25, 46], scale: 2400 }}
          width={800}
          height={420}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numId = Number(geo.id)
                const fill =
                  numId === 642
                    ? '#3b4f6e'
                    : HIGHLIGHT_ISOS.has(numId)
                    ? '#2a3a52'
                    : '#1a2535'
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#0f172a"
                    strokeWidth={0.5}
                    style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                  />
                )
              })
            }
          </Geographies>

          {/* Flow lines */}
          {latest &&
            NEIGHBORS.map(({ name, flag, coords, flowKey }) => {
              const mw: number = latest[flowKey]
              if (mw === 0) return null

              const isImport = mw > 0
              const color = isImport ? '#38bdf8' : '#34d399'
              const from: [number, number] = isImport ? coords : ROMANIA_CENTER
              const to: [number, number] = isImport ? ROMANIA_CENTER : coords

              return (
                <Line
                  key={name}
                  from={from}
                  to={to}
                  stroke={color}
                  strokeWidth={strokeWidth(mw)}
                  className="flow-line"
                  style={{ animationDuration: animDuration(mw) }}
                  onMouseEnter={(e: React.MouseEvent) => {
                    const rect = (e.currentTarget as SVGElement)
                      .closest('svg')
                      ?.getBoundingClientRect()
                    if (rect) {
                      setTooltip({
                        name,
                        flag,
                        mw: Math.abs(mw),
                        direction: isImport ? 'import' : 'export',
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      })
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              )
            })}

          {/* Neighbor markers */}
          {NEIGHBORS.map(({ name, flag, coords, flowKey }) => {
            const mw = latest ? latest[flowKey] : 0
            const isImport = mw > 0
            const arrow = mw === 0 ? '' : isImport ? ' ↓' : ' ↑'
            const textColor = mw === 0 ? '#94a3b8' : isImport ? '#38bdf8' : '#34d399'

            return (
              <Marker key={name} coordinates={coords}>
                <text textAnchor="middle" dy="-14" style={{ fontSize: 14, userSelect: 'none' }}>
                  {flag}
                </text>
                <text
                  textAnchor="middle"
                  dy="-2"
                  style={{ fontSize: 7, fill: '#cbd5e1', userSelect: 'none', fontWeight: 600 }}
                >
                  {name}
                </text>
                <text
                  textAnchor="middle"
                  dy="8"
                  style={{ fontSize: 7, fill: textColor, userSelect: 'none' }}
                >
                  {mw === 0 ? '—' : `${formatMW(Math.abs(mw))}${arrow}`}
                </text>
              </Marker>
            )
          })}

          {/* Romania center dot */}
          <Marker coordinates={ROMANIA_CENTER}>
            <circle r={5} fill="#3b82f6" stroke="#93c5fd" strokeWidth={1.5} />
            <text
              textAnchor="middle"
              dy="14"
              style={{ fontSize: 7, fill: '#93c5fd', userSelect: 'none', fontWeight: 700 }}
            >
              RO
            </text>
          </Marker>
        </ComposableMap>

        {/* Hover tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-slate-100 shadow-lg"
            style={{ left: tooltip.x + 8, top: tooltip.y - 8 }}
          >
            <span className="mr-1">{tooltip.flag}</span>
            <span className="font-semibold">{tooltip.name}</span>
            <span className="mx-1 text-slate-400">·</span>
            <span className={tooltip.direction === 'import' ? 'text-sky-400' : 'text-emerald-400'}>
              {tooltip.direction === 'import' ? '← IMPORT' : '→ EXPORT'}
            </span>
            <span className="ml-1 font-mono">{formatMW(tooltip.mw)}</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-1 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-sky-400" />
          Import
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-emerald-400" />
          Export
        </span>
      </div>
    </div>
  )
}
