import { z } from 'zod'
import { fetchText, ApiError } from './client'

export interface EnergySnapshot {
  timestamp: number
  consumption: number
  production: number
  balance: number
  nuclear: number
  hydro: number
  wind: number
  solar: number
  gas: number
  coal: number
  biomass: number
  pumpedStorage: number
  // Cross-border flows: positive = importing FROM that country, negative = exporting TO them
  flowBulgaria: number  // KOZL1 + KOZL2 + VARN
  flowHungary: number   // BEKE1 + SAND
  flowSerbia: number    // PANCEVO21 + PANCEVO22 + DJER
  flowUkraine: number   // MUKA
  flowMoldova: number   // VULC + UNGE + IAS2
}

// Response is a JSON array of single-key objects: [{"CARB":"608"}, {"APE":"1313"}, ...]
const RawArraySchema = z.array(z.record(z.string(), z.string()))

export function parseResponse(text: string): EnergySnapshot {
  let arr: z.infer<typeof RawArraySchema>
  try {
    arr = RawArraySchema.parse(JSON.parse(text))
  } catch (err) {
    throw new ApiError(
      `Failed to parse Transelectrica response: ${err instanceof Error ? err.message : String(err)}`,
      undefined,
      false, // non-retryable — format change won't be fixed by retrying
    )
  }

  // Flatten array of single-key objects into one map
  const data: Record<string, string> = {}
  for (const entry of arr) {
    Object.assign(data, entry)
  }

  const num = (key: string): number => {
    const raw = data[key] ?? ''
    const v = parseFloat(raw)
    if (!Number.isFinite(v)) {
      console.warn(`[transelectrica] Unexpected value for ${key}: "${raw}" — using 0`)
      return 0
    }
    return v
  }

  return {
    timestamp: Date.now(),
    consumption: num('CONS'),
    production: num('PROD'),
    balance: num('SOLD'),
    nuclear: num('NUCL'),
    hydro: num('APE'),
    wind: num('EOLIAN'),
    solar: num('FOTO'),
    gas: num('GAZE'),
    coal: num('CARB'),
    biomass: num('BMASA'),
    pumpedStorage: num('ISPOZ'),
    flowBulgaria: num('KOZL1') + num('KOZL2') + num('VARN') + num('DOBR'),
    flowHungary: num('BEKE1') + num('SAND'),
    flowSerbia: num('PANCEVO21') + num('PANCEVO22') + num('DJER'),
    flowUkraine: num('MUKA'),
    flowMoldova: num('VULC') + num('UNGE') + num('IAS2'),
  }
}

export async function fetchEnergySnapshot(): Promise<EnergySnapshot> {
  const text = await fetchText('/api/sen-filter')
  return parseResponse(text)
}
