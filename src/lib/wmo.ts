// WMO Weather interpretation codes
export const WMO: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export function wmoText(code: number | null | undefined): string {
  if (code == null) return "—";
  return WMO[code] ?? `Code ${code}`;
}

export type GradientKey =
  | "clear-day" | "clear-night" | "partly" | "overcast" | "fog"
  | "drizzle" | "rain" | "heavy-rain" | "snow" | "thunder" | "haze";

export function gradientFor(code: number | null | undefined, isDay: number | null | undefined): string {
  const c = code ?? 0;
  const day = isDay !== 0;
  if (c === 0 || c === 1) return day
    ? "linear-gradient(160deg, #3A8FCC, #87C4E8)"
    : "linear-gradient(160deg, #0D1B2A, #1A3A5C)";
  if (c === 2) return "linear-gradient(160deg, #5A8AAD, #9BBCCE)";
  if (c === 3) return "linear-gradient(160deg, #6B7A8D, #A8B5C2)";
  if (c === 45 || c === 48) return "linear-gradient(160deg, #8A9AA8, #C2CDD6)";
  if (c >= 51 && c <= 57) return "linear-gradient(160deg, #4A7A9B, #7AACCB)";
  if (c === 61 || c === 63 || c === 80 || c === 81) return "linear-gradient(160deg, #2C4A6E, #5C7A9E)";
  if (c === 65 || c === 82 || c === 66 || c === 67) return "linear-gradient(160deg, #1E3A5A, #3A5A7A)";
  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return "linear-gradient(160deg, #8AAFC4, #D8E8F0)";
  if (c >= 95) return "linear-gradient(160deg, #1A1A2E, #3A2A4E)";
  return "linear-gradient(160deg, #3A8FCC, #87C4E8)";
}
