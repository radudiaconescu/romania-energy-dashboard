import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { type EnergySnapshot } from '../api/transelectrica'
import { GENERATION_SOURCES } from '../constants/sources'

interface Props {
  latest: EnergySnapshot | null
}

export function EnergyMixChart({ latest }: Props) {
  if (!latest) return <div className="h-64 flex items-center justify-center text-slate-500">Loading…</div>

  const data = GENERATION_SOURCES.map((s) => ({
    name: s.label,
    value: latest[s.key],
    color: s.color,
  })).filter((d) => d.value > 0)

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-3">Energy Mix (now)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [`${Number(v).toLocaleString()} MW`, '']}
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Legend
            formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
