import { useEffect, useRef, useState } from "react";
import { COUNTRIES, LARGE_COUNTRIES } from "@/lib/countries";
import { MapPin, Search, Crosshair, X } from "lucide-react";

export type ResolvedLocation = { lat: number; lon: number; label: string };

type Match = { indices: ReadonlyArray<readonly [number, number]>; key?: string };
type Result = { item: { name: string; lat: number; lon: number }; matches?: Match[] };

function Highlight({ text, matches }: { text: string; matches?: Match[] }) {
  if (!matches || matches.length === 0) return <>{text}</>;
  const indices = matches[0].indices;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (let i = 0; i < indices.length; i++) {
    const [s, e] = indices[i];
    if (s > cursor) parts.push(<span key={`p${i}`}>{text.slice(cursor, s)}</span>);
    parts.push(<mark key={`m${i}`} className="mn-match">{text.slice(s, e + 1)}</mark>);
    cursor = e + 1;
  }
  if (cursor < text.length) parts.push(<span key="end">{text.slice(cursor)}</span>);
  return <>{parts}</>;
}

export function LocationInput({ onResolve }: { onResolve: (loc: ResolvedLocation) => void }) {
  // Mode 1
  const [geoError, setGeoError] = useState<string | null>(null);
  const geoSupported = typeof window !== "undefined" && "geolocation" in navigator;

  function useDevice() {
    setGeoError(null);
    if (!geoSupported) { setGeoError("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => onResolve({ lat: p.coords.latitude, lon: p.coords.longitude, label: "Your Location" }),
      (err) => setGeoError(err.message || "Permission denied"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // Mode 2 — countries
  const [country, setCountry] = useState<string>("");
  const [countryQ, setCountryQ] = useState("");
  const [showCountryList, setShowCountryList] = useState(false);
  const filteredCountries = countryQ
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(countryQ.toLowerCase()) || c.code.toLowerCase() === countryQ.toLowerCase())
    : COUNTRIES;

  const workerRef = useRef<Worker | null>(null);
  const [loadStatus, setLoadStatus] = useState<"idle"|"loading"|"ready"|"error">("idle");
  const [progress, setProgress] = useState(0);
  const [received, setReceived] = useState(0);
  const [total, setTotal] = useState(0);
  const [placeCount, setPlaceCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [placeQ, setPlaceQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function loadCountry(code: string) {
    setCountry(code);
    setShowCountryList(false);
    setCountryQ(COUNTRIES.find(c => c.code === code)?.name || code);
    setLoadStatus("loading");
    setProgress(0); setReceived(0); setTotal(0); setLoadError(null);
    setResults([]); setPlaceQ("");

    if (workerRef.current) workerRef.current.terminate();
    const w = new Worker(new URL("../../workers/places-worker.ts", import.meta.url), { type: "module" });
    workerRef.current = w;
    w.onmessage = (e: MessageEvent<any>) => {
      const m = e.data;
      if (m.type === "PROGRESS") {
        setReceived(m.received); setTotal(m.total);
        if (m.percent != null) setProgress(m.percent);
      } else if (m.type === "READY") {
        setLoadStatus("ready");
        setPlaceCount(m.total);
        setProgress(100);
      } else if (m.type === "ERROR") {
        setLoadStatus("error");
        setLoadError(m.error);
      } else if (m.type === "RESULTS") {
        setResults(m.results);
      }
    };
    const url = `https://raw.githubusercontent.com/Jivaansh-Yadav/MeteoNerd/main/places/${code}.txt.gz`;
    w.postMessage({ type: "LOAD", countryCode: code, url });
  }

  useEffect(() => () => { workerRef.current?.terminate(); }, []);

  function onSearch(q: string) {
    setPlaceQ(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2 || loadStatus !== "ready") { setResults([]); return; }
    debounceRef.current = setTimeout(() => {
      workerRef.current?.postMessage({ type: "SEARCH", query: q });
    }, 300);
  }

  // Mode 3
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  function submitCoords(e: React.FormEvent) {
    e.preventDefault();
    const la = parseFloat(lat), lo = parseFloat(lon);
    if (!isFinite(la) || !isFinite(lo)) return;
    onResolve({ lat: la, lon: lo, label: "Custom Coordinates" });
  }

  const countryName = COUNTRIES.find(c => c.code === country)?.name;

  return (
    <div className="space-y-6 max-w-2xl w-full">
      {/* Mode 1 */}
      <section className="bg-card border border-border p-5" style={{ borderRadius: 4 }}>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 mono">// 01 Device Location</h2>
        <button
          onClick={useDevice}
          disabled={!geoSupported}
          title={!geoSupported ? "Your browser does not support geolocation" : undefined}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ borderRadius: 4 }}
        >
          <Crosshair size={18} />
          <span className="font-semibold text-sm">Use My Location</span>
        </button>
        {geoError && <p className="mt-2 text-xs text-destructive mono">! {geoError}</p>}
      </section>

      {/* Mode 2 */}
      <section className="bg-card border border-border p-5" style={{ borderRadius: 4 }}>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 mono">// 02 Country + Place</h2>

        <div className="relative">
          <label className="text-xs text-muted-foreground mb-1 block">Country</label>
          <div className="relative">
            <input
              value={countryQ}
              onChange={(e) => { setCountryQ(e.target.value); setShowCountryList(true); }}
              onFocus={() => setShowCountryList(true)}
              placeholder="Search 250 countries..."
              className="w-full px-3 py-2 bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ borderRadius: 4 }}
            />
            {country && (
              <button onClick={() => { setCountry(""); setCountryQ(""); setLoadStatus("idle"); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>
          {showCountryList && filteredCountries.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto bg-popover border border-border" style={{ borderRadius: 4 }}>
              {filteredCountries.slice(0, 50).map(c => (
                <li key={c.code}>
                  <button
                    onClick={() => loadCountry(c.code)}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex justify-between items-center"
                  >
                    <span>{c.name}</span>
                    <span className="mono text-xs text-muted-foreground">{c.code}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4">
          <label className="text-xs text-muted-foreground mb-1 block">Place</label>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={placeQ}
              onChange={(e) => onSearch(e.target.value)}
              disabled={loadStatus !== "ready"}
              placeholder={
                loadStatus === "idle" ? "Select a country first..." :
                loadStatus === "loading" ? `Loading places for ${countryName}...` :
                loadStatus === "error" ? "Failed to load places" :
                `Search ${placeCount.toLocaleString()} places...`
              }
              className="w-full pl-8 pr-3 py-2 bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
              style={{ borderRadius: 4 }}
            />
          </div>

          {loadStatus === "loading" && (
            <div className="mt-2">
              <div className="h-1.5 w-full bg-muted overflow-hidden" style={{ borderRadius: 4 }}>
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-[10px] mono text-muted-foreground">
                <span>{(received/1024).toFixed(0)} / {total ? (total/1024).toFixed(0) : "?"} KB</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              {country && LARGE_COUNTRIES.has(country) && (
                <p className="mt-1 text-[11px] text-warning">
                  This country has a large place dataset. Search will be available shortly.
                </p>
              )}
            </div>
          )}

          {loadStatus === "error" && (
            <p className="mt-2 text-xs text-destructive mono">! {loadError}</p>
          )}

          {results.length > 0 && (
            <ul className="mt-2 max-h-80 overflow-auto border border-border bg-popover" style={{ borderRadius: 4 }}>
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    onClick={() => onResolve({ lat: r.item.lat, lon: r.item.lon, label: `${r.item.name}${countryName ? ", " + countryName : ""}` })}
                    className="w-full text-left px-3 py-2 hover:bg-muted border-b border-border last:border-b-0"
                  >
                    <div className="text-sm"><Highlight text={r.item.name} matches={r.matches} /></div>
                    <div className="text-[11px] mono text-muted-foreground mt-0.5">
                      {Math.abs(r.item.lat).toFixed(4)}°{r.item.lat >= 0 ? "N" : "S"}  {Math.abs(r.item.lon).toFixed(4)}°{r.item.lon >= 0 ? "E" : "W"}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Mode 3 */}
      <section className="bg-card border border-border p-5" style={{ borderRadius: 4 }}>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 mono">// 03 Manual Coordinates</h2>
        <form onSubmit={submitCoords} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
          <input type="number" step="any" min="-90" max="90" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude"
            className="px-3 py-2 bg-background border border-border text-sm mono focus:outline-none focus:ring-1 focus:ring-primary" style={{ borderRadius: 4 }} required />
          <input type="number" step="any" min="-180" max="180" value={lon} onChange={(e) => setLon(e.target.value)} placeholder="Longitude"
            className="px-3 py-2 bg-background border border-border text-sm mono focus:outline-none focus:ring-1 focus:ring-primary" style={{ borderRadius: 4 }} required />
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5" style={{ borderRadius: 4 }}>
            <MapPin size={14} /> Get Weather
          </button>
        </form>
      </section>
    </div>
  );
}
