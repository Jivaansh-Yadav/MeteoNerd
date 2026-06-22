import { useEffect, useRef, useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { MapPin, Search, Crosshair, X } from "lucide-react";

export type ResolvedLocation = { lat: number; lon: number; label: string };

type PlaceResult = { name: string; lat: number; lon: number };

const PLACES_API = "https://meteonerd-places.jivaanshyadav.workers.dev/search";

export function LocationInput({ onResolve }: { onResolve: (loc: ResolvedLocation) => void }) {
  // Mode 1 — Device
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

  // Mode 2 — Country + Place
  const [country, setCountry] = useState<string>("");
  const [countryQ, setCountryQ] = useState("");
  const [showCountryList, setShowCountryList] = useState(false);
  const filteredCountries = countryQ
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(countryQ.toLowerCase()) || c.code.toLowerCase() === countryQ.toLowerCase())
    : COUNTRIES;

  const [placeQ, setPlaceQ] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  function selectCountry(code: string) {
    setCountry(code);
    setShowCountryList(false);
    setCountryQ(COUNTRIES.find(c => c.code === code)?.name || code);
    setResults([]);
    setPlaceQ("");
    setSearchError(null);
  }

  function onSearch(q: string) {
    setPlaceQ(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!country) return;
    if (q.trim().length < 2) { setResults([]); setSearching(false); return; }
    debounceRef.current = setTimeout(async () => {
      const id = ++reqIdRef.current;
      setSearching(true);
      setSearchError(null);
      try {
        const url = `${PLACES_API}?country=${encodeURIComponent(country)}&q=${encodeURIComponent(q.trim())}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (id !== reqIdRef.current) return;
        setResults(Array.isArray(json.results) ? json.results : []);
      } catch (e) {
        if (id !== reqIdRef.current) return;
        setSearchError(e instanceof Error ? e.message : String(e));
        setResults([]);
      } finally {
        if (id === reqIdRef.current) setSearching(false);
      }
    }, 300);
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // Mode 3 — Manual
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
              <button onClick={() => { setCountry(""); setCountryQ(""); setResults([]); setPlaceQ(""); }}
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
                    onClick={() => selectCountry(c.code)}
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
              disabled={!country}
              placeholder={country ? `Search places in ${countryName}...` : "Select a country first..."}
              className="w-full pl-8 pr-3 py-2 bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
              style={{ borderRadius: 4 }}
            />
          </div>

          {searching && (
            <p className="mt-2 text-[11px] mono text-muted-foreground">searching…</p>
          )}

          {searchError && (
            <p className="mt-2 text-xs text-destructive mono">! {searchError}</p>
          )}

          {results.length > 0 && (
            <ul className="mt-2 max-h-80 overflow-auto border border-border bg-popover" style={{ borderRadius: 4 }}>
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    onClick={() => onResolve({ lat: r.lat, lon: r.lon, label: `${r.name}${countryName ? ", " + countryName : ""}` })}
                    className="w-full text-left px-3 py-2 hover:bg-muted border-b border-border last:border-b-0"
                  >
                    <div className="text-sm">{r.name}</div>
                    <div className="text-[11px] mono text-muted-foreground mt-0.5">
                      {Math.abs(r.lat).toFixed(4)}°{r.lat >= 0 ? "N" : "S"}  {Math.abs(r.lon).toFixed(4)}°{r.lon >= 0 ? "E" : "W"}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!searching && !searchError && results.length === 0 && placeQ.trim().length >= 2 && country && (
            <p className="mt-2 text-[11px] mono text-muted-foreground">no matches</p>
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
