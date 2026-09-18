"use client";
import { useState } from "react";
import OverlayControlModal from "../overlay/themes/OverlayControlModal";
import { Undo2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KeypadSection({ 
  isProcessing, isOverComplete, isInningsOver, handleBall, undoLastBall, 
  setIsExtraModalOpen, setIsOutModalOpen, setSelectedExtraType,
  setIsCustomRunModalOpen, router, tId, match
}) {

  const [openOverlay, setOpenOverlay] = useState(false);
  const isKeypadDisabled = isOverComplete || isInningsOver;
  const btnBase = "flex items-center justify-center font-black select-none w-full h-full touch-none";

  const renderButton = (label, onClick, variant = "white", extraClass = "") => {
    const variants = {
      white: "bg-white text-slate-800 active:bg-slate-100",
      amber: "bg-amber-400 text-black active:bg-amber-500",
      blue: "bg-blue-600 text-white active:bg-blue-700",
      red: "bg-red-600 text-white italic uppercase active:bg-red-700",
      slate: "bg-slate-900 text-white uppercase tracking-widest active:bg-black",
      undo: "bg-slate-50 text-slate-400 active:bg-slate-100"
    };

    return (
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onClick}
        disabled={isKeypadDisabled || (isProcessing && variant !== 'undo')}
        className={`${btnBase} ${variants[variant]} ${extraClass} ${
          isProcessing ? 'cursor-default' : 'cursor-pointer'
        }`}
      >
        {label}
      </motion.button>
    );
  };

  return (
    <>
      {/* FIX: flex-1 hata kar max-height lagayi hai taaki buttons chote ho jayein */}
      <div className="flex flex-col h-[250px] bg-gray-300 overflow-hidden relative border-t border-slate-400">

        {/* Upper Keypad Grid - h-full rakha hai taaki ye 380px mein fit ho jaye */}
        <div className="grid grid-cols-4 grid-rows-3 gap-[2px] h-full">

          {/* Number Grid */}
          <div className="col-span-3 row-span-2 grid grid-cols-3 grid-rows-2 gap-[2px]">
            {[0, 1, 2, 3].map((num) => (
              <div key={num}>
                {renderButton(num, () => handleBall(num), "white", "text-3xl")}
              </div>
            ))}
            {renderButton(4, () => handleBall(4), "amber", "text-3xl")}
            {renderButton(6, () => handleBall(6), "blue", "text-3xl")}
          </div>

          {/* Sidebar */}
          <div className="col-span-1 row-span-2 flex flex-col gap-[2px]">
            {renderButton(<Undo2 size={24} strokeWidth={3} />, () => undoLastBall(), "undo", "flex-1")}
            {renderButton("5/7/P", () => setIsCustomRunModalOpen(true), "white", "flex-1 text-2xl")}
            {renderButton("OUT", () => !isProcessing && setIsOutModalOpen(true), "red", "flex-[1.5] text-2xl")}
          </div>

          {/* Extras */}
          <div className="col-span-3 grid grid-cols-4 gap-[2px]">
            {[{ label: 'WD', type: 'WD' }, { label: 'NB', type: 'NB' }, { label: 'LB', type: 'LB' }, { label: 'BYE', type: 'BYE' }].map((ex) => (
              <div key={ex.type}>
                {renderButton(ex.label, () => { setSelectedExtraType(ex.type); setIsExtraModalOpen(true); }, "white", "text-[12px] text-slate-600")}
              </div>
            ))}
          </div>

          {/* Shortcut */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => router?.push(`/tournament/${tId}/match/${match?.id}/shortcuts`)}
            disabled={isProcessing}
            className={`${btnBase} bg-slate-900 text-white col-span-1`}
          >
            <div className="flex flex-col items-center">
              <span className="text-[10px] leading-none opacity-70 uppercase">Short Cut</span>
              <span className="text-sm font-black tracking-tighter">SCORING</span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Bottom Bar ko keypad ke bahar rakha hai taaki height fixed rahe */}
      <div className="w-full h-14 flex items-center justify-center bg-slate-900 shrink-0 border-t border-white/5">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpenOverlay(true)}
          className="text-white text-[15px] font-black uppercase tracking-[0.2em]"
        >
          Overlay Control
        </motion.button>
      </div>

      <OverlayControlModal
        isOpen={openOverlay}
        onClose={() => setOpenOverlay(false)}
        tId={tId}
        matchId={match?.id}
        match={match}
      />
    </>
  );
}
