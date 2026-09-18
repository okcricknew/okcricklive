import React from 'react';
import { Home, ArrowLeft, Mail, Code2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Footer = () => {
  const router = useRouter();

  return (
    /* FULL WIDTH FIXED BOTTOM NAVBAR - NO CURVES */
    <footer className="fixed bottom-0 left-0 w-full z-[100]">
      {/* MAIN CONTAINER: Sharp edges, No border-radius */}
      <div className="w-full bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-3 md:p-4">
        
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* LEFT: Back Button - Sharp Corners */}
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center bg-slate-100 text-[#1D2939] p-3 rounded-none hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>

          {/* CENTER: Branding & Developer Info */}
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-1.5 mb-1">
               <Code2 size={10} className="text-[#FACC15]" />
               <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">Designed & Developed By</span>
            </div>
            <h2 className="text-[#1D2939] text-[12px] md:text-sm font-black italic uppercase tracking-tighter leading-none">
              Jagadish <span className="text-[#FACC15]">Kharsel</span>
            </h2>
            
            {/* Live Indicator */}
            <div className="mt-1.5 flex items-center gap-1.5 px-2 py-0.5 bg-green-500/5 border border-green-500/10 rounded-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              <span className="text-[7px] font-bold text-green-600 uppercase tracking-widest">v2.0 Stable</span>
            </div>
          </div>

          {/* RIGHT: Action Icons - Sharp Corners */}
          <div className="flex items-center gap-2">
            <Link href="/" className="bg-[#1D2939] text-white p-3 rounded-none shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2">
              <Home size={18} className="text-[#FACC15]" />
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest italic pr-1">Base</span>
            </Link>

            <Link href="/contact" className="p-3 bg-white text-[#1D2939] rounded-none border border-slate-200 hover:border-[#1D2939] transition-all active:scale-95">
              <Mail size={18} />
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
