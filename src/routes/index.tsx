import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LocationInput, ResolvedLocation } from "@/components/meteonerd/LocationInput";
import { Hero } from "@/components/meteonerd/Hero";
import { WeatherDisplay } from "@/components/meteonerd/WeatherDisplay";
import { ThemeToggle } from "@/components/meteonerd/ThemeToggle";
import { fetchWeather, MODELS } from "@/lib/weather";
import type { UnitSystem } from "@/lib/units";
import { formatCoord } from "@/lib/units";
import { Cloud, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MeteoNerd — Hyperlocal Weather Intelligence" },
      { name: "description", content: "Every atmospheric parameter Open-Meteo provides, for any location on Earth. No data hidden." },
      { property: "og:title", content: "MeteoNerd — Hyperlocal Weather Intelligence" },
      { property: "og:description", content: "Every atmospheric parameter Open-Meteo provides, for any location on Earth." },
    ],
  }),
  component: MeteoNerd,
});

function MeteoNerd() {
  const [location, setLocation] = useState<ResolvedLocation | null>(null);
  const [model, setModel] = useState("auto");
  const [units, setUnits] = useState<UnitSystem>("metric");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  async function load(loc: ResolvedLocation, mdl: string) {
    setLoading(true); setError(null);
    try {
      const json = await fetchWeather(loc.lat, loc.lon, mdl);
      setData(json);
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function onResolve(loc: ResolvedLocation) {
    setLocation(loc);
    load(loc, model);
  }

  function onModelChange(m: string) {
    setModel(m);
    if (location) load(location, m);
  }

  const modelLabel = useMemo(() => MODELS.find(m => m.value === model)?.label ?? model, [model]);

  return (
    <div className="min-h-screen">
      <div className="mn-top-border" />
      <header className="pt-6 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a href="/">
          <div className="flex items-center gap-2">
            <Cloud size={22} className="text-primary" />
          </a>
            <a href="/">
            <h1 className="text-lg font-bold tracking-tight">
              MeteoNerd<span className="text-primary">.</span>
            </h1>
          </a>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="px-2 py-1.5 text-xs bg-card border border-border mono"
              style={{ borderRadius: 4 }}
              aria-label="Forecast model"
            >
              {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <div className="flex border border-border overflow-hidden" style={{ borderRadius: 4 }}>
              <button
                onClick={() => setUnits("metric")}
                className={`px-3 py-1.5 text-xs mono ${units === "metric" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
              >°C</button>
              <button
                onClick={() => setUnits("imperial")}
                className={`px-3 py-1.5 text-xs mono ${units === "imperial" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
              >°F</button>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 max-w-6xl mx-auto py-8">
        {!location && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Point anywhere on Earth.
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Get everything the atmosphere has.
              </p>
            </div>
            <LocationInput onResolve={onResolve} />
          </div>
        )}

        {location && (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[12px] mono text-muted-foreground">
                <span className="text-foreground">Resolved:</span> {formatCoord(location.lat, location.lon)} · {location.label}
                <span className="mx-2 opacity-50">|</span>
                Model: {modelLabel}
                {updatedAt && (<><span className="mx-2 opacity-50">|</span>Updated: {updatedAt.toLocaleTimeString()}</>)}
              </div>
              <button
                onClick={() => { setLocation(null); setData(null); }}
                className="text-xs px-3 py-1.5 border border-border hover:bg-muted flex items-center gap-1.5"
                style={{ borderRadius: 4 }}
              >
                <RotateCcw size={12} /> New Location
              </button>
            </div>

            {loading && <SkeletonView />}

            {error && !loading && (
              <div className="bg-card border border-destructive p-4 mb-4" style={{ borderRadius: 4 }}>
                <div className="text-sm text-destructive font-semibold mb-1">Weather fetch failed</div>
                <div className="text-xs mono text-muted-foreground mb-3">{error}</div>
                <button
                  onClick={() => location && load(location, model)}
                  className="px-3 py-1.5 text-xs bg-primary text-primary-foreground"
                  style={{ borderRadius: 4 }}
                >Retry</button>
              </div>
            )}

            {data && !loading && (
              <div className="space-y-4">
                <Hero data={data} location={location} model={modelLabel} units={units} />
                <WeatherDisplay data={data} units={units} lat={location.lat} lon={location.lon} />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="px-4 sm:px-6 max-w-6xl mx-auto py-8 text-center text-[11px] mono text-muted-foreground">
        Data: open-meteo.com · Developed-by: Jivaansh Yadav
      </footer>
    </div>
  );
}

function SkeletonView() {
  return (
    <div className="space-y-4">
      <div className="mn-skeleton h-64 w-full" />
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="mn-skeleton h-12 w-full" />)}
    </div>
  );
}
