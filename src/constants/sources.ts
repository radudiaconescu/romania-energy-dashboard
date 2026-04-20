// Generation-only keys — excludes storage (handled by StorageCard) and cross-border flows
type GenerationKey = 'nuclear' | 'hydro' | 'wind' | 'solar' | 'gas' | 'coal' | 'biomass'

export interface EnergySource {
  key: GenerationKey
  label: string
  color: string
}

// Pure generation sources. pumpedStorage excluded — it can be negative (consuming power)
// and is displayed separately in StorageCard with correct sign semantics.
export const GENERATION_SOURCES: readonly EnergySource[] = [
  { key: 'nuclear', label: 'Nuclear', color: '#f59e0b' },
  { key: 'hydro',   label: 'Hydro',   color: '#3b82f6' },
  { key: 'wind',    label: 'Wind',    color: '#22c55e' },
  { key: 'solar',   label: 'Solar',   color: '#f97316' },
  { key: 'gas',     label: 'Gas',     color: '#f43f5e' },
  { key: 'coal',    label: 'Coal',    color: '#64748b' },
  { key: 'biomass', label: 'Biomass', color: '#84cc16' },
]

// Timeline uses the same sources (all are non-negative, safe for stacked area chart)
export const TIMELINE_SOURCES = GENERATION_SOURCES
