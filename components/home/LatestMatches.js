// components/home/LatestMatches.js

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
          className="h-9 w-9 shrink-0 rounded-full border border-slate-200 bg-white object-contain p-1"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500">
          {(teamName || "T").slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="min-w-0">
        <p className="truncate text-[10px] font-extrabold uppercase text-slate-600">
          {teamName || "Team"}
        </p>

        <p className="mt-1 text-lg font-black leading-none text-slate-900">
          {score.runs}/{score.wickets}
        </p>

        {overs !== null && (
          <p className="mt-1 text-[9px] font-semibold text-slate-400">
            {overs} overs
          </p>
        )}
      </div>
    </div>
  );
}

export default function LatestMatches({ initialMatches = [] }) {
  const { matches, loading, error } =
    useLatestMatches(initialMatches);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">
            Match Centre
          </p>
          <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900">
            Latest Matches
          </h2>
          <p className="mt-1 text-[10px] font-medium text-slate-400">
            Live action and recent results
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-extrabold text-slate-500">
          {matches.length} MATCHES
        </span>
      </div>

      {loading && matches.length === 0 ? (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-44 w-[285px] shrink-0 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : error && matches.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-xs font-bold text-slate-600">
            Matches load nahi ho paaye.
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Firebase connection aur read permissions check karein.
          </p>
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-xs font-bold text-slate-600">
            Abhi koi live ya completed match nahi hai.
          </p>
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
                className="w-[285px] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-black uppercase tracking-wide text-slate-800">
                      {match.tournamentName || "Tournament"}
                    </p>

                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                      Match #{match.matchNo ?? "—"} ·{" "}
                      {match.matchType || "Cricket"}
                    </p>
                  </div>

                  {isLive ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-[9px] font-black uppercase text-red-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                      Live
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase text-emerald-700">
                      Completed
                    </span>
                  )}
                </div>

                <div className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <TeamScore
                      match={match}
                      teamName={match.teamA}
                      logoUrl={match.teamALogoUrl}
                    />

                    <span className="shrink-0 text-[9px] font-black text-slate-300">
                      VS
                    </span>

                    <TeamScore
                      match={match}
                      teamName={match.teamB}
                      logoUrl={match.teamBLogoUrl}
                      align="right"
                    />
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5">
                    {isLive ? (
                      <>
                        <p className="text-[10px] font-extrabold uppercase tracking-wide text-red-600">
                          Match in progress
                        </p>
                        <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-600">
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
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                          Match Result
                        </p>
                        <p className="mt-1 text-[11px] font-extrabold leading-relaxed text-slate-800">
                          {match.resultSummary ||
                            (match.winner
                              ? `${match.winner} won`
                              : "Match completed")}
                        </p>
                      </>
                    )}
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
