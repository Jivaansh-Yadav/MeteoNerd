import { kindOf, UnitKind } from "./weather-params";

export type UnitSystem = "metric" | "imperial";

export function format(key: string, value: unknown, system: UnitSystem): string {
  if (value == null || value === "") return "—";
  if (typeof value === "string") return value;
  if (typeof value !== "number" || !isFinite(value)) return "—";
  const k = kindOf(key);
  const m = system === "metric";
  switch (k) {
    case "temp": return m ? `${value.toFixed(1)}°C` : `${(value*9/5+32).toFixed(1)}°F`;
    case "speed": return m ? `${value.toFixed(1)} km/h` : `${(value*0.621371).toFixed(1)} mph`;
    case "precip": return m ? `${value.toFixed(2)} mm` : `${(value/25.4).toFixed(3)} in`;
    case "pressure": return m ? `${value.toFixed(1)} hPa` : `${(value*0.02953).toFixed(2)} inHg`;
    case "distance": return m ? `${(value/1000).toFixed(2)} km` : `${(value/1609.34).toFixed(2)} mi`;
    case "height": return m ? `${value.toFixed(0)} m` : `${(value*3.28084).toFixed(0)} ft`;
    case "percent": {
      if (key === "is_day") return value ? "Day" : "Night";
      return `${value.toFixed(0)}%`;
    }
    case "watt": return `${value.toFixed(1)} W/m²`;
    case "joule": return `${value.toFixed(0)} J/kg`;
    case "seconds": {
      const s = Math.round(value);
      const h = Math.floor(s/3600), mn = Math.floor((s%3600)/60);
      return `${h}h ${mn}m`;
    }
    case "deg": return `${value.toFixed(0)}°`;
    case "moisture": return `${value.toFixed(3)} m³/m³`;
    case "vapour": return `${value.toFixed(2)} kPa`;
    case "code": return String(value);
    default: return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
}

export function dirToCardinal(deg: number | null | undefined): string {
  if (deg == null) return "";
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg/22.5) % 16];
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

export function formatCoord(lat: number, lon: number): string {
  const la = `${Math.abs(lat).toFixed(4)}°${lat>=0?"N":"S"}`;
  const lo = `${Math.abs(lon).toFixed(4)}°${lon>=0?"E":"W"}`;
  return `${la}  ${lo}`;
}
