import { useEffect, useRef, useState } from "react";

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

export default function AddTeamCard({ teamName, setTeamName, setTeamLogo, teamColor, setTeamColor, handleAddTeam }) {
  const [hsv, setHsv] = useState(() => hexToHsv(teamColor));
  const [showColorPicker, setShowColorPicker] = useState(false); // Popup open/close state
  const fieldRef = useRef(null);
  const hueRef = useRef(null);
  const draggingField = useRef(false);
  const draggingHue = useRef(false);

  useEffect(() => {
    setHsv(hexToHsv(teamColor));
  }, [teamColor]);

  const updateColor = (next) => {
    setHsv(next);
    setTeamColor(hsvToHex(next.h, next.s, next.v));
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
  const rgb = selectedColor.match(/[A-F0-9]{2}/gi).map((part) => parseInt(part, 16));

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

        {/* Color Trigger Section */}
        <div className="rounded-xl border border-gray-200 p-3 flex items-center justify-between gap-3">  
          <div>  
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-700">Choose any team color</p>  
            <p className="mt-1 text-[10px] text-gray-400">Click karke color spectrum popup open karein</p>  
          </div>  
          
          <button
            type="button"
            onClick={() => setShowColorPicker(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-black/10 shadow-sm bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <div className="h-6 w-6 shrink-0 rounded-md border border-black/10 shadow-inner" style={{ backgroundColor: selectedColor }} />  
            <span className="text-[10px] font-bold uppercase text-gray-700">{selectedColor}</span>
          </button>
        </div>  

        {/* Color Picker Popup Modal */}
        {showColorPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-4 border border-emerald-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0C381E]">Select Team Color</h3>
                <button
                  type="button"
                  onClick={() => setShowColorPicker(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-sm px-2 py-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Full saturation/brightness spectrum: drag horizontally and vertically. */}  
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

              {/* Continuous rainbow hue spectrum. */}  
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
                Done / Select
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">  
          <input  
            type="file"  
            accept="image/*"  
            onChange={(e) => setTeamLogo(e.target.files?.[0] || null)}  
            className="min-w-0 flex-1 text-[10px] text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-[#0C381E]"  
          />  
          <button onClick={handleAddTeam} className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 font-black italic text-[10px] uppercase rounded-xl active:scale-95 transition-all shadow-sm cursor-pointer">  
            Add Team  
          </button>  
        </div>  
      </div>  
    </div>
  );
            }
                    
