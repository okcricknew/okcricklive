import { useRouter } from "next/router";
import { useState } from "react";
import { OverlayProvider } from "../../components/overlay/core/OverlayProvider";
import ThemeProvider from "../../components/overlay/core/ThemeProvider";
import { Trophy, Copy, Check, ExternalLink, Sparkles, Layers } from "lucide-react";

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

export default function ThemePage({
  initialTId,
  initialTheme,
  initialMatchId,
  initialMatch,
}) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState(null);

  const tId = initialTId || router.query.tId;
  const theme = initialTheme || router.query.theme;
  const matchId = initialMatchId || router.query.matchId;

  if (!tId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <Trophy size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-100 mb-1">Tournament ID Missing</h2>
          <p className="text-sm text-slate-400">Tournament ID is missing from the URL parameters.</p>
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
        >
          <ThemeProvider initialTheme={theme} />
        </OverlayProvider>
      </div>
    );
  }

  const themes = [
    {
      id: "willow",
      name: "Willow Theme",
      desc: "Classic clean UI crafted for professional broadcast presentation.",
    },
    {
      id: "okCrick",
      name: "CWC 23 Theme",
      desc: "Modern energetic scoreboard with vibrant layout and dynamics.",
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 font-sans antialiased selection:bg-rose-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3 bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-indigo-500/10 blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 border border-slate-700/60 rounded-2xl text-amber-400 shadow-inner mb-1">
            <Layers size={28} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">
            Broadcast Overlay Themes
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Select a broadcast template below and copy your live streaming link for OBS Studio or VMix.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Tournament ID: <span className="text-amber-400 font-mono">{tId}</span>
          </div>
        </div>

        {/* Themes Table / Card List Container */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center">#</th>
                  <th className="py-4 px-6">Theme Profile</th>
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
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-5 px-6 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700">
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-5 px-6 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-rose-500 shrink-0" />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-slate-400 text-xs sm:text-sm">
                        {item.desc}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <button
                          onClick={() => copyLink(item.id)}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer ${
                            isCopied
                              ? "bg-emerald-600 text-white shadow-emerald-900/30"
                              : "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-900/30"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check size={15} /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={15} /> Copy Link
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
  res.setHeader("Cache-Control", "private, no-store, max-age=0");

  const tId = typeof query.tId === "string" ? query.tId : "";
  const theme = typeof query.theme === "string" ? query.theme : "";
  const matchId =
    typeof query.matchId === "string" ? query.matchId : "";

  let initialMatch = null;

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
    } catch (error) {
      console.error(
        "Overlay SSR match fetch failed:",
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
    },
  };
                    }
