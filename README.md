<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:030c14,55:0b2b40,100:0ea5e9&height=235&section=header&text=MeteoNerd&fontSize=46&fontColor=eaf8ff&fontAlignY=40&desc=Every%20Open-Meteo%20variable%2C%20none%20of%20them%20hidden&descSize=17&descAlignY=62&animation=twinkling" alt="MeteoNerd" width="100%">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=500&size=19&duration=3200&pause=900&color=38bdf8&center=true&vCenter=true&width=700&lines=Not%20a%20weather%20app%3A%20a%20window%20onto%20the%20model;Temperature%2C%20CAPE%2C%20boundary%20layer%2C%20soil%20moisture%2C%20radiation;3%20requests%20in%20flight%2C%20100%20ms%20apart%2C%20never%20rate-limited" alt="Typing animation" />

<br />

<a href="https://meteonerd.pages.dev/"><img src="https://img.shields.io/badge/%E2%96%B6%20Read%20the%20sky-0ea5e9?style=for-the-badge&labelColor=030c14&logo=cloudflarepages&logoColor=7dd3fc" alt="Read the sky" /></a>

</div>

<div align="center">

<img src="https://img.shields.io/badge/Source-Open--Meteo-38bdf8?style=flat-square&labelColor=030c14" alt="Open-Meteo" />
<img src="https://img.shields.io/badge/Forecast-16%20days-0ea5e9?style=flat-square&labelColor=030c14" alt="16 day forecast" />
<img src="https://img.shields.io/badge/Model-selectable-0284c7?style=flat-square&labelColor=030c14" alt="Selectable model" />
<img src="https://img.shields.io/badge/Places-13.4M%20via%20D1-7dd3fc?style=flat-square&labelColor=030c14" alt="13.4 million places" />
<img src="https://img.shields.io/badge/Units-metric%20%2B%20imperial-38bdf8?style=flat-square&labelColor=030c14" alt="Metric and imperial" />

</div>

<br />

<div align="center">

### <a href="https://meteonerd.pages.dev/">meteonerd.pages.dev</a>

<sub>Pick a place by name, by GPS, or by coordinates. Then read as much or as little as you want.</sub>

</div>

---

<div align="center">

## What it is

</div>

Most weather apps answer "will I need a jacket". This one answers "what is the atmosphere doing" — and it does not decide for you which of those questions you asked. Every variable Open-Meteo publishes for a point is fetched and shown, folded into accordion sections so the everyday numbers (temperature, rain, wind) sit at the top and the boundary-layer and radiation columns sit below, closed, waiting.

It is built for the person who wants to see **CAPE at 700 hPa** next to the surface temperature, and equally for the person who only ever opens the first section. Same page, same fetch, different depth.

<div align="center">

<sub>No API key, no account, no ads. The data is Open-Meteo's; the interface is the work.</sub>

</div>

---

<div align="center">

## The three ways in

</div>

<ul>
<li><b>Country, then place.</b> Pick from a searchable ISO country list, then type at least two characters of a place name. Results come from a places API over a <b>13.4 million</b>-row GeoNames table, and are re-ranked in the browser with Fuse so a partial, misspelled, accented query still lands.</li>
<li><b>My location.</b> The browser's geolocation, resolved to a label and coordinates — one tap, no typing.</li>
<li><b>Exact coordinates.</b> Latitude and longitude, for a point with no name: a ridge, a lake, a field.</li>
</ul>

<div align="center">

## What is inside

</div>

<ul>
<li><b>The full variable set</b> — current, hourly, daily and 15-minute series, including pressure-level temperature, humidity, cloud cover, wind speed and direction, geopotential height and vertical velocity.</li>
<li><b>Selectable model</b> — <code>auto</code> by default; pick a specific Open-Meteo model when you want to see what one source says rather than the blend.</li>
<li><b>16 forecast days</b> — the API's maximum, requested every time.</li>
<li><b>Metric and imperial, per value</b> — a units toggle that knows a temperature is not a speed; see the conversion table below.</li>
<li><b>WMO code names</b> — every condition code rendered as words ("Depositing rime fog", not "48").</li>
<li><b>Partial results by design</b> — if the pressure-level chunk fails, the rest of the page still renders with a stated gap instead of an error screen.</li>
<li><b>Accordion sections</b> — closed by default below the first, so 16 days × dozens of variables never arrives as a wall.</li>
<li><b>Dark and light</b> — one toggle, palette defined once as tokens.</li>
</ul>

---

<div align="center">

## Stack

</div>

<ul>
<li><b>Vite + React 19 + TanStack Router</b> — a client-rendered app; the data is live and per-location, so there is nothing to prerender.</li>
<li><b>Open-Meteo</b> — free, keyless, and the only weather source. No normalisation layer over a second provider.</li>
<li><b>Cloudflare Pages + a separate Worker</b> — the site is static; the places search is a Worker in front of D1.</li>
<li><b>Fuse.js</b> — re-ranking both the country list and fetched place names in the browser, so the worker only has to return candidates.</li>
<li><b>Radix + Tailwind</b> — accordions, dialogs and the theme, via the standard shadcn/ui pieces.</li>
</ul>

<div align="center">

<img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind,cloudflare,git" alt="React, TypeScript, Vite, Tailwind, Cloudflare, Git" />

</div>

---

<div align="center">

## Under the hood

</div>

<details>
<summary><b>Chunking</b> — why one request is impossible and ten are not</summary>

<br />

<p>Open-Meteo rejects very long variable lists in a single query string, and hundreds of hourly variables in one response is a payload no phone wants to parse. So every group is split into chunks of <b>10</b> variables, each chunk becoming its own request:</p>

