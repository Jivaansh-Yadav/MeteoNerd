import { CURRENT_VARS, DAILY_VARS, MINUTELY_VARS, HOURLY_PRESSURE } from "./weather-params";

const HOURLY_CORE = [
  "temperature_2m","relative_humidity_2m","dew_point_2m","apparent_temperature","wet_bulb_temperature_2m",
  "temperature_80m","temperature_120m","temperature_180m",
  "precipitation_probability","precipitation","rain","showers","snowfall","snow_depth",
  "weather_code",
  "wind_speed_10m","wind_speed_80m","wind_speed_120m","wind_speed_180m",
  "wind_direction_10m","wind_direction_80m","wind_direction_120m","wind_direction_180m","wind_gusts_10m",
  "pressure_msl","surface_pressure",
  "cloud_cover","cloud_cover_low","cloud_cover_mid","cloud_cover_high",
];

const HOURLY_ATMOS = [
  "visibility","evapotranspiration","et0_fao_evapotranspiration","vapour_pressure_deficit",
  "cape","lifted_index","convective_inhibition","freezing_level_height","boundary_layer_height",
  "total_column_integrated_water_vapour",
  "shortwave_radiation","direct_radiation","diffuse_radiation","direct_normal_irradiance",
  "global_tilted_irradiance","terrestrial_radiation",
  "shortwave_radiation_instant","direct_radiation_instant","diffuse_radiation_instant",
  "direct_normal_irradiance_instant","global_tilted_irradiance_instant","terrestrial_radiation_instant",
  "uv_index","uv_index_clear_sky","is_day","sunshine_duration",
  "soil_temperature_0cm","soil_temperature_6cm","soil_temperature_18cm","soil_temperature_54cm",
  "soil_moisture_0_to_1cm","soil_moisture_1_to_3cm","soil_moisture_3_to_9cm","soil_moisture_9_to_27cm","soil_moisture_27_to_81cm",
];

function buildUrl(lat: number, lon: number, model: string, extra: Record<string, string>) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "auto",
    forecast_days: "16",
    models: model,
    ...extra,
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

async function fetchOne(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Open-Meteo ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
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
  const urls = {
    core: buildUrl(lat, lon, model, {
      current: CURRENT_VARS.join(","),
      hourly: HOURLY_CORE.join(","),
      daily: DAILY_VARS.join(","),
    }),
    atmos: buildUrl(lat, lon, model, { hourly: HOURLY_ATMOS.join(",") }),
    pressure: buildUrl(lat, lon, model, { hourly: HOURLY_PRESSURE.join(",") }),
    minutely: buildUrl(lat, lon, model, { minutely_15: MINUTELY_VARS.join(",") }),
  };

  const [core, atmos, pressure, minutely] = await Promise.all([
    fetchOne(urls.core).catch(e => ({ __error: e instanceof Error ? e.message : String(e) })),
    fetchOne(urls.atmos).catch(e => ({ __error: e instanceof Error ? e.message : String(e) })),
    fetchOne(urls.pressure).catch(e => ({ __error: e instanceof Error ? e.message : String(e) })),
    fetchOne(urls.minutely).catch(e => ({ __error: e instanceof Error ? e.message : String(e) })),
  ]);

  const errors: WeatherResult["errors"] = {};
  if (core.__error) errors.core = core.__error;
  if (atmos.__error) errors.atmosphere = atmos.__error;
  if (pressure.__error) errors.pressureLevels = pressure.__error;
  if (minutely.__error) errors.minutely = minutely.__error;

  if (core.__error) {
    throw new Error(`Core weather call failed: ${core.__error}`);
  }

  const hourly = {
    ...(core.hourly ?? {}),
    ...(atmos.__error ? {} : atmos.hourly ?? {}),
    ...(pressure.__error ? {} : pressure.hourly ?? {}),
  };
  const hourly_units = {
    ...(core.hourly_units ?? {}),
    ...(atmos.__error ? {} : atmos.hourly_units ?? {}),
    ...(pressure.__error ? {} : pressure.hourly_units ?? {}),
  };

  return {
    latitude: core.latitude,
    longitude: core.longitude,
    timezone: core.timezone,
    elevation: core.elevation,
    current: core.current,
    current_units: core.current_units,
    daily: core.daily,
    daily_units: core.daily_units,
    hourly,
    hourly_units,
    minutely_15: minutely.__error ? undefined : minutely.minutely_15,
    minutely_15_units: minutely.__error ? undefined : minutely.minutely_15_units,
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
