import Link from "next/link"; 
import { Zap, Shield, Globe, BarChart3, Users, Star, MessageSquare, ArrowUpRight } from "lucide-react"; 
import { motion } from "framer-motion";
import Head from "next/head";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getHomeInitialProps } from "../lib/ssr/home";

export default function Home({ initialMatch = null }) { 
  const fastTransition = { duration: 0.1, ease: "easeOut" };

  const [user, setUser] = useState(null);
  const [match, setMatch] = useState(initialMatch);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const tId = "demo_tournament"; 
    const mId = "demo_match";
    const ref = doc(db, "tournaments", tId, "matches", mId);

    const cached = localStorage.getItem(`match_${mId}`);
    if (cached) {
      setMatch(JSON.parse(cached));
    }

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setMatch(data);
        localStorage.setItem(`match_${mId}`, JSON.stringify(data));
      }
    });

    return () => unsub();
  }, []);

  return ( 
    <>
      <Head>
        <title>OKCRICK | Professional Cricket Live Scoring App & Tournament Management</title>
        <meta name="description" content="Manage cricket leagues with real-time analytics, ultra-low latency updates, and premium OBS compatible scoreboard overlays instantly." />
        <meta name="keywords" content="cricket live scoring app, cricket tournament management system, live scoreboard overlay, local cricket organizer" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://okcrick.in" />
      </Head>
              
      <motion.div 
        initial={false} 
        animate={{ opacity: 1, y: 0 }} 
        transition={fastTransition} 
        className="w-full bg-[#F8FAFC] min-h-screen text-slate-900 font-sans flex flex-col selection:bg-slate-900 selection:text-white antialiased"
      >
        {/* Abstract Sophisticated Light Glow Pattern */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[350px] bg-gradient-to-b from-emerald-500/5 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

        {/* Core Layout Controller */}
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 flex-1 space-y-6 overflow-y-auto no-scrollbar pb-12 z-10">

          {/* Premium Light Hero Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-white mb-5 tracking-wider uppercase">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              Pro Dashboard Engine
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-none text-slate-900 uppercase">
              Cricket Live Scoring &<br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Tournament System</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-3 mb-6 leading-relaxed font-medium">
              Experience lightning-fast data entry interfaces integrated with OBS web overlays designed for professional streaming layouts.
            </p>

            {!user && (
              <button
                onClick={() => {
                  window.dispatchEvent(new Event("openAuthModal"));
                }}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-slate-900/10 transform hover:-translate-y-0.5"
              >
                Get Started Free
              </button>
            )}
            <Star className="absolute -right-6 -top-6 text-slate-100 w-36 h-36 pointer-events-none group-hover:rotate-12 transition-transform duration-700 ease-out" />
          </div>

          {/* High-Tier Contact Component */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row items-center sm:justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="bg-emerald-50 w-11 h-11 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0 shadow-sm">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Direct Enterprise Support</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Connect instantly via WhatsApp for customized platform integrations.
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/+919937606890?text=Hi%20OKCRICK%2C%20I%20want%20to%20start%20live%20scoring"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wide transition-all shadow-sm"
            >
              Chat on WhatsApp
            </a>
          </div>

          {/* High-End Clean Stats Grid */}
          <div className="bg-white rounded-2xl p-6 flex justify-around border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.01)] relative overflow-hidden">
            <div className="text-center z-10">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">850+</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">Matches</p>
            </div>
            <div className="w-[1px] bg-slate-100 my-1" />
            <div className="text-center z-10">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">4.8k</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">Players</p>
            </div>
            <div className="w-[1px] bg-slate-100 my-1" />
            <div className="text-center z-10">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">15+</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">Cities</p>
            </div>
            <BarChart3 className="absolute w-28 h-28 text-slate-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Minimalist Feature Cards Framework */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Feature icon={<Zap size={18} className="text-amber-500"/>} title="Fast Sync" desc="0.5s updates" />
            <Feature icon={<Shield size={18} className="text-blue-600"/>} title="Secure" desc="Safe system" />
            <Feature icon={<Users size={18} className="text-purple-600"/>} title="Teams" desc="Player stats" />
            <Feature icon={<Globe size={18} className="text-emerald-600"/>} title="Global" desc="Share anywhere" />
          </div>

          {/* Luxury Video Tutorial Module */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.01)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 w-11 h-11 rounded-xl flex items-center justify-center text-slate-900 border border-slate-200/40">
                  <Zap size={18} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Media Tutorial Framework</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Learn professional operations under 2 minutes</p>
                </div>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-md hidden sm:inline-flex items-center gap-1">
                HD Quality <ArrowUpRight size={12} />
              </span>
            </div>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-inner">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/" 
                title="Tutorial Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            <p className="text-[9px] text-center text-slate-400 font-extrabold uppercase tracking-[0.25em]">
              Access full learning deployment parameters on YouTube
            </p>
          </div>
        </div>

        {/* Clean Minimalist Footer */}
        <footer className="py-6 px-8 text-center border-t border-slate-200/60 z-10 backdrop-blur-md bg-white/40">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="h-[1px] w-6 bg-slate-200" />
            <Star size={10} className="text-slate-300" />
            <div className="h-[1px] w-6 bg-slate-200" />
          </div>
          <p className="text-[9px] text-slate-400 uppercase tracking-[0.4em] font-bold">
            OKCRICK PRO MODULE ENGINE
          </p>
        </footer>

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
      </motion.div>
    </>
  ); 
}

function Feature({ icon, title, desc }) { 
  return ( 
    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:border-slate-300 transition-all group"> 
      <div className="bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-slate-100 group-hover:scale-105 transition-transform shadow-sm"> 
        {icon} 
      </div> 
      <h4 className="text-[11px] font-extrabold uppercase text-slate-900 tracking-wide">{title}</h4> 
      <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-normal">{desc}</p> 
    </div> 
  ); 
    }
            


export async function getServerSideProps() {
  try {
    const props = await getHomeInitialProps();
    return { props };
  } catch (error) {
    console.error("Home SSR failed:", error);
    // Never break the existing client UI if Admin SDK is not configured yet.
    return { props: { initialMatch: null } };
  }
}
