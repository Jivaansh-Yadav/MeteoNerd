import { CURRENT_VARS, DAILY_VARS, MINUTELY_VARS, HOURLY_BASE, HOURLY_PRESSURE } from "./weather-params";

const CHUNK_SIZE = 10;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildUrl(lat: number, lon: number, model: string, extra: Record<string, string>) {
  const params: Record<string, string> = {
    latitude: String(lat),
    longitude: String(lon),
    timezone: "auto",
    forecast_days: "16",
    ...extra,
  };
  if (model && model !== "auto") params.models = model;
  return `https://api.open-meteo.com/v1/forecast?${new URLSearchParams(params).toString()}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOne(url: string): Promise<any> {
  const res = await fetch(url);

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    const error: any = new Error("429");
    error.retryAfter = retryAfter;
    throw error;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Open-Meteo ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

async function safeFetch(url: string): Promise<any> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await fetchOne(url);
    } catch (e: any) {
      const msg = e?.message || String(e);

      if (msg === "429") {
        const retryAfter =
          Number(e.retryAfter) > 0
            ? Number(e.retryAfter) * 1000
            : 1000 * Math.pow(2, attempt);

        await sleep(retryAfter);
        continue;
      }

      return { __error: msg };
    }
  }

  return { __error: "Too many retries" };
}

async function fetchWithLimit(
  urls: { kind: string; url: string }[],
  concurrency = 3,
  delayMs = 100
) {
  const results: any[] = new Array(urls.length);
  let index = 0;

  async function worker() {
    while (true) {
      const current = index++;

      if (current >= urls.length) {
        break;
      }

      results[current] = await safeFetch(urls[current].url);

      await sleep(delayMs);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, urls.length) },
      () => worker()
    )
  );

  return results;
}

export interface WeatherResult {
  current?: any;
  current_units?: any;
  hourly: any;
  hourly_units?: any;
  daily?: any;
  daily_units?: any;
  minutely_15?: any;
  minutely_15_units?: any;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  elevation?: number;
  errors: { pressureLevels?: string; atmosphere?: string; minutely?: string; core?: string };
}

export async function fetchWeather(lat: number, lon: number, model: string): Promise<WeatherResult> {
  // Build all chunked URLs
  const currentChunks = chunk(CURRENT_VARS, CHUNK_SIZE);
  const hourlyBaseChunks = chunk(HOURLY_BASE, CHUNK_SIZE);
  const hourlyPressureChunks = chunk(HOURLY_PRESSURE, CHUNK_SIZE);
  const dailyChunks = chunk(DAILY_VARS, CHUNK_SIZE);
  const minutelyChunks = chunk(MINUTELY_VARS, CHUNK_SIZE);

  const currentUrls = currentChunks.map((c) => buildUrl(lat, lon, model, { current: c.join(",") }));
  const hourlyBaseUrls = hourlyBaseChunks.map((c) => buildUrl(lat, lon, model, { hourly: c.join(",") }));
  const hourlyPressureUrls = hourlyPressureChunks.map((c) => buildUrl(lat, lon, model, { hourly: c.join(",") }));
  const dailyUrls = dailyChunks.map((c) => buildUrl(lat, lon, model, { daily: c.join(",") }));
  const minutelyUrls = minutelyChunks.map((c) => buildUrl(lat, lon, model, { minutely_15: c.join(",") }));

  const allUrls = [
    ...currentUrls.map((u) => ({ kind: "current" as const, url: u })),
    ...hourlyBaseUrls.map((u) => ({ kind: "hourlyBase" as const, url: u })),
    ...hourlyPressureUrls.map((u) => ({ kind: "hourlyPressure" as const, url: u })),
    ...dailyUrls.map((u) => ({ kind: "daily" as const, url: u })),
    ...minutelyUrls.map((u) => ({ kind: "minutely" as const, url: u })),
  ];

  const results = await fetchWithLimit(allUrls, 3, 100);

  const errors: WeatherResult["errors"] = {};
  let meta: any = {};
  let current: any = {};
  let current_units: any = {};
  let hourly: any = {};
  let hourly_units: any = {};
  let daily: any = {};
  let daily_units: any = {};
  let minutely_15: any = {};
  let minutely_15_units: any = {};

  let coreErrCount = 0;
  let pressureErrCount = 0;
  let minutelyErrCount = 0;

  results.forEach((r, i) => {
    const kind = allUrls[i].kind;
    if (r.__error) {
      if (kind === "current" || kind === "hourlyBase" || kind === "daily") {
        coreErrCount++;
        if (!errors.core) errors.core = r.__error;
      } else if (kind === "hourlyPressure") {
        pressureErrCount++;
        if (!errors.pressureLevels) errors.pressureLevels = r.__error;
      } else if (kind === "minutely") {
        minutelyErrCount++;
        if (!errors.minutely) errors.minutely = r.__error;
      }
      return;
    }
    if (!meta.latitude && r.latitude !== undefined) {
      meta = { latitude: r.latitude, longitude: r.longitude, timezone: r.timezone, elevation: r.elevation };
    }
    if (r.current) Object.assign(current, r.current);
    if (r.current_units) Object.assign(current_units, r.current_units);
    if (r.hourly) Object.assign(hourly, r.hourly);
    if (r.hourly_units) Object.assign(hourly_units, r.hourly_units);
    if (r.daily) Object.assign(daily, r.daily);
    if (r.daily_units) Object.assign(daily_units, r.daily_units);
    if (r.minutely_15) Object.assign(minutely_15, r.minutely_15);
    if (r.minutely_15_units) Object.assign(minutely_15_units, r.minutely_15_units);
  });

  if (Object.keys(hourly).length === 0 && coreErrCount > 0) {
    throw new Error(`Core weather call failed: ${errors.core}`);
  }

  return {
    ...meta,
    current,
    current_units,
    hourly,
    hourly_units,
    daily,
    daily_units,
    minutely_15: minutelyErrCount === minutelyUrls.length ? undefined : minutely_15,
    minutely_15_units: minutelyErrCount === minutelyUrls.length ? undefined : minutely_15_units,
    errors,
  };
}

export const MODELS: { value: string; label: string }[] = [
  { value: "auto", label: "Best Match (auto)" },
  { value: "ecmwf_ifs025", label: "ECMWF IFS 0.25°" },
  { value: "ecmwf_ifs_analysis_long_window", label: "ECMWF IFS HRES 9km" },
  { value: "gfs_seamless", label: "NCEP GFS Seamless" },
  { value: "icon_seamless", label: "DWD ICON Seamless" },
  { value: "jma_seamless", label: "JMA Seamless" },
  { value: "gem_seamless", label: "GEM Canada Seamless" },
  { value: "meteofrance_seamless", label: "Météo-France Seamless" },
  { value: "ukmo_seamless", label: "UK Met Office Seamless" },
  { value: "kma_seamless", label: "KMA Korea Seamless" },
  { value: "cma_grapes_global", label: "CMA GRAPES Global" },
  { value: "bom_access_global", label: "BOM ACCESS Global" },
];

export function supportsNativeMinutely15(lat: number, lon: number): boolean {
  const europe = lat >= 35 && lat <= 60 && lon >= -10 && lon <= 30;
  const namerica = lat >= 20 && lat <= 75 && lon >= -170 && lon <= -50;
  return europe || namerica;
}
