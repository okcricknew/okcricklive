import { useRouter } from "next/router";
import { useState } from "react";
import { OverlayProvider } from "../../components/overlay/core/OverlayProvider";
import ThemeProvider from "../../components/overlay/core/ThemeProvider";
import { Copy, Check } from "lucide-react";

function serializeValue(value) {
  if (value === null || value === undefined) return value;

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        serializeValue(item),
      ])
    );
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  return value;
}

// Only send the fields required by WCPL panels.
function serializeTeamColorDocument(docSnap) {
  if (!docSnap?.exists) return null;

  const data = docSnap.data();

  return serializeValue({
    id: docSnap.id,
    colorHex: data.colorHex ?? null,
    teamColor: data.teamColor ?? null,
    color: data.color ?? null,
    logoUrl: data.logoUrl ?? null,
  });
}

export default function ThemePage({
  initialTId,
  initialTheme,
  initialMatchId,
  initialMatch,
  initialTeamDocs,
}) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState(false);

  const tId = initialTId || router.query.tId;
  const theme = initialTheme || router.query.theme;
  const matchId = initialMatchId || router.query.matchId;

  if (!tId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-xl max-w-md w-full">
          <p className="text-slate-300 font-medium text-sm">
            Tournament ID is missing from the URL.
          </p>
        </div>
      </div>
    );
  }

  if (theme) {
    return (
      <div className="bg-transparent min-h-screen">
        <style jsx global>{`
          html,
          body,
          main,
          #__next {
            background: transparent !important;
          }

          header,
          footer,
          .navbar {
            display: none !important;
          }
        `}</style>

        <OverlayProvider
          tId={tId}
          matchId={matchId}
          initialMatch={initialMatch}
          initialTeamDocs={initialTeamDocs}
        >
          <ThemeProvider initialTheme={theme} />
        </OverlayProvider>
      </div>
    );
  }

  const themes = [
    {
      id: "willow",
      name: "Willow",
      desc: "Classic clean UI for professional look",
    },
    {
      id: "okCrick",
      name: "CWC 23",
      desc: "Modern scoreboard with vibrant colors",
    },
    {
      id: "WCPL",
      name: "WCPL",
      desc: "WCPL broadcast scoreboard theme",
    },
  ];

  const copyLink = async (themeId) => {
    const link = `${window.location.origin}/overlay/themes?tId=${tId}&theme=${themeId}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(themeId);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (error) {
      window.prompt("Copy overlay link:", link);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">

        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            🎬 Overlay Themes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Select and copy broadcast overlay link
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center">#</th>
                  <th className="py-4 px-6">Theme</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 text-sm">
                {themes.map((item, index) => {
                  const isCopied = copiedId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-600 text-white font-bold text-xs shadow-sm">
                          {index + 1}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-white">
                        {item.name}
                      </td>

                      <td className="py-4 px-6 text-slate-400 text-xs sm:text-sm">
                        {item.desc}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => copyLink(item.id)}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer ${
                            isCopied
                              ? "bg-emerald-600 text-white"
                              : "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check size={14} /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={14} /> Copy Link
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export async function getServerSideProps({ query, res }) {
  res.setHeader(
    "Cache-Control",
    "private, no-store, max-age=0"
  );

  const tId = typeof query.tId === "string" ? query.tId : "";
  const theme = typeof query.theme === "string" ? query.theme : "";
  const matchId =
    typeof query.matchId === "string" ? query.matchId : "";

  let initialMatch = null;
  let initialTeamDocs = {
    teamA: null,
    teamB: null,
  };

  if (tId && theme) {
    try {
      const { getAdminDb } = await import("../../lib/firebase-admin");
      const db = getAdminDb();

      const matchesRef = db
        .collection("tournaments")
        .doc(tId)
        .collection("matches");

      if (matchId && matchId !== "undefined" && matchId !== "null") {
        const matchDoc = await matchesRef.doc(matchId).get();

        if (matchDoc.exists) {
          initialMatch = {
            id: matchDoc.id,
            ...serializeValue(matchDoc.data()),
          };
        }
      } else {
        const snapshot = await matchesRef
          .where("isOverlayActive", "in", [true, "true"])
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const matchDoc = snapshot.docs[0];

          initialMatch = {
            id: matchDoc.id,
            ...serializeValue(matchDoc.data()),
          };
        }
      }

      // WCPL only: fetch both team colors on the server.
      // Other themes retain their existing behavior.
      if (theme.toLowerCase() === "wcpl" && initialMatch) {
        const teamAId = initialMatch.teamAId || null;
        const teamBId = initialMatch.teamBId || null;

        const [teamADoc, teamBDoc] = await Promise.all([
          teamAId
            ? db
                .collection("tournaments")
                .doc(tId)
                .collection("teams")
                .doc(teamAId)
                .get()
            : Promise.resolve(null),

          teamBId
            ? db
                .collection("tournaments")
                .doc(tId)
                .collection("teams")
                .doc(teamBId)
                .get()
            : Promise.resolve(null),
        ]);

        initialTeamDocs = {
          teamA: serializeTeamColorDocument(teamADoc),
          teamB: serializeTeamColorDocument(teamBDoc),
        };
      }
    } catch (error) {
      console.error(
        "Overlay SSR fetch failed:",
        error.code || error.message
      );
    }
  }

  return {
    props: {
      initialTId: tId,
      initialTheme: theme,
      initialMatchId: matchId,
      initialMatch,
      initialTeamDocs,
    },
  };
            }
                            
