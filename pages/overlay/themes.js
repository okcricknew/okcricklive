import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { OverlayProvider } from "../../components/overlay/core/OverlayProvider";
import ThemeProvider from "../../components/overlay/core/ThemeProvider";

export default function ThemePage() {
  const router = useRouter();
  const { tId, theme } = router.query;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (theme) {
      document.body.style.backgroundColor = "transparent";
      document.body.style.background = "none";
    }
  }, [theme]);

  if (!router.isReady || !mounted) return null;
  

  if (!tId) {
    return (
      <div style={styles.container}>
        <h3 style={{ color: "#ff4d4f" }}></h3>
        <p>Tournament ID is missing from the URL.</p>
      </div>
    );
  }

  // 🎬 LIVE MODE
  if (theme) {
    return (
      <div style={{ background: "transparent", minHeight: "100vh" }}>
        <style jsx global>{`
          header, footer, .navbar { display: none !important; }
          body, html, main {
            background: transparent !important;
          }
        `}</style>

        <OverlayProvider tId={tId}>
          <ThemeProvider/>
        </OverlayProvider>
      </div>
    );
  }

  // 🎨 THEME LIST
  const themes = [
    { id: "willow", name: "Willow", desc: "Classic clean UI for professional look" },
    { id: "okCrick", name: "CWC 23", desc: "Modern scoreboard with vibrant colors" },
  ];

  const copyLink = (themeId) => {
    const link = `${window.location.origin}/overlay/themes?tId=${tId}&theme=${themeId}`;
    navigator.clipboard.writeText(link);
    alert(`Link Copied for ${themeId} ✅`);
  };

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.title}>🎬 Overlay Themes</h2>
        <p style={styles.subtitle}>
          Select and copy broadcast overlay link
        </p>
      </div>

      {/* TABLE */}
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
            {themes.map((theme, index) => (
              <tr key={theme.id} style={styles.tr}>
                <td style={styles.td}>
                  <span style={styles.badge}>{index + 1}</span>
                </td>
                <td style={{ ...styles.td, fontWeight: "bold" }}>
                  {theme.name}
                </td>
                <td style={styles.td}>{theme.desc}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => copyLink(theme.id)}
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