<pre><code>const CHUNK_SIZE = 10;
const currentChunks        = chunk(CURRENT_VARS, CHUNK_SIZE);
const hourlyBaseChunks     = chunk(HOURLY_BASE, CHUNK_SIZE);
const hourlyPressureChunks = chunk(HOURLY_PRESSURE, CHUNK_SIZE);
const dailyChunks          = chunk(DAILY_VARS, CHUNK_SIZE);
const minutelyChunks       = chunk(MINUTELY_VARS, CHUNK_SIZE);</code></pre>

<p>Every URL shares the point, <code>timezone=auto</code> and <code>forecast_days=16</code>; only the variable list differs. The responses are merged back into one <code>WeatherResult</code>, so the UI never knows how many calls it took.</p>

</details>

<details>
<summary><b>Politeness</b> — the part most Open-Meteo clients get wrong</summary>

<br />

<p>Dozens of parallel requests is how an IP gets a <code>429</code>. This client uses <b>3 concurrent workers</b> with a <b>100 ms</b> gap between each request, and a retry loop that reads the server's own advice before guessing:</p>

<pre><code>if (res.status === 429) {
  const retryAfter = res.headers.get("Retry-After");
  // honour Retry-After when present, otherwise 1s, 2s, 4s, 8s, 16s
  await sleep(Number(retryAfter) &gt; 0 ? Number(retryAfter) * 1000
                                      : 1000 * Math.pow(2, attempt));
}</code></pre>

<p>Five attempts, then the chunk is marked failed and returned as an error rather than thrown. A weather page that renders ninety percent of itself is more useful than one that renders a red box.</p>

</details>

<details>
<summary><b>Degrading in three groups, not one</b></summary>

<br />

<p>Failures are aggregated by <i>what they cost the reader</i>:</p>

<ul>
<li><b><code>core</code></b> — current, hourly base, daily. If this is missing, the page has no weather and says so.</li>
<li><b><code>pressureLevels</code></b> — the upper-air columns. Losing them narrows the nerd section, nothing else.</li>
<li><b><code>minutely</code></b> — the 15-minute series. Losing it drops one section entirely; <code>minutely_15</code> is returned as <code>undefined</code> only when <b>every</b> minutely chunk failed, so a partial series is still shown.</li>
</ul>

<p>That last condition is a deliberate detail: half a nowcast is data, and hiding it because the other half failed would be a worse product.</p>

</details>

<details>
<summary><b>Units as a property of the variable, not of the request</b></summary>

<br />

<p>This app never passes <code>temperature_unit</code> or <code>windspeed_unit</code> to the API. It asks for metric and converts on display, driven by a <code>kind</code> attached to each variable name:</p>

<pre><code>temp      1.0°C    ->  33.8°F
speed     1.0 km/h  ->  0.62 mph
precip    1.0 mm    ->  0.039 in
pressure  1.0 hPa   ->  0.0295 inHg
distance  1000 m    ->  0.62 mi
height    1.0 m     ->  3.28 ft</code></pre>

<p>Two benefits. The cache key is the location, not the location <i>and</i> the unit system, so toggling units costs zero requests. And a single value cannot be misinterpreted — a pressure shown with the wrong unit is worse than a pressure shown in the wrong system.</p>

<p>Special cases live in the same switch: <code>is_day</code> is a boolean rendered as <i>Day</i>/<i>Night</i> rather than <code>1</code>, and a missing value renders as an em dash, never as <code>NaN</code>.</p>

</details>

<details>
<summary><b>Places search, split across the wire</b></summary>

<br />

<p>13.4 million place names cannot be shipped to a browser, and a pure server-side search cannot do fuzzy matching well. The split:</p>

<ul>
<li><b>Worker + D1</b> at <code>meteonerd-places…workers.dev/search</code> answers "which rows match this prefix in this country" — a query SQLite is good at.</li>
<li><b>Fuse.js in the browser</b> re-ranks what comes back, using the same configuration as the country search, so both inputs feel identical to type into.</li>
</ul>

<p>Countries themselves are a small local list of ISO codes and English names — no request, no spinner, instant filtering.</p>

</details>

---

<div align="center">

## Project structure

</div>

<pre><code>MeteoNerd/
├── src/components/meteonerd/
│   ├── LocationInput.tsx      # country → place, GPS, coordinates
│   ├── WeatherDisplay.tsx     # sections built from the merged result
│   ├── AccordionSection.tsx
│   └── ThemeToggle.tsx
├── src/lib/
│   ├── weather.ts             # chunking, concurrency, retry, merge
│   ├── weather-params.ts      # every variable list + its unit kind
│   ├── units.ts               # per-kind conversion
│   ├── wmo.ts                 # code → words
│   └── countries.ts           # ISO 3166 names
├── src/routes/                # index + root
└── public/_routes.json</code></pre>

---

<div align="center">

## Run it

</div>

<pre><code>git clone https://github.com/Jivaansh-Yadav/MeteoNerd.git
cd MeteoNerd
npm install
npm run dev            # vite dev</code></pre>

<p>No API key is needed to read weather. Place search through the hosted worker works out of the box; to run it against your own D1 database, point <code>PLACES_API</code> in <code>LocationInput.tsx</code> at your worker.</p>

<div align="center">

<sub>Built to answer "what does the model actually say", not "should I take an umbrella". The umbrella answer is in the first section.</sub>

</div>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:030c14,55:0b2b40,100:0ea5e9&height=110&section=footer&reversal=true" alt="" width="100%">
