import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  icon: ReactNode;
  accentColor: string;
  defaultOpen?: boolean;
  rawJson?: unknown;
  children: ReactNode;
}

function colorJson(s: string): string {
  return s
    .replace(/("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")\s*:/g, '<span class="mn-json-key">$1</span>:')
    .replace(/:\s*("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")/g, ': <span class="mn-json-str">$1</span>')
    .replace(/:\s*(-?\d+\.?\d*([eE][+-]?\d+)?)/g, ': <span class="mn-json-num">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="mn-json-bool">$1</span>')
    .replace(/:\s*null/g, ': <span class="mn-json-null">null</span>');
}

export function AccordionSection({ title, icon, accentColor, defaultOpen = false, rawJson, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [showRaw, setShowRaw] = useState(false);

  return (
    <section className="bg-card border border-border" style={{ borderRadius: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="mn-acc-header w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
        style={{ ["--accent-color" as any]: accentColor }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ color: accentColor }}>{icon}</span>
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <ChevronDown size={16} className={`mn-chevron text-muted-foreground ${open ? "mn-chevron-open" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-border">
          {rawJson !== undefined && (
            <div className="px-4 pt-3 flex justify-end">
              <button
                onClick={() => setShowRaw(s => !s)}
                className="text-[10px] mono uppercase tracking-wider px-2 py-1 border border-border hover:bg-muted"
                style={{ borderRadius: 4 }}
              >
                {showRaw ? "Formatted" : "Raw JSON"}
              </button>
            </div>
          )}
          <div className="p-4">
            {showRaw && rawJson !== undefined ? (
              <pre
                className="text-[11px] mono overflow-auto max-h-96 p-3 bg-background border border-border"
                style={{ borderRadius: 4 }}
                dangerouslySetInnerHTML={{ __html: colorJson(JSON.stringify(rawJson, null, 2)) }}
              />
            ) : children}
          </div>
        </div>
      )}
    </section>
  );
}

export function ParamGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
      {rows.map((r, i) => (
        <div key={i} className="flex justify-between items-center py-1.5 border-b border-border text-[13px]">
          <span className="text-muted-foreground">{r.label}</span>
          <span className="mono text-foreground">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
