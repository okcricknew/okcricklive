import useLatestMatches from "../../hooks/useLatestMatches";
import {
  getTeamScore,
  getTeamOvers,
} from "../../lib/matches/formatMatch";

function TeamScore({ match, teamName, logoUrl, align = "left" }) {
  const score = getTeamScore(match, teamName);
  const overs = getTeamOvers(match, teamName);

  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full border-2 border-yellow-300 bg-white object-contain p-1"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-yellow-400 bg-[#123D2A] text-xs font-black text-yellow-300">
          {(teamName || "T").slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="min-w-0">
        <p className="truncate text-[10px] font-extrabold uppercase tracking-wide text-[#24513A]">
          {teamName || "Team"}
        </p>

        <p className="mt-1 text-lg font-black leading-none tracking-tight text-[#103B28]">
          {score.runs}
          <span className="text-yellow-600">/</span>
          {score.wickets}
        </p>

        {overs !== null && (
          <p className="mt-1 text-[9px] font-bold text-slate-500">
            {overs} overs
          </p>
        )}
      </div>
    </div>
  );
}

export default function LatestMatches({ initialMatches = [] }) {
  const { matches, loading, error } = useLatestMatches(initialMatches);

  return (
    <section className="space-y-4">
      {/* Section heading */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-red-600" />
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#17613A]">
              Match Centre
            </p>
          </div>

          <h2 className="mt-1 text-xl font-black tracking-tight text-[#103B28]">
            Latest <span className="text-red-600">Matches</span>
          </h2>

          <p className="mt-1 text-[10px] font-medium text-slate-500">
            Live action and recent results
          </p>
        </div>

        <span className="shrink-0 rounded-xl border border-yellow-300 bg-yellow-100 px-3 py-2 text-[9px] font-black text-[#123D2A] shadow-sm">
          {matches.length} MATCHES
        </span>
      </div>

      {/* Loading state */}
      {loading && matches.length === 0 ? (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 w-[285px] shrink-0 animate-pulse rounded-2xl border border-emerald-100 bg-emerald-50"
            />
          ))}
        </div>
      ) : error && matches.length === 0 ? (
        <div className="rounded-2xl border border-red-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
            !
          </div>
          <p className="mt-2 text-xs font-bold text-[#123D2A]">
            Matches load nahi ho paaye.
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Firebase connection aur read permissions check karein.
          </p>
        </div>
      ) : matches.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-red-600 via-yellow-400 to-[#123D2A]" />
          <div className="px-5 py-7 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#123D2A] text-yellow-300">
              <span className="text-lg font-black">🏏</span>
            </div>
            <p className="mt-3 text-xs font-extrabold text-[#123D2A]">
              No Matches Yet
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Abhi koi live ya completed match nahi hai.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden pb-3"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {matches.map((match) => {
            const isLive =
              String(match.status || "").toLowerCase() === "live";

            return (
              <article
                key={`${match.tournamentId}-${match.id}`}
                className={`w-[285px] shrink-0 snap-start overflow-hidden rounded-2xl border bg-white shadow-md transition-transform duration-200 hover:-translate-y-0.5 ${
                  isLive
                    ? "border-red-200 shadow-red-900/10"
                    : "border-emerald-100 shadow-emerald-950/5"
                }`}
              >
                {/* Tournament header */}
                <div className="relative overflow-hidden bg-[#123D2A] px-4 py-3">
                  <div className="absolute right-0 top-0 h-16 w-16 translate-x-5 -translate-y-5 rounded-full border-[10px] border-white/5" />

                  <div className="relative flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-black uppercase tracking-wide text-white">
                        {match.tournamentName || "Tournament"}
                      </p>

                      <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-yellow-300">
                        Match #{match.matchNo ?? "—"} ·{" "}
                        {match.matchType || "Cricket"}
                      </p>
                    </div>

                    {isLive ? (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-300/30 bg-red-600 px-2.5 py-1 text-[9px] font-black uppercase text-white shadow-sm">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-300" />
                        Live
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full border border-yellow-300 bg-yellow-300 px-2 py-1 text-[9px] font-black uppercase text-[#123D2A]">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Scoreboard */}
                <div className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <TeamScore
                      match={match}
                      teamName={match.teamA}
                      logoUrl={match.teamALogoUrl}
                    />

                    <span className="shrink-0 rounded-md bg-yellow-100 px-1.5 py-1 text-[8px] font-black text-[#123D2A]">
                      VS
                    </span>

                    <TeamScore
                      match={match}
                      teamName={match.teamB}
                      logoUrl={match.teamBLogoUrl}
                      align="right"
                    />
                  </div>

                  {/* Match status / result */}
                  <div
                    className={`mt-4 rounded-xl border px-3 py-3 ${
                      isLive
                        ? "border-red-100 bg-red-50"
                        : "border-yellow-200 bg-[#FFFBE8]"
                    }`}
                  >
                    {isLive ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
                          <p className="text-[10px] font-black uppercase tracking-wide text-red-700">
                            Match in Progress
                          </p>
                        </div>

                        <p className="mt-1.5 text-[10px] font-bold leading-relaxed text-[#24513A]">
                          {match.battingTeam
                            ? `${match.battingTeam} batting`
                            : "Live score"}
                          {match.overs
                            ? ` · ${match.overs} overs match`
                            : ""}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#8A6B00]">
                          Final Result
                        </p>

                        <p className="mt-1.5 text-[11px] font-black leading-relaxed text-[#123D2A]">
                          {match.resultSummary ||
                            (match.winner
                              ? `${match.winner} won`
                              : "Match completed")}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Bottom accent */}
                  <div className="mt-4 flex items-center gap-1">
                    <span className="h-1 flex-1 rounded-full bg-red-600" />
                    <span className="h-1 w-7 rounded-full bg-yellow-400" />
                    <span className="h-1 flex-1 rounded-full bg-[#123D2A]" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
    }
