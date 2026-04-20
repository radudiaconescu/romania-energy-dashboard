import { type EnergySnapshot } from '../api/transelectrica'
import { GENERATION_SOURCES } from '../constants/sources'

interface Props {
  latest: EnergySnapshot | null
}

export function GenerationBreakdown({ latest }: Props) {
  if (!latest) return null

  const items = GENERATION_SOURCES.map((s) => ({ ...s, value: latest[s.key] }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = items.reduce((sum, s) => sum + s.value, 0) || 1

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-4">Generation Breakdown</h3>
      <div className="flex flex-col gap-3">
        {items.map((s) => {
          const pct = ((s.value / total) * 100).toFixed(1)
          return (
            <div key={s.key} className="flex items-center gap-3">
              <span className="text-slate-300 text-sm w-28 shrink-0">{s.label}</span>
              <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
                />
              </div>
              <span className="text-slate-300 text-sm w-24 text-right shrink-0">
                {s.value.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} MW
              </span>
              <span className="text-slate-500 text-xs w-12 text-right shrink-0">({pct}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
