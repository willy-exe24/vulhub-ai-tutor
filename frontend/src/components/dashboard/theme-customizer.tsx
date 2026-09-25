"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Image as ImageIcon, Palette, RotateCcw, X } from "lucide-react"

type Accent = {
  id: string
  label: string
  swatch: string
  primary: string
  accent: string
  foreground: string
}

type Background = {
  id: string
  label: string
  value: string | null
  preview: string
}

const ACCENTS: Accent[] = [
  {
    id: "emerald",
    label: "Cyber Green",
    swatch: "oklch(0.82 0.16 175)",
    primary: "oklch(0.82 0.16 175)",
    accent: "oklch(0.75 0.14 200)",
    foreground: "oklch(0.19 0.03 200)",
  },
  {
    id: "blue",
    label: "Signal Blue",
    swatch: "oklch(0.7 0.15 240)",
    primary: "oklch(0.7 0.15 240)",
    accent: "oklch(0.72 0.13 230)",
    foreground: "oklch(0.98 0.01 240)",
  },
  {
    id: "violet",
    label: "Neon Violet",
    swatch: "oklch(0.72 0.16 290)",
    primary: "oklch(0.72 0.16 290)",
    accent: "oklch(0.68 0.15 300)",
    foreground: "oklch(0.98 0.01 290)",
  },
  {
    id: "amber",
    label: "Alert Amber",
    swatch: "oklch(0.82 0.15 75)",
    primary: "oklch(0.82 0.15 75)",
    accent: "oklch(0.78 0.14 55)",
    foreground: "oklch(0.2 0.03 60)",
  },
  {
    id: "rose",
    label: "Threat Rose",
    swatch: "oklch(0.7 0.18 15)",
    primary: "oklch(0.7 0.18 15)",
    accent: "oklch(0.68 0.17 25)",
    foreground: "oklch(0.98 0.01 15)",
  },
]

const BACKGROUNDS: Background[] = [
  {
    id: "default",
    label: "Default",
    value: null,
    preview: "oklch(0.17 0.02 250)",
  },
  {
    id: "nebula",
    label: "Nebula",
    value: "radial-gradient(circle at 30% 20%, oklch(0.32 0.09 200), oklch(0.16 0.03 260) 55%)",
    preview: "radial-gradient(circle at 30% 20%, oklch(0.32 0.09 200), oklch(0.16 0.03 260) 55%)",
  },
  {
    id: "aurora",
    label: "Aurora",
    value: "linear-gradient(135deg, oklch(0.28 0.1 160), oklch(0.24 0.11 280))",
    preview: "linear-gradient(135deg, oklch(0.28 0.1 160), oklch(0.24 0.11 280))",
  },
  {
    id: "sunset",
    label: "Sunset",
    value: "linear-gradient(135deg, oklch(0.35 0.12 40), oklch(0.25 0.1 320))",
    preview: "linear-gradient(135deg, oklch(0.35 0.12 40), oklch(0.25 0.1 320))",
  },
  {
    id: "ember",
    label: "Ember",
    value: "radial-gradient(circle at 70% 30%, oklch(0.3 0.12 25), oklch(0.16 0.03 260) 60%)",
    preview: "radial-gradient(circle at 70% 30%, oklch(0.3 0.12 25), oklch(0.16 0.03 260) 60%)",
  },
]

const STORAGE_KEY = "vulhub-theme"

type ThemeState = {
  accent: string
  accentColor: string | null
  background: string
  bgColor: string | null
  bgImage: string | null
}

const DEFAULT_STATE: ThemeState = {
  accent: "emerald",
  accentColor: null,
  background: "default",
  bgColor: null,
  bgImage: null,
}

function readableForeground(hex: string): string {
  const normalized = hex.replace("#", "")
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized
  const r = Number.parseInt(full.slice(0, 2), 16) / 255
  const g = Number.parseInt(full.slice(2, 4), 16) / 255
  const b = Number.parseInt(full.slice(4, 6), 16) / 255
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.55 ? "oklch(0.15 0 0)" : "oklch(0.98 0 0)"
}

function applyAccent(state: ThemeState) {
  const root = document.documentElement
  const keys = [
    "--primary",
    "--accent",
    "--ring",
    "--chart-1",
    "--sidebar-primary",
    "--sidebar-ring",
  ]
  const fgKeys = ["--primary-foreground", "--accent-foreground", "--sidebar-primary-foreground"]

  if (state.accent === "custom" && state.accentColor) {
    keys.forEach((k) => root.style.setProperty(k, state.accentColor as string))
    const fg = readableForeground(state.accentColor)
    fgKeys.forEach((k) => root.style.setProperty(k, fg))
    return
  }

  const preset = ACCENTS.find((a) => a.id === state.accent)
  if (!preset) {
    ;[...keys, ...fgKeys].forEach((k) => root.style.removeProperty(k))
    return
  }
  root.style.setProperty("--primary", preset.primary)
  root.style.setProperty("--accent", preset.accent)
  root.style.setProperty("--ring", preset.primary)
  root.style.setProperty("--chart-1", preset.primary)
  root.style.setProperty("--sidebar-primary", preset.primary)
  root.style.setProperty("--sidebar-ring", preset.primary)
  fgKeys.forEach((k) => root.style.setProperty(k, preset.foreground))
}

