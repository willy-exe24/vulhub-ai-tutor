import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { LabCard } from '../components/LabCard'
import type { Lab } from '../lib/types'

export function LabBrowser() {
  const [searchParams] = useSearchParams()
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const [product, setProduct] = useState('')
  const [rescanning, setRescanning] = useState(false)

  function load() {
    setLoading(true)
    api
      .listLabs()
      .then(setLabs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  useEffect(() => {
    const fromUrl = searchParams.get('search')
    if (fromUrl != null) setSearch(fromUrl)
  }, [searchParams])

  async function rescan() {
    setRescanning(true)
    try {
      await api.rescan()
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setRescanning(false)
    }
  }

  const products = useMemo(
    () => Array.from(new Set(labs.map((l) => l.product))).sort(),
    [labs],
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return labs.filter((lab) => {
      if (product && lab.product !== product) return false
      if (!term) return true
      return (
        lab.name.toLowerCase().includes(term) ||
        lab.product.toLowerCase().includes(term) ||
        (lab.cve ?? '').toLowerCase().includes(term)
      )
    })
  }, [labs, search, product])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Lab Browser</h1>
        <button
          onClick={rescan}
          disabled={rescanning}
          className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {rescanning ? 'Rescanning…' : 'Rescan Lab Library'}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search labs, products, CVEs…"
          className="w-72 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
        />
        <select
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All products</option>
          {products.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-4 rounded border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-slate-400">Loading labs…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-slate-400">
          No labs found. {labs.length === 0 && 'Try rescanning.'}
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-slate-500">
            {filtered.length} of {labs.length} labs
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
