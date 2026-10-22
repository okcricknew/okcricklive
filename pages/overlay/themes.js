import { useRouter } from "next/router";
import { useState } from "react";
import { getAdminDb } from "../../lib/firebase-admin";
import { OverlayProvider } from "../../components/overlay/core/OverlayProvider";
import ThemeProvider from "../../components/overlay/core/ThemeProvider";

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
  const [copied, setCopied] = useState(false);

  const tId = initialTId || router.query.tId;
  const theme = initialTheme || router.query.theme;
  const matchId = initialMatchId || router.query.matchId;

  if (!tId) {
    return (
      <div style={styles.container}>
        <p>Tournament ID is missing from the URL.</p>
      </div>
    );
  }

  if (theme) {
    return (
      <div
        style={{
          background: "transparent",
          minHeight: "100vh",
        }}
      >
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
      name: "Willow",
      desc: "Classic clean UI for professional look",
    },
    {
      id: "okCrick",
      name: "CWC 23",
      desc: "Modern scoreboard with vibrant colors",
    },
  ];

  const copyLink = async (themeId) => {
    const link = `${window.location.origin}/overlay/themes?tId=${tId}&theme=${themeId}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      alert(`Link Copied for ${themeId} ✅`);
    } catch (error) {
      window.prompt("Copy overlay link:", link);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🎬 Overlay Themes</h2>
        <p style={styles.subtitle}>
          Select and copy broadcast overlay link
        </p>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Theme</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {themes.map((item, index) => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>
                  <span style={styles.badge}>{index + 1}</span>
                </td>
                <td style={{ ...styles.td, fontWeight: "bold" }}>
                  {item.name}
                </td>
                <td style={styles.td}>{item.desc}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => copyLink(item.id)}
                    style={styles.copyBtn}
                  >
                    Copy Link
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

const styles = {
  container: {
    padding: "40px 20px",
    fontFamily: "sans-serif",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    minHeight: "100vh",
    color: "white",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "30px",
    fontWeight: "900",
  },
  subtitle: {
    fontSize: "14px",
    color: "#94a3b8",
  },
  tableWrapper: {
    maxWidth: "900px",
    margin: "auto",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "16px",
    overflow: "hidden",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "rgba(255,255,255,0.08)",
  },
  th: {
    padding: "16px",
    fontSize: "12px",
    textTransform: "uppercase",
    color: "#94a3b8",
    textAlign: "left",
  },
  tr: {
    borderTop: "1px solid rgba(255,255,255,0.05)",
    transition: "0.3s",
  },
  td: {
    padding: "16px",
  },
  badge: {
    background: "#C10E44",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  copyBtn: {
    background: "linear-gradient(90deg, #C10E44, #9E0B36)",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
      
