// Parameter groupings, labels, and units for the Open-Meteo forecast call
export const PRESSURE_LEVELS = [1000,975,950,925,900,850,800,700,600,500,400,300,250,200,150,100,70,50,30];
export const PRESSURE_VARS = ["temperature","relative_humidity","cloud_cover","wind_speed","wind_direction","geopotential_height"] as const;

export const CURRENT_VARS = [
  "temperature_2m","relative_humidity_2m","apparent_temperature","is_day","precipitation","rain","showers","snowfall",
  "weather_code","cloud_cover","pressure_msl","surface_pressure","wind_speed_10m","wind_direction_10m","wind_gusts_10m",
];

export const HOURLY_BASE = [
  "temperature_2m","relative_humidity_2m","dew_point_2m","apparent_temperature","wet_bulb_temperature_2m",
  "temperature_80m","temperature_120m","temperature_180m",
  "precipitation_probability","precipitation","rain","showers","snowfall","snow_depth","weather_code",
  "wind_speed_10m","wind_speed_80m","wind_speed_120m","wind_speed_180m",
  "wind_direction_10m","wind_direction_80m","wind_direction_120m","wind_direction_180m","wind_gusts_10m",
  "pressure_msl","surface_pressure",
  "cloud_cover","cloud_cover_low","cloud_cover_mid","cloud_cover_high",
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

export const HOURLY_PRESSURE = PRESSURE_LEVELS.flatMap(l =>
  PRESSURE_VARS.map(v => `${v}_${l}hPa`)
);

export const HOURLY_VARS = [...HOURLY_BASE, ...HOURLY_PRESSURE];

export const MINUTELY_VARS = [
  "temperature_2m","relative_humidity_2m","dew_point_2m","apparent_temperature","precipitation","rain","snowfall",
  "snowfall_height","freezing_level_height","sunshine_duration","weather_code",
  "wind_speed_10m","wind_speed_80m","wind_direction_10m","wind_direction_80m","wind_gusts_10m",
  "visibility","cape","lightning_potential_index","is_day",
  "shortwave_radiation","direct_radiation","diffuse_radiation","direct_normal_irradiance",
  "global_tilted_irradiance","terrestrial_radiation",
  "shortwave_radiation_instant","direct_radiation_instant","diffuse_radiation_instant",
  "direct_normal_irradiance_instant","global_tilted_irradiance_instant","terrestrial_radiation_instant",
];

export const DAILY_VARS = [
  "weather_code",
  "temperature_2m_max","temperature_2m_min","temperature_2m_mean",
  "apparent_temperature_max","apparent_temperature_min","apparent_temperature_mean",
  "sunrise","sunset","daylight_duration","sunshine_duration",
  "uv_index_max","uv_index_clear_sky_max",
  "precipitation_sum","rain_sum","showers_sum","snowfall_sum","precipitation_hours",
  "precipitation_probability_max","precipitation_probability_mean","precipitation_probability_min",
  "wind_speed_10m_max","wind_speed_10m_mean","wind_speed_10m_min",
  "wind_gusts_10m_max","wind_gusts_10m_mean","wind_gusts_10m_min",
  "wind_direction_10m_dominant","shortwave_radiation_sum",
  "et0_fao_evapotranspiration","et0_fao_evapotranspiration_sum",
  "cape_mean","cape_max","cape_min",
  "cloud_cover_mean","cloud_cover_max","cloud_cover_min",
  "dew_point_2m_mean","dew_point_2m_max","dew_point_2m_min",
  "relative_humidity_2m_mean","relative_humidity_2m_max","relative_humidity_2m_min",
  "pressure_msl_mean","pressure_msl_max","pressure_msl_min",
  "surface_pressure_mean","surface_pressure_max","surface_pressure_min",
  "visibility_mean","visibility_max","visibility_min",
  "wet_bulb_temperature_2m_mean","wet_bulb_temperature_2m_max","wet_bulb_temperature_2m_min",
  "vapour_pressure_deficit_max","snowfall_water_equivalent_sum",
  "growing_degree_days_base_0_limit_50","leaf_wetness_probability_mean","updraft_max",
];

// Human-readable labels
export const LABELS: Record<string, string> = {
  temperature_2m: "Temperature (2 m)",
  relative_humidity_2m: "Relative Humidity (2 m)",
  dew_point_2m: "Dew Point (2 m)",
  apparent_temperature: "Apparent Temperature",
  wet_bulb_temperature_2m: "Wet Bulb Temperature (2 m)",
  temperature_80m: "Temperature (80 m)",
  temperature_120m: "Temperature (120 m)",
  temperature_180m: "Temperature (180 m)",
  is_day: "Is Day",
  precipitation: "Precipitation",
  rain: "Rain",
  showers: "Showers",
  snowfall: "Snowfall",
  snow_depth: "Snow Depth",
  snowfall_height: "Snowfall Height",
  snowfall_water_equivalent_sum: "Snowfall Water Equivalent Sum",
  precipitation_probability: "Precipitation Probability",
  precipitation_probability_max: "Precip Probability (max)",
  precipitation_probability_mean: "Precip Probability (mean)",
  precipitation_probability_min: "Precip Probability (min)",
  precipitation_sum: "Precipitation Sum",
  precipitation_hours: "Precipitation Hours",
  rain_sum: "Rain Sum",
  showers_sum: "Showers Sum",
  snowfall_sum: "Snowfall Sum",
  weather_code: "Weather Code",
  cloud_cover: "Cloud Cover",
  cloud_cover_low: "Cloud Cover (Low)",
  cloud_cover_mid: "Cloud Cover (Mid)",
  cloud_cover_high: "Cloud Cover (High)",
  cloud_cover_mean: "Cloud Cover (Mean)",
  cloud_cover_max: "Cloud Cover (Max)",
  cloud_cover_min: "Cloud Cover (Min)",
  pressure_msl: "Sea Level Pressure",
  surface_pressure: "Surface Pressure",
  wind_speed_10m: "Wind Speed (10 m)",
  wind_speed_80m: "Wind Speed (80 m)",
  wind_speed_120m: "Wind Speed (120 m)",
  wind_speed_180m: "Wind Speed (180 m)",
  wind_direction_10m: "Wind Direction (10 m)",
  wind_direction_80m: "Wind Direction (80 m)",
  wind_direction_120m: "Wind Direction (120 m)",
  wind_direction_180m: "Wind Direction (180 m)",
  wind_gusts_10m: "Wind Gusts (10 m)",
  visibility: "Visibility",
  evapotranspiration: "Evapotranspiration",
  et0_fao_evapotranspiration: "Reference ET₀",
  et0_fao_evapotranspiration_sum: "Reference ET₀ Sum",
  vapour_pressure_deficit: "Vapour Pressure Deficit",
  vapour_pressure_deficit_max: "VPD (max)",
  cape: "CAPE",
  cape_mean: "CAPE (mean)", cape_max: "CAPE (max)", cape_min: "CAPE (min)",
  lifted_index: "Lifted Index",
  convective_inhibition: "Convective Inhibition (CIN)",
  freezing_level_height: "Freezing Level Height",
  boundary_layer_height: "Boundary Layer Height",
  total_column_integrated_water_vapour: "Total Column Water Vapour",
  shortwave_radiation: "Shortwave Radiation (GHI)",
  direct_radiation: "Direct Radiation",
  diffuse_radiation: "Diffuse Radiation (DHI)",
  direct_normal_irradiance: "Direct Normal Irradiance (DNI)",
  global_tilted_irradiance: "Global Tilted Irradiance (GTI)",
  terrestrial_radiation: "Terrestrial Radiation",
  shortwave_radiation_instant: "Shortwave Radiation (instant)",
  direct_radiation_instant: "Direct Radiation (instant)",
  diffuse_radiation_instant: "Diffuse Radiation (instant)",
  direct_normal_irradiance_instant: "DNI (instant)",
  global_tilted_irradiance_instant: "GTI (instant)",
  terrestrial_radiation_instant: "Terrestrial Radiation (instant)",
  shortwave_radiation_sum: "Shortwave Radiation Sum",
  uv_index: "UV Index",
  uv_index_clear_sky: "UV Index (clear sky)",
  uv_index_max: "UV Index (max)",
  uv_index_clear_sky_max: "UV Index Clear Sky (max)",
  sunshine_duration: "Sunshine Duration",
  daylight_duration: "Daylight Duration",
  sunrise: "Sunrise", sunset: "Sunset",
  soil_temperature_0cm: "Soil Temp (0 cm)",
  soil_temperature_6cm: "Soil Temp (6 cm)",
  soil_temperature_18cm: "Soil Temp (18 cm)",
  soil_temperature_54cm: "Soil Temp (54 cm)",
  soil_moisture_0_to_1cm: "Soil Moisture (0–1 cm)",
  soil_moisture_1_to_3cm: "Soil Moisture (1–3 cm)",
  soil_moisture_3_to_9cm: "Soil Moisture (3–9 cm)",
  soil_moisture_9_to_27cm: "Soil Moisture (9–27 cm)",
  soil_moisture_27_to_81cm: "Soil Moisture (27–81 cm)",
  lightning_potential_index: "Lightning Potential Index",
  temperature_2m_max: "Temp Max (2m)", temperature_2m_min: "Temp Min (2m)", temperature_2m_mean: "Temp Mean (2m)",
  apparent_temperature_max: "Apparent Temp (max)", apparent_temperature_min: "Apparent Temp (min)", apparent_temperature_mean: "Apparent Temp (mean)",
  wind_speed_10m_max: "Wind Speed (max)", wind_speed_10m_mean: "Wind Speed (mean)", wind_speed_10m_min: "Wind Speed (min)",
  wind_gusts_10m_max: "Wind Gusts (max)", wind_gusts_10m_mean: "Wind Gusts (mean)", wind_gusts_10m_min: "Wind Gusts (min)",
  wind_direction_10m_dominant: "Wind Direction (dominant)",
  dew_point_2m_mean: "Dew Point (mean)", dew_point_2m_max: "Dew Point (max)", dew_point_2m_min: "Dew Point (min)",
  relative_humidity_2m_mean: "RH (mean)", relative_humidity_2m_max: "RH (max)", relative_humidity_2m_min: "RH (min)",
  pressure_msl_mean: "Pressure MSL (mean)", pressure_msl_max: "Pressure MSL (max)", pressure_msl_min: "Pressure MSL (min)",
  surface_pressure_mean: "Surface Pressure (mean)", surface_pressure_max: "Surface Pressure (max)", surface_pressure_min: "Surface Pressure (min)",
  visibility_mean: "Visibility (mean)", visibility_max: "Visibility (max)", visibility_min: "Visibility (min)",
  wet_bulb_temperature_2m_mean: "Wet Bulb (mean)", wet_bulb_temperature_2m_max: "Wet Bulb (max)", wet_bulb_temperature_2m_min: "Wet Bulb (min)",
  growing_degree_days_base_0_limit_50: "GDD (base 0, limit 50)",
  leaf_wetness_probability_mean: "Leaf Wetness Probability (mean)",
  updraft_max: "Max Updraft",
};

export function labelOf(key: string): string {
  if (LABELS[key]) return LABELS[key];
  // pressure level fields
  const m = key.match(/^(temperature|relative_humidity|cloud_cover|wind_speed|wind_direction|geopotential_height)_(\d+)hPa$/);
  if (m) {
    const map: Record<string, string> = {
      temperature: "Temperature", relative_humidity: "Rel. Humidity",
      cloud_cover: "Cloud Cover", wind_speed: "Wind Speed",
      wind_direction: "Wind Direction", geopotential_height: "Geopotential Height",
    };
    return `${map[m[1]]} (${m[2]} hPa)`;
  }
  return key;
}

// Unit kind for a key — used by unit conversion + formatting
export type UnitKind =
  | "temp" | "speed" | "precip" | "pressure" | "distance"
  | "percent" | "watt" | "joule" | "height" | "radians" | "deg" | "seconds"
  | "moisture" | "time" | "code" | "bool" | "raw" | "vapour" | "lifted";

export function kindOf(key: string): UnitKind {
  if (/temperature|dew_point|wet_bulb|apparent/.test(key)) return "temp";
  if (key.startsWith("wind_speed") || key.startsWith("wind_gusts")) return "speed";
  if (key.startsWith("wind_direction")) return "deg";
  if (/^precip|rain|showers|snowfall(_sum|_water_equivalent_sum)?$|snow_depth/.test(key)) return "precip";
  if (key === "snowfall_height" || key === "freezing_level_height" || key === "boundary_layer_height" || key === "updraft_max" || key.startsWith("geopotential_height")) return "height";
  if (key.includes("pressure")) return "pressure";
  if (key === "visibility" || key.startsWith("visibility")) return "distance";
  if (key.includes("probability") || key.includes("cloud_cover") || key === "relative_humidity_2m" || key.startsWith("relative_humidity") || key.includes("leaf_wetness") || key === "is_day") return "percent";
  if (key.includes("radiation") || key.includes("irradiance")) return "watt";
  if (key === "cape" || key.startsWith("cape_")) return "joule";
  if (key.includes("duration")) return "seconds";
  if (key === "weather_code") return "code";
  if (key.startsWith("soil_moisture")) return "moisture";
  if (key === "sunrise" || key === "sunset") return "time";
  if (key === "vapour_pressure_deficit" || key === "vapour_pressure_deficit_max") return "vapour";
  if (key === "lifted_index" || key === "convective_inhibition" || key === "lightning_potential_index" || key === "uv_index" || key === "uv_index_clear_sky" || key === "uv_index_max" || key === "uv_index_clear_sky_max" || key === "growing_degree_days_base_0_limit_50") return "raw";
  if (key === "total_column_integrated_water_vapour") return "vapour";
  return "raw";
}
