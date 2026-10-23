import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, UserPlus, Phone, MapPin } from 'lucide-react';
import ModalInputWrapper from './ModalInputWrapper';

export default function CreateTournamentModal({
  isOpen,
  loading,
  onClose,
  onSubmit,
  tName,
  setTName,
  tOrganiser,
  setTOrganiser,
  tMobile,
  setTMobile,
  tLocation,
  setTLocation,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  setTLogo,
}) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="create-tournament-modal"
          className="fixed inset-0 z-[1100] flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: 'linear' }}
        >
          <motion.div
            className="absolute inset-0 bg-[#1D2939]/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'linear' }}
            onClick={() => !loading && onClose()}
          />

          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 4 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md bg-white rounded-[1rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#1D2939] rounded-2xl flex items-center justify-center text-[#FACC15] shadow-lg">
                <Trophy size={24} />
              </div>
              <div>
                <h2 className="text-[#1D2939] font-black italic uppercase text-xl leading-none">New Tournament</h2>
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">Fill tournament details</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <ModalInputWrapper icon={<Trophy size={18} />}>
                <input required type="text" placeholder="Tournament Name" value={tName} onChange={(e) => setTName(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
              </ModalInputWrapper>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ModalInputWrapper icon={<UserPlus size={18} />}>
                  <input required type="text" placeholder="Organiser" value={tOrganiser} onChange={(e) => setTOrganiser(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
                </ModalInputWrapper>
                <ModalInputWrapper icon={<Phone size={18} />}>
                  <input required type="tel" placeholder="Mobile" value={tMobile} onChange={(e) => setTMobile(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
                </ModalInputWrapper>
              </div>

              <ModalInputWrapper icon={<MapPin size={18} />}>
                <input required type="text" placeholder="Location" value={tLocation} onChange={(e) => setTLocation(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
              </ModalInputWrapper>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tournament Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTLogo(e.target.files?.[0] || null)}
                  className="w-full bg-slate-50 py-3 px-4 rounded-xl border border-slate-100 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] text-slate-400 font-black ml-2 uppercase tracking-widest">Start Date</label>
                  <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 py-3.5 px-4 rounded-xl border border-slate-100 text-xs font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] text-slate-400 font-black ml-2 uppercase tracking-widest">End Date</label>
                  <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 py-3.5 px-4 rounded-xl border border-slate-100 text-xs font-bold" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#1D2939] text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs mt-4 active:scale-95 transition-all">
                {loading ? 'Processing...' : 'Launch Tournament 🚀'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
            }
