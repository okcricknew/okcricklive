import Head from 'next/head';

export default function CricketThemesPage() {
  const metadata = {
    title: 'Cricket Scoreboard Overlay Themes | Live Scoring Graphics for Streamers',
    description: 'Download the best cricket scoreboard overlay themes for live streaming. Professional overlays for OBS, YouTube, and live cricket scoring apps with modern UI design.',
    keywords: 'cricket scoreboard overlay, live cricket overlay themes, OBS cricket overlay, cricket live score graphics, cricket streaming overlay, scoreboard UI design',
  };

  return (
    <>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-[#0f172a] text-white font-sans">
        <header className="text-center py-12 px-4 bg-[#1e293b] shadow-lg">
          <h1 className="text-3xl md:text-4xl font-bold text-[#38bdf8] mb-2">
            Cricket Scoreboard Overlay Themes
          </h1>
          <p className="text-lg text-slate-300">
            Professional Live Cricket Streaming Overlays
          </p>
        </header>

        <main className="max-w-4xl mx-auto p-6 space-y-6">
          <section className="bg-[#1e293b] p-6 rounded-xl border border-slate-700 hover:border-[#38bdf8] transition-colors">
            <h2 className="text-2xl font-semibold mb-3 text-[#38bdf8]">Modern Cricket Overlay Designs</h2>
            <p className="leading-relaxed text-slate-300">
              Our cricket scoreboard overlay themes are designed for professional live streaming, 
              including YouTube Live, Facebook Live, and OBS streaming software.
            </p>
          </section>

          <section className="bg-[#1e293b] p-6 rounded-xl border border-slate-700">
            <h2 className="text-2xl font-semibold mb-3 text-[#38bdf8]">Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0">
              {[
                "Live Score Updates",
                "Player Stats Display",
                "Custom Team Names & Logos",
                "Mobile Friendly UI",
                "Fast Loading & Optimized Design"
              ].map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="text-[#38bdf8]">✓</span>
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-[#1e293b] p-6 rounded-xl border border-slate-700 text-center">
            <h2 className="text-2xl font-semibold mb-3 text-[#38bdf8]">Download Cricket Overlay</h2>
            <p className="text-slate-300 mb-6">
              Get high-quality cricket scoreboard overlay themes for free or premium use.
            </p>
            <button className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0f172a] font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105">
              Browse Themes
            </button>
          </section>
        </main>
      </div>
    </>
  );
                }
