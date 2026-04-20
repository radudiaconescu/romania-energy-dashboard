import { type EnergySnapshot } from '../api/transelectrica'
import { formatMW } from '../utils/format'

interface Props {
  latest: EnergySnapshot | null
}

interface Neighbor {
  flag: string
  name: string
  flow: number
}

export function NeighborsCard({ latest }: Props) {
  const neighbors: Neighbor[] = latest
    ? [
        { flag: '🇧🇬', name: 'Bulgaria', flow: latest.flowBulgaria },
        { flag: '🇭🇺', name: 'Hungary',  flow: latest.flowHungary  },
        { flag: '🇷🇸', name: 'Serbia',   flow: latest.flowSerbia   },
        { flag: '🇺🇦', name: 'Ukraine',  flow: latest.flowUkraine  },
        { flag: '🇲🇩', name: 'Moldova',  flow: latest.flowMoldova  },
      ].sort((a, b) => Math.abs(b.flow) - Math.abs(a.flow))
    : []

  const maxAbs = Math.max(...neighbors.map((n) => Math.abs(n.flow)), 1)

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <span className="text-xs text-slate-400 uppercase tracking-wider">Cross-Border Flows</span>
      <div className="mt-3 flex flex-col gap-2">
        {neighbors.map(({ flag, name, flow }) => {
          const isImport = flow > 0
          const pct = (Math.abs(flow) / maxAbs) * 100
          const color = isImport ? 'bg-sky-500' : 'bg-emerald-500'
          const textColor = isImport ? 'text-sky-400' : 'text-emerald-400'
          const direction = isImport ? '← IMPORT' : '→ EXPORT'

          return (
            <div key={name} className="flex items-center gap-2">
              <span className="text-base w-6 flex-shrink-0">{flag}</span>
              <span className="text-xs text-slate-300 w-16 flex-shrink-0">{name}</span>
              <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`text-xs font-semibold w-20 text-right flex-shrink-0 ${textColor}`}>
                {flow === 0 ? '—' : `${formatMW(Math.abs(flow))}`}
              </span>
              <span className="text-xs text-slate-500 w-16 flex-shrink-0">
                {flow === 0 ? 'idle' : direction}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
