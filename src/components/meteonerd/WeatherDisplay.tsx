import { AccordionSection, ParamGrid } from "./AccordionSection";
import { labelOf } from "@/lib/weather-params";
import { format, dirToCardinal, formatTime } from "@/lib/units";
import type { UnitSystem } from "@/lib/units";
import { wmoText } from "@/lib/wmo";
import { PRESSURE_LEVELS } from "@/lib/weather-params";
import { supportsNativeMinutely15 } from "@/lib/weather";
import {
  Activity, Thermometer, Wind, CloudRain, Cloud, Sun, Sprout,
  Gauge, Layers, Clock, CalendarDays, Timer,
} from "lucide-react";

interface Props {
  data: any;
  units: UnitSystem;
  lat: number;
  lon: number;
}

function rowsFor(keys: string[], source: any, idx: number | null, units: UnitSystem) {
  return keys.map(k => {
    const v = idx == null ? source?.[k] : source?.[k]?.[idx];
    let value = format(k, v, units);
    if (k === "weather_code") value = `${v ?? "—"} · ${wmoText(v)}`;
    if (k.startsWith("wind_direction") && typeof v === "number") value = `${v.toFixed(0)}° ${dirToCardinal(v)}`;
    if (k === "sunrise" || k === "sunset") value = formatTime(v);
    return { label: labelOf(k), value };
  });
}

