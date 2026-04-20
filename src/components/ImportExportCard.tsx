import { type EnergySnapshot } from '../api/transelectrica'
import { formatMW } from '../utils/format'

const SPARKLINE_W = 200
const SPARKLINE_H = 30

interface Props {
  latest: EnergySnapshot | null
  history: EnergySnapshot[]
}

export function ImportExportCard({ latest, history }: Props) {
  const balance = latest?.balance ?? 0
  // SOLD < 0: production > consumption → Romania is a net exporter
  // SOLD > 0: consumption > production → Romania is a net importer
  const isExport = balance < 0
  const color = isExport ? 'text-emerald-400' : 'text-red-400'
  const bgBar = isExport ? 'bg-emerald-500' : 'bg-red-500'

  // Simple sparkline using last 20 points
  const spark = history.slice(-20).map((s) => s.balance)
  const min = Math.min(...spark, 0)
  const max = Math.max(...spark, 0)
  const range = max - min || 1

  const toX = (i: number) =>
    spark.length > 1 ? (i / (spark.length - 1)) * SPARKLINE_W : SPARKLINE_W / 2
  const toY = (v: number) => (SPARKLINE_H - 2) - ((v - min) / range) * (SPARKLINE_H - 4)
  const zeroY = toY(0)

  return (
    <div className="bg-slate-800 rounded-xl p-4 flex flex-col gap-2">
      <span className="text-xs text-slate-400 uppercase tracking-wider">Import / Export Balance</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${color}`}>{formatMW(Math.abs(balance))}</span>
        <span className={`text-sm font-semibold ${color}`}>{isExport ? 'EXPORT' : 'IMPORT'}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${bgBar}`}
          style={{ width: `${Math.min(100, (Math.abs(balance) / 2000) * 100)}%` }}
        />
      </div>

      {/* Sparkline — fixed viewBox coordinates, no % in SVG points */}
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
            x1={0}
            y1={zeroY}
            x2={SPARKLINE_W}
            y2={zeroY}
            stroke="#475569"
            strokeWidth="0.5"
            strokeDasharray="4,4"
          />
          <polyline
            fill="none"
            stroke={isExport ? '#10b981' : '#ef4444'}
            strokeWidth="1.5"
            points={spark.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')}
          />
        </svg>
      )}
    </div>
  )
}
