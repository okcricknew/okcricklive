import { BarChart3 } from "lucide-react";

const numberFormatter = new Intl.NumberFormat("en-IN");

export default function HomeStats({ initialStats }) {
  const stats = {
    matches: Math.max(0, Number(initialStats?.matches) || 0),
    players: Math.max(0, Number(initialStats?.players) || 0),
    locations: Math.max(0, Number(initialStats?.locations) || 0),
  };

  const items = [
    { label: "Matches", value: stats.matches },
    { label: "Players", value: stats.players },
    { label: "Cities", value: stats.locations },
  ];

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]"
      aria-label="Platform statistics"
    >
      <div className="relative z-10 grid grid-cols-3 gap-3">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`min-w-0 text-center ${
              index !== 0 ? "border-l border-slate-100" : ""
            }`}
          >
            <p className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {numberFormatter.format(item.value)}
            </p>

            <p className="mt-1 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <BarChart3
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 text-slate-50"
      />
    </section>
  );
}
