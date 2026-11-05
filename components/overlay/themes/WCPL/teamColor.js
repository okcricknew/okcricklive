// WCPL team-color helpers. These functions are deterministic and safe on the server.
function normalizeColor(value) {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(clean)) return clean;
  if (/^#[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  const rgb = clean.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (rgb) {
    const channels = rgb.slice(1, 4).map((part) => Math.max(0, Math.min(255, Number(part))));
    return `rgb(${channels.join(", ")})`;
  }
  return null;
}

export function getTeamPanelColor(teamDocument, fallback) {
  if (!teamDocument) return fallback;
  const candidates = [teamDocument.colorHex, teamDocument.teamColor, teamDocument.color];
  for (const candidate of candidates) {
    const normalized = normalizeColor(candidate);
    if (normalized) return normalized;
    if (candidate && typeof candidate === "object") {
      const values = [candidate.r, candidate.g, candidate.b];
      if (values.every((value) => Number.isFinite(Number(value)))) {
        const channels = values.map((value) => Math.max(0, Math.min(255, Math.round(Number(value)))));
        return `rgb(${channels.join(", ")})`;
      }
    }
  }
  return fallback;
}

function toRgb(color) {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    return [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16));
  }
  const match = color.match(/\d+(?:\.\d+)?/g);
  return match ? match.slice(0, 3).map(Number) : null;
}

function luminanceChannel(value) {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function getReadableTextColor(backgroundColor) {
  const rgb = toRgb(normalizeColor(backgroundColor) || "#777777");
  if (!rgb) return "#FFFFFF";
  const [r, g, b] = rgb.map(luminanceChannel);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const whiteContrast = 1.05 / (luminance + 0.05);
  const blackContrast = (luminance + 0.05) / 0.05;
  return whiteContrast >= blackContrast ? "#FFFFFF" : "#111111";
}
