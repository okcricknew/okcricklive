import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditTeamModal({
  isOpen,
  onClose,
  editingTeam,
  editTeamName,
  setEditTeamName,
  setEditTeamLogo,
  handleUpdateTeam,
}) {
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
              <button onClick={onClose} className="p-2 bg-emerald-50 border border-emerald-200 rounded-full active:scale-90 transition-all hover:bg-emerald-100">
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
                className="w-full bg-[#0C381E] hover:bg-emerald-900 text-yellow-300 font-black py-3 rounded-xl shadow-md active:scale-95 transition-all text-xs uppercase tracking-wider mt-2"
              >
                Save Changes
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
                    }
