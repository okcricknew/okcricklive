import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>OKCRICK | Professional Cricket Live Scoring App & Tournament Management</title>
        <meta name="description" content="Get real-time cricket live scoring, ball-by-ball updates, and pro-level tournament management. Build local leagues, track player stats, and stream with premium digital scoreboard overlays instantly." />
        <meta name="keywords" content="cricket live scoring app, live cricket scoring system, cricket tournament management software, cricket scoreboard overlay, local cricket league organizer, cricket match stats tracker" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://okcrick.in" />

        {/* Open Graph / Facebook (For Premium Social Sharing Links) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://okcrick.in" />
        <meta property="og:title" content="OKCRICK | Professional Cricket Live Scoring & Tournaments" />
        <meta property="og:description" content="Experience real-time ball-by-ball cricket scoring. Manage teams, track player performance, and use premium scoreboard overlays for your local tournaments." />
        <meta property="og:image" content="https://okcrick.in/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://okcrick.in" />
        <meta property="twitter:title" content="OKCRICK | Professional Cricket Live Scoring App" />
        <meta property="twitter:description" content="Experience real-time ball-by-ball cricket scoring with dynamic scoreboard overlays." />
        <meta property="twitter:image" content="https://okcrick.in/og-image.jpg" />
      </Head>

      {/* Main Premium Layout */}
      <main className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-black font-sans antialiased">
        
        {/* Subtle Background Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

        {/* Hero Section */}
        <section className="relative max-w-6xl mx-auto px-4 pt-24 pb-16 text-center z-10">
          {/* Feature Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6 backdrop-blur-sm animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Next-Gen Cricket Scoring Platform
          </span>

          {/* Premium Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15] bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Elevate Your Local Tournaments With <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">Pro-Level Live Scoring</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-white font-medium">OKCRICK</strong> delivers ultra-fast ball-by-ball updates, comprehensive tournament management, and dynamic scoreboard overlays tailored for modern cricket digital broadcasts.
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-semibold text-slate-950 transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transform hover:-translate-y-0.5">
              Start Live Scoring Free
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 font-semibold text-slate-200 transition-all duration-200 backdrop-blur-sm">
              Explore Broadcast Overlays
            </button>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="relative max-w-6xl mx-auto px-4 py-16 z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 font-bold text-lg group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Ball Updates</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Zero-lag scoring interface ensures your viewers get instant delivery, boundary, and wicket alerts seamlessly.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 font-bold text-lg group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Automatically generate detailed match charts, run-rate counters, partnership tracking, and full squad statistics.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 font-bold text-lg group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300">📺</div>
              <h3 className="text-xl font-bold text-white mb-2">Broadcast-Ready Overlays</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Professional, customizable HTML/CSS streaming overlays designed to give your streams a high-tier broadcast feel.</p>
            </div>

          </div>
        </section>

      </main>
    </>
  );
    }
          
