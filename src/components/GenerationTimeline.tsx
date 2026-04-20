import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { type EnergySnapshot } from '../api/transelectrica'
import { TIMELINE_SOURCES } from '../constants/sources'

interface Props {
  history: EnergySnapshot[]
}

export function GenerationTimeline({ history }: Props) {
  const data = history.map((s) => {
    const point: Record<string, string | number> = {
      time: new Date(s.timestamp).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
    }
    for (const src of TIMELINE_SOURCES) {
      point[src.key] = s[src.key]
    }
    return point
  })

  if (data.length < 2) {
    return (
      <div className="bg-slate-800 rounded-xl p-4">
        <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-3">Generation Timeline</h3>
        <div className="h-60 flex items-center justify-center text-slate-500 text-sm">
          Collecting data… ({data.length}/2 points)
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-3">Generation Timeline (session)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#64748b', fontSize: 11 }}
            interval="preserveStartEnd"
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            unit=" MW"
            width={70}
          />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ fontSize: 12 }}
            formatter={(v) => [`${Number(v).toLocaleString()} MW`, '']}
          />
          {TIMELINE_SOURCES.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stackId="1"
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.7}
              strokeWidth={1}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
