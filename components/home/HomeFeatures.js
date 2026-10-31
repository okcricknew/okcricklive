import {
  BarChart3,
  ShieldCheck,
  Users,
  Globe,
  Trophy,
  MonitorPlay,
  Palette,
  Cloud,
  History,
  UserRound,
  Radio,
  Target,
  Smartphone,
  ListChecks,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: Radio,
    title: "Live Cricket Scoring",
    desc: "Score your cricket matches ball by ball with a responsive scoring interface. Record runs, wickets, extras and every delivery as the match progresses.",
    points: [
      "Ball-by-ball score updates",
      "Runs, wickets and extras tracking",
      "Live match score management",
    ],
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    link: "/cricket-live-scoring-app",
    linkText: "Explore Live Scoring",
  },
  {
    icon: Trophy,
    title: "Complete Tournament Management",
    desc: "Create and manage cricket tournaments and leagues. Organize teams, matches and tournament operations from one platform.",
    points: [
      "Tournament creation and management",
      "Team and match management",
      "Season and league organization",
    ],
    color: "text-amber-600",
    bg: "bg-amber-50",
    link: "/cricket-tournament-management",
    linkText: "Explore Tournament System",
  },
  {
    icon: Users,
    title: "Teams & Squad Management",
    desc: "Organize your cricket teams and player squads. Manage team information and player selection for tournament matches.",
    points: [
      "Team management",
      "Squad and player selection",
      "Player information management",
    ],
    color: "text-blue-600",
    bg: "bg-blue-50",
    link: "/my-tournaments",
    linkText: "Explore Teams & Tournaments",
  },
  {
    icon: UserRound,
    title: "Player Statistics & Records",
    desc: "Keep track of individual player performances with batting and bowling statistics across matches and tournament seasons.",
    points: [
      "Batting and bowling records",
      "Player performance statistics",
      "Season performance tracking",
    ],
    color: "text-purple-600",
    bg: "bg-purple-50",
    link: "/about-cricket-scoring",
    linkText: "Explore Player Statistics",
  },
  {
    icon: BarChart3,
    title: "Advanced Match Analytics",
    desc: "Understand match performance through automatically calculated cricket statistics and match analysis.",
    points: [
      "Run rate and required run rate",
      "Partnership and squad statistics",
      "Bowling economy and net run rate",
      "Target and match calculations",
    ],
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    link: "/about-cricket-scoring",
    linkText: "Explore Match Analytics",
  },
  {
    icon: ListChecks,
    title: "Points Table & Tournament Rankings",
    desc: "Follow tournament standings and team performance with points tables and leaderboard-related statistics.",
    points: [
      "Tournament points table",
      "Team standings",
      "Performance and ranking statistics",
    ],
    color: "text-orange-600",
    bg: "bg-orange-50",
    link: "/tournament-cricket-scoring",
    linkText: "Explore Tournament Scoring",
  },
  {
    icon: MonitorPlay,
    title: "Professional OBS Streaming Overlays",
    desc: "Display live cricket match information on your video streams with dynamic browser-based scoreboard overlays.",
    points: [
      "OBS-compatible browser overlays",
      "Live match scoreboard graphics",
      "Batting and bowling information",
      "Match events and result graphics",
    ],
    color: "text-rose-600",
    bg: "bg-rose-50",
    link: "/cricket-live-stream-overlay",
    linkText: "Explore Streaming Overlays",
  },
  {
    icon: Palette,
    title: "Multiple Scoreboard Overlay Themes",
    desc: "Give your cricket broadcasts a professional appearance with different scoreboard overlay designs and visual themes.",
    points: [
      "Professional scoreboard designs",
      "Different overlay themes",
      "Broadcast-ready graphics",
    ],
    color: "text-pink-600",
    bg: "bg-pink-50",
    link: "/cricket-scoreboard-overlay-themes",
    linkText: "Browse Overlay Themes",
  },
  {
    icon: History,
    title: "My Matches & Match Records",
    desc: "Access your match management area and work with your cricket match records from the website.",
    points: [
      "My Matches section",
      "Match management",
      "Match-related records",
    ],
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    link: "/my-matches",
    linkText: "Explore My Matches",
  },
  {
    icon: Cloud,
    title: "Cloud-Based Data & Backups",
    desc: "The platform uses cloud database infrastructure to keep match information accessible and help protect records.",
    points: [
      "Cloud-based data storage",
      "Database-backed match records",
      "Access to saved information",
    ],
    color: "text-teal-600",
    bg: "bg-teal-50",
    link: "/about-cricket-scoring",
    linkText: "Learn About The System",
  },
  {
    icon: Target,
    title: "Online Cricket Scoreboard",
    desc: "Use the online scoreboard system for local cricket matches and follow match scoring digitally.",
    points: [
      "Online cricket scoreboard",
      "Digital match scoring",
      "Local match support",
    ],
    color: "text-red-600",
    bg: "bg-red-50",
    link: "/free-cricket-scoreboard",
    linkText: "Explore Online Scoreboard",
  },
  {
    icon: Smartphone,
    title: "Easy Platform Access",
    desc: "Access the web-based cricket scoring platform from supported devices without installing traditional desktop scoring software.",
    points: [
      "Web-based platform",
      "Responsive interface",
      "Access from supported devices",
    ],
    color: "text-slate-700",
    bg: "bg-slate-100",
    link: "/how-to-use-cricket-app",
    linkText: "View User Guide",
  },
];

export default function HomeFeatures() {
  return (
    <section
      id="features"
      className="flex flex-col gap-4"
      aria-labelledby="home-features-title"
    >
      <div className="mb-2">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-600">
          Everything You Need
        </span>

        <h2
          id="home-features-title"
          className="mt-2 text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900"
        >
          Explore All OKCRICK Features
        </h2>

        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
          From live ball-by-ball scoring to complete tournament
          management and professional cricket streaming overlays,
          discover what you can do with OKCRICK.
        </p>
      </div>

      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <article
            key={feature.title}
            className="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-300 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 ${feature.bg}`}
              >
                <Icon size={20} className={feature.color} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {feature.desc}
                </p>

                <ul className="mt-3 flex flex-col gap-2">
                  {feature.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-[11px] font-medium leading-relaxed text-slate-600"
                    >
                      <ShieldCheck
                        size={14}
                        className="mt-0.5 shrink-0 text-emerald-500"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={feature.link}
                  className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 transition-colors hover:text-emerald-900"
                >
                  {feature.linkText}
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </article>
        );
      })}

      <div className="mt-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
          Ready to Start Your Cricket Journey?
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Explore OKCRICK and manage your cricket scoring,
          tournaments, player statistics and live streaming
          experience from one platform.
        </p>

        <a
          href="/how-to-use-cricket-app"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-slate-800"
        >
          Learn How To Use
          <Globe size={14} />
        </a>
      </div>
    </section>
  );
}
