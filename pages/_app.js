import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Layout from '../components/Layout'
import { useRouter } from 'next/router';
import Head from 'next/head';


function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // router.query is available during SSR and on the client.
  // This removes the server/client markup mismatch caused by window.location.
  const isLiveOverlay = typeof router.query.theme === 'string';



  return (
    <div className={`min-h-screen w-full ${isLiveOverlay ? 'bg-transparent' : 'bg-[#F4F4F4]'}`}>
      <Head>
        <title>OKCRICK.IN | Cricket Live Scoring App | Tournament Scoreboard & Overlay Themes | OK CRICK</title>
  <link rel="canonical" href="https://okcrick.in" />
  
  <meta name="description" content="Cricket live scoring app for tournaments with real-time scoreboard, ball-by-ball updates and overlay themes system." />
        <meta name="application-name" content="OK CRICK" />
        <meta name="apple-mobile-web-app-title" content="OK CRICK" />
        <meta property="og:site_name" content="OK CRICK" />
        <meta property="og:title" content="OKCRICK.IN | Professional Cricket Live Scoring WebApp" />
        <meta property="og:description" content="Next-Gen Scoring Hub for local matches. Ok crick. Ok Cricket. Live scoring overlay scoreboard. cricket scoreboard overlay free. cricket scoreboard overlay themes free" />
        
        {/* 🔥 Logo Fix: Added Versioning and multiple sizes for better domain detection */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icon.png" /> 
        
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#1D2939" />

        <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "OKCRICK",
      "alternateName": ["OK CRICK", "OkCrick.in"],
      "url": "https://okcrick.in",
      "description": "Professional Cricket Live Scoring WebApp"
    })
  }}
/>
  

          <meta name="google-site-verification" content="boehoyQyzzyR9GYJBuS5ettc4yMzhmNKi2wj1tlk84g" />
        
{/*  <meta name="google-site-verification" content="tQXKMJCtG19512-Xrt5ZmUZrElhCMDxgSF26YnErRQI" /> */}
      </Head>
    
      {!isLiveOverlay && <Navbar />}
      
      {isLiveOverlay ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <main className="w-full h-auto">
            <div className="w-full">
              <Component {...pageProps} />
            </div>
          </main>
        </Layout>
      )}

      <style jsx global>{`
        body {
          background-color: ${isLiveOverlay ? 'transparent !important' : '#F4F4F4'};
          color: #1F2937;
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
          font-family: 'Inter', sans-serif;
        }

        #__next {
          background-color: transparent !important;
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
        }

        ${isLiveOverlay ? `header, footer, nav, .navbar, .nav-container { display: none !important; visibility: hidden !important; height: 0 !important; overflow: hidden !important; }` : ''}

        .page-transition-enter { opacity: 0; }
        .page-transition-enter-active { opacity: 1; transition: opacity 300ms; }
      `}</style>
    </div>
  );
}

export default MyApp;
