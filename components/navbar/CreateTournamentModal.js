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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center px-4 sm:px-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-amber-400 shadow-md">
              <Trophy size={22} />
            </div>
            <div>
              <h2 className="text-slate-900 font-extrabold uppercase tracking-tight text-xl leading-none">New Tournament</h2>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mt-1">Configure tournament details</p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose()}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm p-2 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <ModalInputWrapper icon={<Trophy size={18} className="text-slate-400" />}>
            <input
              required
              type="text"
              placeholder="Tournament Name"
              value={tName}
              onChange={(e) => setTName(e.target.value)}
              className="w-full bg-slate-50/80 focus:bg-white py-3.5 pl-12 pr-4 rounded-xl outline-none border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-100 font-semibold text-sm text-slate-800 transition-all placeholder:text-slate-400"
            />
          </ModalInputWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalInputWrapper icon={<UserPlus size={18} className="text-slate-400" />}>
              <input
                required
                type="text"
                placeholder="Organiser Name"
                value={tOrganiser}
                onChange={(e) => setTOrganiser(e.target.value)}
                className="w-full bg-slate-50/80 focus:bg-white py-3.5 pl-12 pr-4 rounded-xl outline-none border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-100 font-semibold text-sm text-slate-800 transition-all placeholder:text-slate-400"
              />
            </ModalInputWrapper>
            <ModalInputWrapper icon={<Phone size={18} className="text-slate-400" />}>
              <input
                required
                type="tel"
                placeholder="Mobile Number"
                value={tMobile}
                onChange={(e) => setTMobile(e.target.value)}
                className="w-full bg-slate-50/80 focus:bg-white py-3.5 pl-12 pr-4 rounded-xl outline-none border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-100 font-semibold text-sm text-slate-800 transition-all placeholder:text-slate-400"
              />
            </ModalInputWrapper>
          </div>

          <ModalInputWrapper icon={<MapPin size={18} className="text-slate-400" />}>
            <input
              required
              type="text"
              placeholder="Tournament Location"
              value={tLocation}
              onChange={(e) => setTLocation(e.target.value)}
              className="w-full bg-slate-50/80 focus:bg-white py-3.5 pl-12 pr-4 rounded-xl outline-none border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-100 font-semibold text-sm text-slate-800 transition-all placeholder:text-slate-400"
            />
          </ModalInputWrapper>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block ml-1">Tournament Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setTLogo(e.target.files?.[0] || null)}
              className="w-full bg-slate-50/80 py-3 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block ml-1">Start Date</label>
              <input
                required
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50/80 focus:bg-white py-3 px-4 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-100 text-xs font-semibold text-slate-800 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block ml-1">End Date</label>
              <input
                required
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50/80 focus:bg-white py-3 px-4 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-100 text-xs font-semibold text-slate-800 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl uppercase tracking-widest text-xs mt-6 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : 'Launch Tournament 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
                }
