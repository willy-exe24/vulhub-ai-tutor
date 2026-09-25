import { useEffect, useState } from 'react'
import { api } from './api'
import type { SystemStatus } from './types'

const POLL_INTERVAL_MS = 20_000

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    function load() {
      api
        .getSystemStatus()
        .then((s) => {
          if (!cancelled) {
            setStatus(s)
            setError(null)
          }
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof Error ? err.message : String(err))
        })
    }

    load()
    const id = setInterval(load, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return { status, error }
}
