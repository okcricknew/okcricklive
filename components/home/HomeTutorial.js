
import {
  Zap,
  ArrowUpRight,
} from "lucide-react";

export default function HomeTutorial() {
  return (
    <section className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.01)] space-y-4">

      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-4">

          <div className="bg-slate-100 w-11 h-11 rounded-xl flex items-center justify-center text-slate-900 border border-slate-200/40 shrink-0">
            <Zap size={18} fill="currentColor" />
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Media Tutorial Framework
            </h3>

            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Learn professional operations under 2 minutes
            </p>
          </div>

        </div>

        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-md hidden sm:inline-flex items-center gap-1 shrink-0">
          HD Quality
          <ArrowUpRight size={12} />
        </span>

      </div>

      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-inner">

        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src="https://www.youtube.com/embed/"
          title="Tutorial Video"
          frameBorder="0"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

      </div>

      <p className="text-[9px] text-center text-slate-400 font-extrabold uppercase tracking-[0.25em]">
        Access full learning deployment parameters on YouTube
      </p>

    </section>
  );
}
