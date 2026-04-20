import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { fetchEnergySnapshot, type EnergySnapshot } from '../api/transelectrica'
import { ApiError } from '../api/client'

const HISTORY_KEY = 'energy-history'
const MAX_HISTORY = 120

function loadHistory(): EnergySnapshot[] {
  try {
    const stored = sessionStorage.getItem(HISTORY_KEY)
    return stored ? (JSON.parse(stored) as EnergySnapshot[]) : []
  } catch {
    return []
  }
}

function saveHistory(history: EnergySnapshot[]) {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    // ignore storage errors (quota, private mode)
  }
}

export function useEnergyData() {
  const [history, setHistory] = useState<EnergySnapshot[]>(loadHistory)
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['energy'],
    queryFn: fetchEnergySnapshot,
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: (count, err) => {
      // Don't retry non-retryable errors (parse failures, schema changes)
      if (err instanceof ApiError && !err.retryable) return false
      return count < 3
    },
  })

  useEffect(() => {
    if (!query.data) return
    setHistory((prev) => {
      const next = [...prev, query.data].slice(-MAX_HISTORY)
      saveHistory(next)
      return next
    })
  }, [query.data])

  return {
    latest: query.data ?? null,
    history,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
    refetch: () => queryClient.refetchQueries({ queryKey: ['energy'] }),
  }
}