export function WeatherDisplay({ data, units, lat, lon }: Props) {
  const cur = data.current ?? {};
  const hourly = data.hourly ?? {};
  const min15 = data.minutely_15 ?? {};
  const daily = data.daily ?? {};

  // index of current hour in hourly arrays
  const nowIso = new Date().toISOString().slice(0, 13);
  const hourTimes: string[] = hourly.time ?? [];
  const curHourIdx = Math.max(0, hourTimes.findIndex(t => t.startsWith(nowIso)));

  return (
    <div className="space-y-3">
      {/* Current Conditions */}
      <AccordionSection
        title="Current Conditions"
        icon={<Activity size={16} />}
        accentColor="#00A8E8"
        defaultOpen
        rawJson={cur}
      >
        <ParamGrid rows={rowsFor([
          "temperature_2m","apparent_temperature","relative_humidity_2m","is_day","weather_code",
          "precipitation","rain","showers","snowfall",
          "cloud_cover","pressure_msl","surface_pressure",
          "wind_speed_10m","wind_direction_10m","wind_gusts_10m",
        ], cur, null, units)} />
      </AccordionSection>

      {/* Temperature & Humidity */}
      <AccordionSection title="Temperature & Humidity" icon={<Thermometer size={16} />} accentColor="#E05C2A"
        rawJson={pick(hourly, [
          "temperature_2m","relative_humidity_2m","dew_point_2m","apparent_temperature","wet_bulb_temperature_2m",
          "total_column_integrated_water_vapour","temperature_80m","temperature_120m","temperature_180m"
        ], curHourIdx)}>
        <ParamGrid rows={rowsFor([
          "temperature_2m","relative_humidity_2m","dew_point_2m","apparent_temperature","wet_bulb_temperature_2m",
          "total_column_integrated_water_vapour","temperature_80m","temperature_120m","temperature_180m",
        ], hourly, curHourIdx, units)} />
      </AccordionSection>

      {/* Wind */}
      <AccordionSection title="Wind" icon={<Wind size={16} />} accentColor="#0EA5B0"
        rawJson={pick(hourly, [
          "wind_speed_10m","wind_speed_80m","wind_speed_120m","wind_speed_180m",
          "wind_direction_10m","wind_direction_80m","wind_direction_120m","wind_direction_180m","wind_gusts_10m"
        ], curHourIdx)}>
        <ParamGrid rows={rowsFor([
          "wind_speed_10m","wind_speed_80m","wind_speed_120m","wind_speed_180m",
          "wind_direction_10m","wind_direction_80m","wind_direction_120m","wind_direction_180m","wind_gusts_10m",
        ], hourly, curHourIdx, units)} />
      </AccordionSection>

      {/* Precipitation */}
      <AccordionSection title="Precipitation" icon={<CloudRain size={16} />} accentColor="#3B6FCC"
        rawJson={{ hourly: pick(hourly, ["precipitation","rain","showers","snowfall","snow_depth","precipitation_probability"], curHourIdx),
                   daily: pick(daily, ["precipitation_sum","rain_sum","showers_sum","snowfall_sum","precipitation_hours","precipitation_probability_max","snowfall_water_equivalent_sum"], 0) }}>
        <ParamGrid rows={[
          ...rowsFor(["precipitation","rain","showers","snowfall","snow_depth","precipitation_probability"], hourly, curHourIdx, units),
          ...rowsFor(["precipitation_sum","rain_sum","showers_sum","snowfall_sum","precipitation_hours","precipitation_probability_max","precipitation_probability_mean","precipitation_probability_min","snowfall_water_equivalent_sum"], daily, 0, units),
        ]} />
      </AccordionSection>

      {/* Cloud & Atmosphere */}
      <AccordionSection title="Cloud & Atmosphere" icon={<Cloud size={16} />} accentColor="#6B7A8D"
        rawJson={pick(hourly, ["cloud_cover","cloud_cover_low","cloud_cover_mid","cloud_cover_high","visibility","evapotranspiration","et0_fao_evapotranspiration","vapour_pressure_deficit","boundary_layer_height"], curHourIdx)}>
        <ParamGrid rows={rowsFor([
          "cloud_cover","cloud_cover_low","cloud_cover_mid","cloud_cover_high","visibility",
          "evapotranspiration","et0_fao_evapotranspiration","vapour_pressure_deficit","boundary_layer_height",
        ], hourly, curHourIdx, units)} />
      </AccordionSection>

      {/* Solar & Radiation */}
      <AccordionSection title="Solar & Radiation" icon={<Sun size={16} />} accentColor="#D4920A"
        rawJson={pick(hourly, [
          "shortwave_radiation","direct_radiation","diffuse_radiation","direct_normal_irradiance",
          "global_tilted_irradiance","terrestrial_radiation",
          "shortwave_radiation_instant","direct_radiation_instant","diffuse_radiation_instant",
          "direct_normal_irradiance_instant","global_tilted_irradiance_instant","terrestrial_radiation_instant",
          "sunshine_duration","uv_index","uv_index_clear_sky"
        ], curHourIdx)}>
        <ParamGrid rows={rowsFor([
          "shortwave_radiation","direct_radiation","diffuse_radiation","direct_normal_irradiance",
          "global_tilted_irradiance","terrestrial_radiation",
          "shortwave_radiation_instant","direct_radiation_instant","diffuse_radiation_instant",
          "direct_normal_irradiance_instant","global_tilted_irradiance_instant","terrestrial_radiation_instant",
          "sunshine_duration","uv_index","uv_index_clear_sky",
        ], hourly, curHourIdx, units)} />
      </AccordionSection>

      {/* Soil */}
      <AccordionSection title="Soil" icon={<Sprout size={16} />} accentColor="#7A5C3A"
        rawJson={pick(hourly, [
          "soil_temperature_0cm","soil_temperature_6cm","soil_temperature_18cm","soil_temperature_54cm",
          "soil_moisture_0_to_1cm","soil_moisture_1_to_3cm","soil_moisture_3_to_9cm","soil_moisture_9_to_27cm","soil_moisture_27_to_81cm"
        ], curHourIdx)}>
        <ParamGrid rows={rowsFor([
          "soil_temperature_0cm","soil_temperature_6cm","soil_temperature_18cm","soil_temperature_54cm",
          "soil_moisture_0_to_1cm","soil_moisture_1_to_3cm","soil_moisture_3_to_9cm","soil_moisture_9_to_27cm","soil_moisture_27_to_81cm",
        ], hourly, curHourIdx, units)} />
      </AccordionSection>

      {/* Pressure & Instability */}
      <AccordionSection title="Pressure & Instability" icon={<Gauge size={16} />} accentColor="#6A3ACC"
        rawJson={pick(hourly, ["surface_pressure","pressure_msl","cape","lifted_index","convective_inhibition","freezing_level_height"], curHourIdx)}>
        <ParamGrid rows={rowsFor([
          "surface_pressure","pressure_msl","cape","lifted_index","convective_inhibition","freezing_level_height",
        ], hourly, curHourIdx, units)} />
      </AccordionSection>

      {/* Upper Air */}
      <AccordionSection title="Upper Air / Pressure Levels" icon={<Layers size={16} />} accentColor="#8B5CF6">
        <div className="overflow-auto">
          <table className="w-full text-[12px] mono">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-2">Level</th>
                <th className="text-right py-2 px-2">Temp</th>
                <th className="text-right py-2 px-2">RH</th>
                <th className="text-right py-2 px-2">Cloud</th>
                <th className="text-right py-2 px-2">Wind Spd</th>
                <th className="text-right py-2 px-2">Wind Dir</th>
                <th className="text-right py-2 px-2">Geo Height</th>
              </tr>
            </thead>
            <tbody>
              {PRESSURE_LEVELS.map(l => (
                <tr key={l} className="border-b border-border">
                  <td className="py-1.5 px-2">{l} hPa</td>
                  <td className="text-right px-2">{format("temperature_2m", hourly[`temperature_${l}hPa`]?.[curHourIdx], units)}</td>
                  <td className="text-right px-2">{format("relative_humidity_2m", hourly[`relative_humidity_${l}hPa`]?.[curHourIdx], units)}</td>
                  <td className="text-right px-2">{format("cloud_cover", hourly[`cloud_cover_${l}hPa`]?.[curHourIdx], units)}</td>
                  <td className="text-right px-2">{format("wind_speed_10m", hourly[`wind_speed_${l}hPa`]?.[curHourIdx], units)}</td>
                  <td className="text-right px-2">{(() => { const v = hourly[`wind_direction_${l}hPa`]?.[curHourIdx]; return v == null ? "—" : `${v.toFixed(0)}° ${dirToCardinal(v)}`; })()}</td>
                  <td className="text-right px-2">{format("freezing_level_height", hourly[`geopotential_height_${l}hPa`]?.[curHourIdx], units)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccordionSection>

      {/* 15-Minutely */}
      <AccordionSection title="15-Minutely" icon={<Timer size={16} />} accentColor="#0891B2"
        rawJson={min15}>
        {!supportsNativeMinutely15(lat, lon) && (
          <p className="text-[11px] text-warning mb-3">15-min data is interpolated for this region.</p>
        )}
        <div className="overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            {(min15.time ?? []).slice(0, 96).map((t: string, i: number) => (
              <div key={i} className="border border-border p-2 text-[11px] mono min-w-[110px]" style={{ borderRadius: 4 }}>
                <div className="text-muted-foreground">{t.slice(11, 16)}</div>
                <div className="mt-1">{format("temperature_2m", min15.temperature_2m?.[i], units)}</div>
                <div className="text-muted-foreground">{format("precipitation", min15.precipitation?.[i], units)}</div>
                <div className="text-muted-foreground">{format("wind_speed_10m", min15.wind_speed_10m?.[i], units)}</div>
                <div className="text-muted-foreground text-[10px]">{wmoText(min15.weather_code?.[i])}</div>
              </div>
            ))}
          </div>
        </div>
      </AccordionSection>

      {/* Hourly */}
      <AccordionSection title="Hourly Forecast (168h)" icon={<Clock size={16} />} accentColor="#2A8A4A">
        <div className="overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            {hourTimes.slice(0, 168).map((t: string, i: number) => {
              const isNow = i === curHourIdx;
              return (
                <div key={i}
                  className="border p-2 text-[11px] mono min-w-[110px]"
                  style={{
                    borderRadius: 4,
                    borderColor: isNow ? "#00A8E8" : "var(--color-border)",
                    background: isNow ? "color-mix(in oklab, #00A8E8 12%, transparent)" : undefined,
                  }}
                >
                  <div className="text-muted-foreground">{t.slice(5, 10)} {t.slice(11, 16)}</div>
                  <div className="mt-1 font-semibold">{format("temperature_2m", hourly.temperature_2m?.[i], units)}</div>
                  <div className="text-muted-foreground">feels {format("apparent_temperature", hourly.apparent_temperature?.[i], units)}</div>
                  <div className="text-muted-foreground">{hourly.precipitation_probability?.[i] ?? "—"}% precip</div>
                  <div className="text-muted-foreground">{format("wind_speed_10m", hourly.wind_speed_10m?.[i], units)}</div>
                  <div className="text-muted-foreground">UV {hourly.uv_index?.[i]?.toFixed?.(1) ?? "—"}</div>
                  <div className="text-muted-foreground text-[10px]">{wmoText(hourly.weather_code?.[i])}</div>
                </div>
              );
            })}
          </div>
        </div>
      </AccordionSection>

      {/* Daily */}
      <AccordionSection title="Daily Summary (16d)" icon={<CalendarDays size={16} />} accentColor="#1A6A9A"
        rawJson={daily}>
        <DailyTable daily={daily} units={units} />
      </AccordionSection>
    </div>
  );
}

