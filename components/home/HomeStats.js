
import { BarChart3 } from "lucide-react";

export default function HomeStats({ initialStats }) {
  const stats = {
    matches: initialStats?.matches ?? 0,
    players: initialStats?.players ?? 0,
    locations: initialStats?.locations ?? 0,
  };

  return (
    <section className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.01)] relative overflow-hidden">

      <div className="flex flex-col sm:flex-row sm:items-center justify-around gap-6 relative z-10">

        <div className="text-center">
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.matches.toLocaleString("en-IN")}
          </p>

          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">
            Matches
          </p>
        </div>

        <div className="hidden sm:block w-[1px] h-10 bg-slate-100" />

        <div className="text-center">
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.players.toLocaleString("en-IN")}
          </p>

          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">
            Players
          </p>
        </div>

        <div className="hidden sm:block w-[1px] h-10 bg-slate-100" />

        <div className="text-center">
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.locations.toLocaleString("en-IN")}
          </p>

          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">
            Cities
          </p>
        </div>

      </div>

      <BarChart3 className="absolute w-28 h-28 text-slate-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

    </section>
  );
}
