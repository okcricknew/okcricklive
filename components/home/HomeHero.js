
import { Star } from "lucide-react";

export default function HomeHero({
  user,
  initialUserData,
}) {
  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-white mb-5 tracking-wider uppercase">
        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />

        Pro Dashboard Engine{" "}
        {initialUserData
          ? `(${initialUserData.name || ""})`
          : ""}
      </span>

      <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-slate-900 uppercase">
        Cricket Live Scoring &

        <span className="block bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
          Tournament System
        </span>
      </h1>

      <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-3 mb-6 leading-relaxed font-medium">
        Experience lightning-fast data entry interfaces
        integrated with OBS web overlays designed for
        professional streaming layouts.
      </p>

      {!user && (
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new Event("openAuthModal")
            );
          }}
          className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-slate-900/10 transform hover:-translate-y-0.5"
        >
          Get Started Free
        </button>
      )}

      <Star className="absolute -right-6 -top-6 text-slate-100 w-36 h-36 pointer-events-none group-hover:rotate-12 transition-transform duration-700 ease-out" />

    </section>
  );
}
