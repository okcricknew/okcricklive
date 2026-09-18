import Head from "next/head";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <Head>
        {/* Advanced SEO Meta Tags */}
        <title>About Cricket Scoring System | OKCRICK Digital Live Scoring Platform</title>
        <meta
          name="description"
          content="Discover how the OKCRICK cricket live scoring system revolutionizes local tournaments. Real-time ball-by-ball updates, automated stats tracking, and professional digital scoreboard overlays for elite live streaming."
        />
        <meta
          name="keywords"
          content="cricket scoring system, digital cricket scoreboard, local cricket tournament organizer, live streaming scoreboard overlay, ball by ball cricket entry app"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://okcrick.in/about-cricket-scoring" />

        {/* Open Graph Tags for Social Previews */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content="About Cricket Scoring System | OKCRICK" />
        <meta property="og:description" content="Explore the ultimate digital toolkit for managing cricket leagues, real-time analytics, and broadcast-ready overlays." />
        <meta property="og:url" content="https://okcrick.in/about-cricket-scoring" />
        <meta property="og:image" content="https://okcrick.in/og-about-image.jpg" />
      </Head>

      {/* Premium Dark Theme Layout */}
      <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-black antialiased font-sans">
        
        {/* Decorative Grid Light Effect */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] pointer-events-none" />

        {/* Outer Container */}
        <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
          
          {/* Breadcrumb Navigation for Better Crawling */}
          <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-400">About Scoring System</span>
          </nav>

          {/* Main Article Header */}
          <header className="border-b border-slate-900 pb-8 mb-12">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              The Ultimate Digital <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">Cricket Scoring System</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-slate-400 leading-relaxed">
              OKCRICK is engineered to replace traditional paperwork with a lightning-fast, secure, and broadcast-ready cloud database architecture.
            </p>
          </header>

          {/* Article Content / Core Info */}
          <div className="space-y-12">
            
            {/* Section 1: Intro */}
            <section className="prose prose-invert max-w-none">
              <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                Modern cricket demands real-time data accessibility. <strong className="text-emerald-400 font-semibold">OKCRICK</strong> functions as a unified engine built for local cricket clubs, professional leagues, and grassroots tournaments. Whether you are operating on a smartphone or a laptop at the boundary line, our system securely syncs match progress directly with global viewers.
              </p>
            </section>

            {/* Section 2: Why Choose OKCRICK Grid */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 rounded bg-emerald-500 inline-block"></span>
                Why Choose a Digital Scoring Framework?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-all">
                  <h3 className="text-white font-semibold mb-2">Automated Math Engine</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Eliminate manually calculating complex stats like net run rates, bowling economies, or target predictions during rain shifts.</p>
                </div>
                <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-all">
                  <h3 className="text-white font-semibold mb-2">Instant Cloud Backups</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Never lose data to hardware errors or accidental closing. Your records remain safe via real-time database clusters.</p>
                </div>
              </div>
            </section>

            {/* Section 3: Premium Features List */}
            <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/60 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
                Core Broadcast Features Included
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✔</span>
                  <div>
                    <strong className="text-slate-200 block">Live Ball-by-Ball Logging</strong>
                    <span className="text-slate-400 text-sm">Responsive controls designed for instant data updates.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✔</span>
                  <div>
                    <strong className="text-slate-200 block">Streaming Overlays</strong>
                    <span className="text-slate-400 text-sm">Dynamic OBS compatible graphics for high-quality video outputs.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✔</span>
                  <div>
                    <strong className="text-slate-200 block">Tournament Analytics</strong>
                    <span className="text-slate-400 text-sm">Manage entire seasons, group stages, and leaderboards.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✔</span>
                  <div>
                    <strong className="text-slate-200 block">Player Profiles & Records</strong>
                    <span className="text-slate-400 text-sm">Track detailed bowling and batting career stats over seasons.</span>
                  </div>
                </li>
              </ul>
            </section>

            {/* Section 4: CTA */}
            <section className="text-center bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-8">
              <h2 className="text-lg sm:text-xl font-bold text-emerald-400 mb-2">Ready to Upgrade Your Match Day Operations?</h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto mb-6">Deploy professional tournament scoring controls instantly. No complex software installations required.</p>
              <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition-all shadow-md">
                Launch Dashboard
              </Link>
            </section>

          </div>

          {/* Footer Navigation */}
          <footer className="mt-16 pt-6 border-t border-slate-900 text-center">
            <Link href="/" className="text-slate-500 hover:text-emerald-400 text-sm transition-colors group">
              ← <span className="group-hover:underline">Return to main dashboard</span>
            </Link>
          </footer>

        </div>
      </main>
    </>
  );
        }
                  
