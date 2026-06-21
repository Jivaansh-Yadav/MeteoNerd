import { CURRENT_VARS, HOURLY_VARS, MINUTELY_VARS, DAILY_VARS } from "./weather-params";

export async function fetchWeather(lat: number, lon: number, model: string): Promise<any> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "auto",
    forecast_days: "16",
    models: model,
    current: CURRENT_VARS.join(","),
    hourly: HOURLY_VARS.join(","),
    minutely_15: MINUTELY_VARS.join(","),
    daily: DAILY_VARS.join(","),
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Open-Meteo ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
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

// Region check for native 15-min support: Central Europe + North America
export function supportsNativeMinutely15(lat: number, lon: number): boolean {
  const europe = lat >= 35 && lat <= 60 && lon >= -10 && lon <= 30;
  const namerica = lat >= 20 && lat <= 75 && lon >= -170 && lon <= -50;
  return europe || namerica;
}
