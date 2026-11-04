// Returns a valid CSS color from the existing Firebase team document.
// Invalid or missing values use the panel-specific fallback without writing to Firebase.
function normalizeHex(value) {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(clean)) return clean;
  if (/^#[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  return null;
}

export function getTeamPanelColor(teamDocument, fallback) {
  if (!teamDocument) return fallback;

  const directColor =
    normalizeHex(teamDocument.colorHex) ||
    normalizeHex(teamDocument.teamColor) ||
    normalizeHex(teamDocument.color);

  if (directColor) return directColor;

  const rgb = teamDocument.color;
  if (
    rgb &&
    Number.isFinite(Number(rgb.r)) &&
    Number.isFinite(Number(rgb.g)) &&
    Number.isFinite(Number(rgb.b))
  ) {
    const channels = [rgb.r, rgb.g, rgb.b].map((channel) =>
      Math.max(0, Math.min(255, Math.round(Number(channel))))
    );
    return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
  }

  return fallback;
}
