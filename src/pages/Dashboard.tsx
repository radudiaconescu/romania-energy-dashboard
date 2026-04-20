import { useEnergyData } from '../hooks/useEnergyData'
import { StatCard } from '../components/StatCard'
import { LiveIndicator } from '../components/LiveIndicator'
import { ImportExportCard } from '../components/ImportExportCard'
import { EnergyMixChart } from '../components/EnergyMixChart'
import { GenerationTimeline } from '../components/GenerationTimeline'
import { GenerationBreakdown } from '../components/GenerationBreakdown'
import { StorageCard } from '../components/StorageCard'
import { EnergyFlowMap } from '../components/EnergyFlowMap'
import { formatMW } from '../utils/format'

export function Dashboard() {
  const { latest, history, isLoading, isError, lastUpdated } = useEnergyData()

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🇷🇴</span>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Romania Energy Dashboard</h1>
            <p className="text-xs text-slate-500">Data via Transelectrica SEN</p>
          </div>
        </div>
        <LiveIndicator lastUpdated={lastUpdated} />
      </header>

      {/* Error banner */}
      {isError && (
        <div className="mb-4 bg-red-950 border border-red-800 text-red-300 rounded-lg px-4 py-2 text-sm">
          Failed to load data. Retrying automatically…
        </div>
      )}

      {/* Loading state */}
      {isLoading && !latest && (
        <div className="flex items-center justify-center h-64 text-slate-500">
          Loading energy data…
        </div>
      )}

      {/* Top stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Consumption"
          value={latest ? formatMW(latest.consumption) : '—'}
          sub="Total national consumption"
          accent="text-sky-400"
        />
        <StatCard
          label="Production"
          value={latest ? formatMW(latest.production) : '—'}
          sub="Total national generation"
          accent="text-violet-400"
        />
        <ImportExportCard latest={latest} history={history} />
        <StorageCard latest={latest} history={history} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <EnergyMixChart latest={latest} />
        <GenerationTimeline history={history} />
      </div>

      {/* Breakdown + Flow Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <GenerationBreakdown latest={latest} />
        <EnergyFlowMap latest={latest} />
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-xs text-slate-600">
        Data source: Transelectrica SEN · Updates every ~1.5 min · Dashboard polls every 30s
      </footer>
    </div>
  )
}
