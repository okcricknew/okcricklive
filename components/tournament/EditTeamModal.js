import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function hexToHsv(hex) {
  const clean = (hex || "#004BA0").replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : delta / max, v: max };
}

function hsvToHex(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return `#${rgb.map((n) => Math.round((n + m) * 255).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export default function EditTeamModal({
  isOpen,
  onClose,
  editingTeam,
  editTeamName,
  setEditTeamName,
  setEditTeamLogo,
  editTeamColor,
  setEditTeamColor,
  handleUpdateTeam,
}) {
  // Safe default color extraction from editingTeam or editTeamColor prop
  const initialColor = editTeamColor || editingTeam?.colorHex || editingTeam?.teamColor || "#004BA0";
  const [hsv, setHsv] = useState(() => hexToHsv(initialColor));
  const [showColorPicker, setShowColorPicker] = useState(false);

  const fieldRef = useRef(null);
  const hueRef = useRef(null);
  const draggingField = useRef(false);
  const draggingHue = useRef(false);

  // Sync color when modal opens or editingTeam changes
  useEffect(() => {
    const activeCol = editTeamColor || editingTeam?.colorHex || editingTeam?.teamColor || "#004BA0";
    setHsv(hexToHsv(activeCol));
  }, [editingTeam, editTeamColor, isOpen]);

  const updateColor = (next) => {
    setHsv(next);
    const hex = hsvToHex(next.h, next.s, next.v);
    if (setEditTeamColor) {
      setEditTeamColor(hex);
    }
  };

  const updateFieldFromPointer = (event) => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const v = 1 - Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    updateColor({ ...hsv, s, v });
  };

  const updateHueFromPointer = (event) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;
    const h = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * 360;
    updateColor({ ...hsv, h: Math.min(359.99, h) });
  };

  const selectedColor = hsvToHex(hsv.h, hsv.s, hsv.v);
  const rgb = selectedColor.match(/[A-F0-9]{2}/gi)?.map((part) => parseInt(part, 16)) || [0, 75, 160];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 bg-[#0C381E]/60 backdrop-blur-xs"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "tween", duration: 0.22 }}
            className="relative bg-white border border-emerald-200 w-full max-w-md overflow-hidden flex flex-col shadow-2xl rounded-3xl z-10 p-6"
          >
            <div className="flex justify-between items-center pb-4 border-b border-emerald-100">
              <h2 className="text-base font-black italic uppercase text-[#0C381E]">Edit Team</h2>
              <button onClick={onClose} className="p-2 bg-emerald-50 border border-emerald-200 rounded-full active:scale-90 transition-all hover:bg-emerald-100 cursor-pointer">
                <X size={16} className="text-[#0C381E]" />
              </button>
            </div>

            <form onSubmit={handleUpdateTeam} className="space-y-4 pt-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-emerald-800 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="w-full bg-emerald-50/50 border border-emerald-200 px-4 py-3 rounded-xl text-xs font-black uppercase italic outline-none focus:border-red-600 text-[#0C381E]"
                  placeholder="TEAM NAME..."
                />
              </div>

              {/* Team Color Picker Trigger */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-emerald-800 mb-1">Team Color</label>
                <div className="rounded-xl border border-emerald-200 p-2.5 flex items-center justify-between gap-3 bg-emerald-50/30">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-700">Select Spectrum Color</p>
                    <p className="text-[9px] text-gray-400">Click to change team color shade</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 shadow-sm bg-white hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <div className="h-5 w-5 shrink-0 rounded-md border border-black/10 shadow-inner" style={{ backgroundColor: selectedColor }} />
                    <span className="text-[10px] font-bold uppercase text-gray-700">{selectedColor}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-emerald-800 mb-1">Update Team Logo (Optional)</label>
                <div className="flex items-center gap-3">
                  {Boolean(editingTeam?.logoUrl) && (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0C381E] border border-emerald-300 shrink-0 flex items-center justify-center p-1">
                      <img src={editingTeam.logoUrl} alt="Current Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditTeamLogo(e.target.files?.[0] || null)}
                    className="flex-1 text-[10px] text-gray-500 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-100 file:text-[#0C381E] cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0C381E] hover:bg-emerald-900 text-yellow-300 font-black py-3 rounded-xl shadow-md active:scale-95 transition-all text-xs uppercase tracking-wider mt-2 cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Sub Color Picker Popup Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-4 border border-emerald-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0C381E]">Edit Team Color</h3>
              <button
                type="button"
                onClick={() => setShowColorPicker(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Saturation/Brightness Box */}
            <div
              ref={fieldRef}
              role="application"
              aria-label="Full color spectrum. Drag to choose saturation and brightness."
              onPointerDown={(event) => {
                draggingField.current = true;
                event.currentTarget.setPointerCapture?.(event.pointerId);
                updateFieldFromPointer(event);
              }}
              onPointerMove={(event) => draggingField.current && updateFieldFromPointer(event)}
              onPointerUp={() => { draggingField.current = false; }}
              onPointerCancel={() => { draggingField.current = false; }}
              className="relative h-44 w-full overflow-hidden rounded-lg cursor-crosshair select-none touch-none"
              style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)`, backgroundImage: "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)" }}
            >
              <span
                className="pointer-events-none absolute h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,.65)]"
                style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, transform: "translate(-50%, -50%)" }}
              />
            </div>

            {/* Hue Slider */}
            <div className="space-y-1">
              <div
                ref={hueRef}
                role="slider"
                aria-label="Hue spectrum"
                aria-valuemin={0}
                aria-valuemax={360}
                aria-valuenow={Math.round(hsv.h)}
                tabIndex={0}
                onPointerDown={(event) => {
                  draggingHue.current = true;
                  event.currentTarget.setPointerCapture?.(event.pointerId);
                  updateHueFromPointer(event);
                }}
                onPointerMove={(event) => draggingHue.current && updateHueFromPointer(event)}
                onPointerUp={() => { draggingHue.current = false; }}
                onPointerCancel={() => { draggingHue.current = false; }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowUp") updateColor({ ...hsv, h: (hsv.h + 1) % 360 });
                  if (event.key === "ArrowLeft" || event.key === "ArrowDown") updateColor({ ...hsv, h: (hsv.h + 359) % 360 });
                }}
                className="relative h-5 rounded-full cursor-pointer touch-none"
                style={{ background: "linear-gradient(to right, #f00 0%, #ff0 16.66%, #0f0 33.33%, #0ff 50%, #00f 66.66%, #f0f 83.33%, #f00 100%)" }}
              >
                <span className="pointer-events-none absolute top-1/2 h-7 w-3 rounded-md border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,.7)]" style={{ left: `${(hsv.h / 360) * 100}%`, transform: "translate(-50%, -50%)", backgroundColor: `hsl(${hsv.h},100%,50%)` }} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-gray-600">
              <span className="uppercase tracking-wider">RGB: {rgb[0]}, {rgb[1]}, {rgb[2]}</span>
              <span className="uppercase tracking-wider">{selectedColor}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowColorPicker(false)}
              className="w-full bg-[#0C381E] hover:bg-[#0c381ee0] text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Done / Select Color
            </button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
  
