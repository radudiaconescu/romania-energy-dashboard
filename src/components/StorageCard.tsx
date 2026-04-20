import { type EnergySnapshot } from '../api/transelectrica'
import { formatMW } from '../utils/format'

interface Props {
  latest: EnergySnapshot | null
  history: EnergySnapshot[]
}

const SPARKLINE_W = 200
const SPARKLINE_H = 30

export function StorageCard({ latest, history }: Props) {
  const mw = latest?.pumpedStorage ?? 0
  // Negative = storing (pumping water uphill), positive = releasing (generating)
  const isStoring = mw < 0
  const color = isStoring ? 'text-violet-400' : 'text-amber-400'
  const bgBar = isStoring ? 'bg-violet-500' : 'bg-amber-500'
  const label = isStoring ? 'STORING' : mw === 0 ? 'IDLE' : 'RELEASING'

  const spark = history.slice(-20).map((s) => s.pumpedStorage)
  const absValues = spark.map(Math.abs)
  const maxAbs = Math.max(...absValues, 1)

  const toX = (i: number) =>
    spark.length > 1 ? (i / (spark.length - 1)) * SPARKLINE_W : SPARKLINE_W / 2
  // Center zero in the middle of the viewBox; positive = above, negative = below
  const toY = (v: number) => SPARKLINE_H / 2 - (v / maxAbs) * (SPARKLINE_H / 2 - 2)

  return (
    <div className="bg-slate-800 rounded-xl p-4 flex flex-col gap-2">
      <span className="text-xs text-slate-400 uppercase tracking-wider">Battery Storage</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${color}`}>{formatMW(Math.abs(mw))}</span>
        <span className={`text-sm font-semibold ${color}`}>{label}</span>
      </div>
      {/* Progress bar — scaled to 1000 MW max capacity */}
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${bgBar}`}
          style={{ width: `${Math.min(100, (Math.abs(mw) / 1000) * 100)}%` }}
        />
      </div>

      {/* Sparkline — zero-centered, positive up = releasing, negative down = storing */}
      {spark.length > 1 && (
        <svg
          viewBox={`0 0 ${SPARKLINE_W} ${SPARKLINE_H}`}
          width="100%"
          height="32"
          className="mt-1"
          preserveAspectRatio="none"
        >
          {/* Zero line */}
          <line
            x1={0} y1={SPARKLINE_H / 2}
            x2={SPARKLINE_W} y2={SPARKLINE_H / 2}
            stroke="#475569"
            strokeWidth="0.5"
            strokeDasharray="4,4"
          />
          <polyline
            fill="none"
            stroke={isStoring ? '#a855f7' : '#f59e0b'}
            strokeWidth="1.5"
            points={spark.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')}
          />
        </svg>
      )}
    </div>
  )
}