function applyBackground(state: ThemeState) {
  const root = document.documentElement
  let value: string | null = null

  if (state.background === "custom-color" && state.bgColor) {
    value = state.bgColor
  } else if (state.background === "custom-image" && state.bgImage) {
    value = `url("${state.bgImage}")`
  } else {
    const preset = BACKGROUNDS.find((b) => b.id === state.background)
    value = preset?.value ?? null
  }

  if (value) {
    root.style.setProperty("--custom-bg", value)
    root.setAttribute("data-custom-bg", "true")
  } else {
    root.style.removeProperty("--custom-bg")
    root.removeAttribute("data-custom-bg")
  }
}

function applyTheme(state: ThemeState) {
  applyAccent(state)
  applyBackground(state)
}

export function ThemeCustomizer() {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<ThemeState>(DEFAULT_STATE)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<ThemeState>) }
        setState(parsed)
        applyTheme(parsed)
      }
    } catch {
      /* ignore malformed storage */
    }
  }, [])

  const update = useCallback((next: ThemeState) => {
    setState(next)
    applyTheme(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore write errors */
    }
  }, [])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const reset = () => update(DEFAULT_STATE)

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Customize appearance"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      >
        <Palette className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Appearance settings"
          className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-border bg-popover p-4 shadow-2xl shadow-black/40"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-popover-foreground">Appearance</p>
              <p className="text-xs text-muted-foreground">Accent color and background</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <section>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Accent</p>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENTS.map((a) => {
                  const active = state.accent === a.id
                  return (
                    <button
                      key={a.id}
                      type="button"
                      title={a.label}
                      aria-label={a.label}
                      aria-pressed={active}
                      onClick={() => update({ ...state, accent: a.id, accentColor: null })}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform hover:scale-105"
                      style={{
                        backgroundColor: a.swatch,
                        borderColor: active ? "var(--foreground)" : "transparent",
                      }}
                    >
                      {active && <Check className="h-4 w-4 text-black/70" />}
                    </button>
                  )
                })}
                <label
                  title="Custom accent color"
                  className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2"
                  style={{
                    background:
                      "conic-gradient(from 0deg, oklch(0.7 0.2 0), oklch(0.8 0.18 120), oklch(0.75 0.16 240), oklch(0.7 0.2 0))",
                    borderColor: state.accent === "custom" ? "var(--foreground)" : "transparent",
                  }}
                >
                  <input
                    type="color"
                    aria-label="Custom accent color"
                    value={state.accentColor ?? "#33e0c0"}
                    onChange={(e) => update({ ...state, accent: "custom", accentColor: e.target.value })}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  {state.accent !== "custom" && <Palette className="h-3.5 w-3.5 text-black/70" />}
                </label>
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Background</p>
              <div className="grid grid-cols-5 gap-2">
                {BACKGROUNDS.map((b) => {
                  const active = state.background === b.id
                  return (
                    <button
                      key={b.id}
                      type="button"
                      title={b.label}
                      aria-label={b.label}
                      aria-pressed={active}
                      onClick={() => update({ ...state, background: b.id })}
                      className="relative flex h-10 items-center justify-center rounded-md border-2 transition-transform hover:scale-105"
                      style={{
                        background: b.preview,
                        borderColor: active ? "var(--primary)" : "var(--border)",
                      }}
                    >
                      {active && <Check className="h-4 w-4 text-white drop-shadow" />}
                    </button>
                  )
                })}
              </div>

              <div className="mt-3 space-y-2">
                <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
                  <span className="text-sm text-foreground">Custom color</span>
                  <input
                    type="color"
                    aria-label="Custom background color"
                    value={state.bgColor ?? "#141a24"}
                    onChange={(e) => update({ ...state, background: "custom-color", bgColor: e.target.value })}
                    className="h-7 w-10 cursor-pointer rounded border border-border bg-transparent"
                  />
                </label>

                <div className="rounded-lg border border-border bg-card px-3 py-2">
                  <div className="mb-1.5 flex items-center gap-2 text-sm text-foreground">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    Custom image URL
                  </div>
                  <input
                    type="url"
                    inputMode="url"
                    placeholder="https://example.com/bg.jpg"
                    aria-label="Custom background image URL"
                    defaultValue={state.bgImage ?? ""}
                    onChange={(e) => {
                      const url = e.target.value.trim()
                      update({
                        ...state,
                        background: url ? "custom-image" : "default",
                        bgImage: url || null,
                      })
                    }}
                    className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={reset}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to default
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
