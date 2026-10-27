import { X, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SquadModal({
  isOpen,
  onClose,
  activeTeam,
  teamPlayers,
  playerName,
  setPlayerName,
  setPlayerPhoto,
  handleAddPlayer,
  handleDeletePlayer,
  onEditPlayer, // <-- Added prop
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 bg-[#0C381E]/60 backdrop-blur-xs"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{
              type: "tween",
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative bg-white border-t border-emerald-200 w-full max-w-lg overflow-hidden flex flex-col h-[75vh] sm:h-[600px] shadow-2xl rounded-t-[1.5rem] sm:rounded-3xl will-change-transform"
          >

            <div className="p-6 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50">
              <h2 className="text-lg font-black italic uppercase text-[#0C381E] truncate pr-4">{activeTeam?.name}</h2>
              <button onClick={onClose} className="p-2 bg-white border border-emerald-200 rounded-full active:scale-90 transition-all hover:bg-emerald-50"><X size={18} className="text-[#0C381E]" /></button>
            </div>
            
            <div className="p-4 bg-emerald-50/30 border-b border-emerald-100">
              <form onSubmit={handleAddPlayer} className="flex gap-2">
                <input autoFocus type="text" required placeholder="PLAYER NAME..." value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="flex-1 bg-white border border-emerald-200 px-4 py-3 rounded-xl text-xs font-black uppercase italic outline-none focus:border-red-600 text-[#0C381E]" />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPlayerPhoto(e.target.files[0])}
                  className="text-[10px] w-[110px] text-gray-500 file:py-2 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-100 file:text-[#0C381E] cursor-pointer"
                />

                <button type="submit" className="bg-[#0C381E] hover:bg-emerald-900 text-yellow-300 font-bold px-4 rounded-xl shadow-md active:scale-95 shrink-0 text-xs">Add Player</button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar pb-24">
              {teamPlayers.map((p, index) => (
                <div key={p.id} className="flex items-center justify-between p-3.5 bg-white border border-emerald-100 rounded-xl shadow-sm hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0C381E] flex items-center justify-center shrink-0 border border-emerald-300">
                      {p.photoUrl ? (
                        <img
                          src={p.photoUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-yellow-300 text-[11px] font-black">
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-black uppercase text-[#0C381E] truncate">
                      {p.name}
                    </span>
                  </div>
                               
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onEditPlayer(p)} className="p-1.5 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600 transition-all">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDeletePlayer(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-600 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
