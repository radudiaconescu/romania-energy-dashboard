export function formatMW(value: number): string {
  return `${value.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} MW`
}

export function formatBalance(value: number): string {
  const abs = Math.abs(value)
  const label = value < 0 ? 'EXPORT' : 'IMPORT'
  return `${abs.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} MW ${label}`
}
