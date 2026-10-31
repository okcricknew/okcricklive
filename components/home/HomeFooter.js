
import { Star } from "lucide-react";

export default function HomeFooter() {
  return (
    <footer className="py-6 px-8 text-center border-t border-slate-200/60 z-10 backdrop-blur-md bg-white/40">

      <div className="flex justify-center items-center gap-2 mb-2">

        <div className="h-[1px] w-6 bg-slate-200" />

        <Star
          size={10}
          className="text-slate-300"
        />

        <div className="h-[1px] w-6 bg-slate-200" />

      </div>

      <p className="text-[9px] text-slate-400 uppercase tracking-[0.4em] font-bold">
        OKCRICK PRO MODULE ENGINE
      </p>

    </footer>
  );
}
