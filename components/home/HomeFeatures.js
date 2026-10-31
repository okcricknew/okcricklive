
import {
  Zap,
  Shield,
  Users,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Fast Sync",
    desc: "0.5s updates",
    color: "text-amber-500",
  },
  {
    icon: Shield,
    title: "Secure",
    desc: "Safe system",
    color: "text-blue-600",
  },
  {
    icon: Users,
    title: "Teams",
    desc: "Player stats",
    color: "text-purple-600",
  },
  {
    icon: Globe,
    title: "Global",
    desc: "Share anywhere",
    color: "text-emerald-600",
  },
];

export default function HomeFeatures() {
  return (
    <section className="flex flex-col gap-3">
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <article
            key={feature.title}
            className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:border-slate-300 transition-all group flex items-center gap-4"
          >
            <div className="bg-slate-50 w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-105 transition-transform shadow-sm">
              <Icon
                size={18}
                className={feature.color}
              />
            </div>

            <div>
              <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-wide">
                {feature.title}
              </h3>

              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-normal">
                {feature.desc}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
