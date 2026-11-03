const TEAM_COLOR_PRESETS = [
  { name: "Mumbai Indians Blue", value: "#004BA0" },
  { name: "Rajasthan Royals Pink", value: "#EA1A85" },
  { name: "Chennai Super Kings Yellow", value: "#FFCC00" },
  { name: "Royal Challengers Red", value: "#D71920" },
  { name: "Kolkata Knight Riders Purple", value: "#3A225D" },
  { name: "Delhi Capitals Blue", value: "#17479E" },
];

export default function AddTeamCard({ teamName, setTeamName, setTeamLogo, teamColor, setTeamColor, handleAddTeam }) {
  return (
    <div className="mb-8 max-w-lg mx-auto">
      <div className="bg-white p-4 border border-emerald-200 rounded-2xl shadow-sm space-y-3">
        <input
          type="text"
          placeholder="NEW TEAM NAME..."
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full bg-emerald-50/60 rounded-xl px-3 py-3 text-xs outline-none font-black uppercase text-[#0C381E] placeholder:text-gray-400"
        />

        <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
          <label className="relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-white shadow ring-1 ring-gray-200" style={{ backgroundColor: teamColor }} title="Choose team color">
            <input
              type="color"
              value={teamColor}
              onChange={(e) => setTeamColor(e.target.value)}
              aria-label="Choose team color"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow">PICK</span>
          </label>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-700">Team color</p>
            <p className="mt-1 text-xs font-bold uppercase text-gray-500">{teamColor}</p>
            <p className="mt-1 text-[9px] text-gray-400">Color box par tap karke drag se shade choose karein</p>
          </div>
          <div className="h-10 w-10 rounded-lg border border-black/10" style={{ backgroundColor: teamColor }} />
        </div>

        <div className="flex flex-wrap gap-2">
          {TEAM_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              title={preset.name}
              aria-label={`Set ${preset.name}`}
              onClick={() => setTeamColor(preset.value)}
              className={`h-7 w-7 rounded-full border-2 transition-transform active:scale-90 ${teamColor.toLowerCase() === preset.value.toLowerCase() ? "border-gray-900 scale-110" : "border-white ring-1 ring-gray-200"}`}
              style={{ backgroundColor: preset.value }}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setTeamLogo(e.target.files?.[0] || null)}
            className="min-w-0 flex-1 text-[10px] text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-[#0C381E]"
          />
          <button onClick={handleAddTeam} className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 font-black italic text-[10px] uppercase rounded-xl active:scale-95 transition-all shadow-sm">
            Add Team
          </button>
        </div>
      </div>
    </div>
  );
}
