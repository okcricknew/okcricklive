import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Phone, Mail } from 'lucide-react';
import ModalInputWrapper from './ModalInputWrapper';

const backdropAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.16, ease: 'linear' }
};

const modalAnimation = {
  initial: { y: 8, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 8, opacity: 0 },
  transition: { duration: 0.16, ease: 'easeOut' }
};

export default function AuthModal({
  isOpen,
  loading,
  authMode,
  setAuthMode,
  onClose,
  onSubmit,
  onForgotPassword,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  mobile,
  setMobile,
  showPass,
  setShowPass,
}) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="auth-modal"
          className="fixed inset-0 z-[1100] flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: 'linear' }}
        >
          <motion.div
            className="absolute inset-0 bg-[#1D2939]/90 backdrop-blur-md"
            {...backdropAnimation}
            onClick={() => !loading && onClose()}
          />

          <motion.div
            {...modalAnimation}
            className="relative z-10 w-full max-w-md bg-white rounded-[1rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200">
              <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-[#1D2939] text-white shadow-lg' : 'text-slate-400'}`}>Login</button>
              <button type="button" onClick={() => setAuthMode('register')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'register' ? 'bg-[#1D2939] text-white shadow-lg' : 'text-slate-400'}`}>Register</button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <ModalInputWrapper icon={<User size={18} />}>
                    <input required type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
                  </ModalInputWrapper>
                  <ModalInputWrapper icon={<Phone size={18} />}>
                    <input required type="tel" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
                  </ModalInputWrapper>
                </>
              )}

              <ModalInputWrapper icon={<Mail size={18} />}>
                <input required type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
              </ModalInputWrapper>

              <div className="relative">
                <ModalInputWrapper icon={<Lock size={18} />}>
                  <input required type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-12 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
                </ModalInputWrapper>
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {authMode === 'login' && (
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={onForgotPassword} className="text-[11px] font-bold text-[#1D2939] hover:text-[#FACC15]">
                    Forgot Password?
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-[#1D2939] text-white font-black py-5 rounded-2xl shadow-[0_10px_20px_-5px_rgba(29,41,57,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(29,41,57,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300 uppercase tracking-[0.2em] text-[10px] mt-4 flex items-center justify-center gap-2 group">
                {loading ? 'Processing....' : (authMode === 'login' ? 'Login Now' : 'Create Account')}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
                }
        
