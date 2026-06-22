import { wmoText, gradientFor } from "@/lib/wmo";
import { format, dirToCardinal, formatTime, formatCoord } from "@/lib/units";
import type { UnitSystem } from "@/lib/units";
import { Sunrise, Sunset } from "lucide-react";

interface Props {
  data: any;
  location: { lat: number; lon: number; label: string };
  model: string;
  units: UnitSystem;
}

export function Hero({ data, location, model, units }: Props) {
  const cur = data?.current ?? {};
  const daily = data?.daily ?? {};
  const code = cur.weather_code;
  const isDay = cur.is_day;
  const grad = gradientFor(code, isDay);

  const sunrise = daily.sunrise?.[0];
  const sunset = daily.sunset?.[0];

  return (
    <section
      className="text-white border border-border overflow-hidden"
      style={{ background: grad, borderRadius: 4 }}
    >
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider opacity-80 mono">{location.label}</div>
            <div className="text-xs opacity-90 mono mt-0.5">{formatCoord(location.lat, location.lon)}</div>
            <div className="mt-4 mono font-bold leading-none" style={{ fontSize: 64 }}>
              {format("temperature_2m", cur.temperature_2m, units)}
            </div>
            <div className="mt-2 text-sm opacity-90">
              Feels like <span className="mono">{format("apparent_temperature", cur.apparent_temperature, units)}</span>
            </div>
            <div className="mt-1 text-sm font-semibold">{wmoText(code)}</div>
          </div>
          <div className="text-xs sm:text-right space-y-1.5 opacity-95">
            <div className="flex sm:justify-end items-center gap-1.5"><Sunrise size={14} /><span className="mono">{formatTime(sunrise)}</span></div>
            <div className="flex sm:justify-end items-center gap-1.5"><Sunset size={14} /><span className="mono">{formatTime(sunset)}</span></div>
            <div className="mono opacity-80 mt-2">MODEL: {model}</div>
            <div className="mono opacity-80">{isDay ? "DAYTIME" : "NIGHT"}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
