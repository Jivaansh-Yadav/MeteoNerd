/// <reference lib="webworker" />
import Fuse from "fuse.js";

type InMsg =
  | { type: "LOAD"; countryCode: string; url: string }
  | { type: "SEARCH"; query: string };

type Place = { name: string; lat: number; lon: number };

let fuse: Fuse<Place> | null = null;

self.onmessage = async (e: MessageEvent<InMsg>) => {
  const msg = e.data;
  if (msg.type === "LOAD") {
    try {
      const res = await fetch(msg.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const total = Number(res.headers.get("content-length")) || 0;
      let received = 0;
      const reader = res.body!.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.byteLength;
        (self as unknown as Worker).postMessage({
          type: "PROGRESS",
          received,
          total,
          percent: total ? (received / total) * 100 : null,
        });
      }
      // concat
      const buf = new Uint8Array(received);
      let off = 0;
      for (const c of chunks) { buf.set(c, off); off += c.byteLength; }
      // decompress
      const ds = new DecompressionStream("gzip");
      const decompressed = new Response(new Blob([buf as BlobPart]).stream().pipeThrough(ds));
      const text = await decompressed.text();
      const places: Place[] = [];
      const lines = text.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const parts = line.split("\t");
        if (parts.length < 3) continue;
        const lat = parseFloat(parts[1]);
        const lon = parseFloat(parts[2]);
        if (!isFinite(lat) || !isFinite(lon)) continue;
        places.push({ name: parts[0], lat, lon });
      }
      fuse = new Fuse(places, {
        keys: ["name"],
        threshold: 0.3,
        distance: 100,
        minMatchCharLength: 2,
        shouldSort: true,
        includeMatches: true,
      });
      (self as unknown as Worker).postMessage({ type: "READY", total: places.length });
    } catch (err) {
      (self as unknown as Worker).postMessage({ type: "ERROR", error: String(err) });
    }
  } else if (msg.type === "SEARCH") {
    if (!fuse) { (self as unknown as Worker).postMessage({ type: "RESULTS", results: [] }); return; }
    const r = fuse.search(msg.query, { limit: 10 });
    (self as unknown as Worker).postMessage({
      type: "RESULTS",
      results: r.map(x => ({
        item: x.item,
        matches: x.matches?.map(m => ({ indices: m.indices, key: m.key })),
      })),
    });
  }
};

export {};