function pick(src: any, keys: string[], idx: number) {
  const out: Record<string, unknown> = {};
  for (const k of keys) out[k] = src?.[k]?.[idx] ?? null;
  return out;
}

function DailyTable({ daily, units }: { daily: any; units: UnitSystem }) {
  const days: string[] = daily.time ?? [];
  const keys = Object.keys(daily).filter(k => k !== "time");
  return (
    <div className="overflow-auto max-h-[600px]">
      <table className="text-[11px] mono w-full">
        <thead className="sticky top-0 bg-card z-10">
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2 px-2 sticky left-0 bg-card">Parameter</th>
            {days.map(d => <th key={d} className="text-right px-2 py-2 whitespace-nowrap">{d.slice(5)}</th>)}
          </tr>
        </thead>
        <tbody>
          {keys.map(k => (
            <tr key={k} className="border-b border-border">
              <td className="text-left py-1.5 px-2 sticky left-0 bg-card text-muted-foreground whitespace-nowrap">{labelOf(k)}</td>
              {days.map((_, i) => {
                let v: unknown = daily[k]?.[i];
                let s: string;
                if (k === "sunrise" || k === "sunset") s = formatTime(v as string);
                else if (k === "weather_code") s = wmoText(v as number);
                else s = format(k, v, units);
                return <td key={i} className="text-right px-2 py-1.5 whitespace-nowrap">{s}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
