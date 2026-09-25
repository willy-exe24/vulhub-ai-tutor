import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { DiscoveredVm, VmConfig } from '@/lib/types'

function VmSelect({
  label,
  value,
  vms,
  onChange,
}: {
  label: string
  value: string | null
  vms: DiscoveredVm[]
  onChange: (vmxPath: string | null) => void
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-300">{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
      >
        <option value="">None</option>
        {vms.map((vm) => (
          <option key={vm.vmx_path} value={vm.vmx_path}>
            {vm.name} {vm.running ? '(running)' : ''}
          </option>
        ))}
        {value && !vms.some((vm) => vm.vmx_path === value) && <option value={value}>{value}</option>}
      </select>
    </label>
  )
}

export function VmSettings() {
  const [vms, setVms] = useState<DiscoveredVm[]>([])
  const [config, setConfig] = useState<VmConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function load() {
    Promise.all([api.discoverVms(), api.getVmConfig()])
      .then(([discovered, cfg]) => {
        setVms(discovered)
        setConfig(cfg)
      })
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function save(partial: Partial<VmConfig>) {
    setSaving(true)
    setError(null)
    try {
      const updated = await api.updateVmConfig(partial)
      setConfig(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  async function powerAction(action: 'kali-start' | 'kali-stop' | 'vulhub-start' | 'vulhub-stop') {
    setSaving(true)
    setError(null)
    try {
      if (action === 'kali-start') await api.startKaliVm()
      if (action === 'kali-stop') await api.stopKaliVm()
      if (action === 'vulhub-start') await api.startVulhubVm()
      if (action === 'vulhub-stop') await api.stopVulhubVm()
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  if (!config) {
    return error ? <p className="text-sm text-red-400">{error}</p> : <p className="text-sm text-slate-500">Loading…</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium text-slate-300">Virtual Machines</h2>
        <p className="mt-1 text-sm text-slate-500">
          Detected VMware Workstation/Player VMs on this machine. Assign which one is your attacker (Kali)
          box and which one runs Vulhub — this just powers them on/off for you; the app doesn't connect to
          either VM. You attack your Vulhub VM directly from your Kali VM yourself.
        </p>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded border border-slate-800 bg-slate-900/40 p-3">
            <VmSelect
              label="Kali VM"
              value={config.kali_vmx_path}
              vms={vms}
              onChange={(v) => save({ kali_vmx_path: v })}
            />
            <p className="text-xs text-slate-500">
              Status: {config.kali_status.configured ? (config.kali_status.running ? 'Running' : 'Stopped') : 'Not set'}
            </p>
            <div className="flex gap-2">
              <button
                disabled={saving || !config.kali_vmx_path}
                onClick={() => powerAction('kali-start')}
                className="rounded bg-emerald-600 px-2.5 py-1 text-xs text-white disabled:opacity-50"
              >
                Start
              </button>
              <button
                disabled={saving || !config.kali_vmx_path}
                onClick={() => powerAction('kali-stop')}
                className="rounded bg-slate-700 px-2.5 py-1 text-xs text-white disabled:opacity-50"
              >
                Stop
              </button>
            </div>
          </div>

          <div className="space-y-2 rounded border border-slate-800 bg-slate-900/40 p-3">
            <VmSelect
              label="Vulhub VM"
              value={config.vulhub_vmx_path}
              vms={vms}
              onChange={(v) => save({ vulhub_vmx_path: v })}
            />
            <p className="text-xs text-slate-500">
              Status:{' '}
              {config.vulhub_status.configured ? (config.vulhub_status.running ? 'Running' : 'Stopped') : 'Not set'}
            </p>
            <div className="flex gap-2">
              <button
                disabled={saving || !config.vulhub_vmx_path}
                onClick={() => powerAction('vulhub-start')}
                className="rounded bg-emerald-600 px-2.5 py-1 text-xs text-white disabled:opacity-50"
              >
                Start
              </button>
              <button
                disabled={saving || !config.vulhub_vmx_path}
                onClick={() => powerAction('vulhub-stop')}
                className="rounded bg-slate-700 px-2.5 py-1 text-xs text-white disabled:opacity-50"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
