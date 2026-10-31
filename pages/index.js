import Head from "next/head";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { getAuth, onAuthStateChanged } from "firebase/auth";

import HomeHero from "../components/home/HomeHero";
import HomeContact from "../components/home/HomeContact";
import HomeStats from "../components/home/HomeStats";
import HomeFeatures from "../components/home/HomeFeatures";
import HomeTutorial from "../components/home/HomeTutorial";
import HomeFooter from "../components/home/HomeFooter";

export default function Home({
  initialUser = null,
  initialUserData = null,
  initialStats = null,
}) {
  const [user, setUser] = useState(initialUser);

  // Authentication listener
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Head>
        <title>
          OKCRICK | Professional Cricket Live Scoring App & Tournament Management
        </title>

        <meta
          name="description"
          content="Manage cricket leagues with real-time analytics, ultra-low latency updates, and premium OBS compatible scoreboard overlays instantly."
        />

        <meta
          name="keywords"
          content="cricket live scoring app, cricket tournament management system, live scoreboard overlay, local cricket organizer"
        />

        <meta name="robots" content="index, follow" />

        <link
          rel="canonical"
          href="https://okcrick.in"
        />
      </Head>

      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.1,
          ease: "easeOut",
        }}
        className="w-full bg-[#F8FAFC] min-h-screen text-slate-900 font-sans flex flex-col selection:bg-slate-900 selection:text-white antialiased relative"
      >
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[350px] bg-gradient-to-b from-emerald-500/5 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

        {/* Homepage sections */}
        <main className="w-full max-w-3xl mx-auto p-4 sm:p-6 flex-1 flex flex-col gap-6 pb-12 relative z-10">

          <HomeHero
            user={user}
            initialUserData={initialUserData}
          />

          <HomeContact />

          <HomeStats
            initialStats={initialStats}
          />

          <HomeFeatures />

          <HomeTutorial />

        </main>

        <HomeFooter />

        <style jsx global>{`
          html {
            scroll-behavior: smooth;
          }

          body {
            overflow-x: hidden;
          }
        `}</style>

      </motion.div>
    </>
  );
}

// ========================================
// SERVER SIDE RENDERING - PRESERVED
// ========================================

export async function getServerSideProps(context) {
  const fallbackHomeProps = {
    initialStats: {
      matches: 0,
      players: 0,
      locations: 0,
    },
  };

  const sessionCookie =
    context.req.cookies?.__session || "";

  // Homepage statistics SSR
  const homePropsPromise = (async () => {
    try {
      const { getHomeInitialProps } = await import(
        "../lib/ssr/home"
      );

      return await getHomeInitialProps();
    } catch (error) {
      console.error(
        "Home data fetching failed:",
        error?.code || error?.message
      );

      return fallbackHomeProps;
    }
  })();

  // Server-side session verification
  const userPropsPromise = (async () => {
    let initialUser = null;
    let initialUserData = null;

    if (!sessionCookie) {
      return {
        initialUser,
        initialUserData,
      };
    }

    try {
      const {
        getAdminAuth,
        getAdminDb,
      } = await import("../lib/firebase-admin");

      const adminAuth = getAdminAuth();
      const adminDb = getAdminDb();

      const decodedToken =
        await adminAuth.verifySessionCookie(
          sessionCookie,
          true
        );

      const userDoc = await adminDb
        .collection("users")
        .doc(decodedToken.uid)
        .get();

      initialUserData = userDoc.exists
        ? userDoc.data()
        : null;

      initialUser = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        displayName:
          initialUserData?.name ||
          decodedToken.name ||
          "",
      };

    } catch (error) {
      console.error(
        "Session verification failed:",
        error?.code || error?.message
      );
    }

    return {
      initialUser,
      initialUserData,
    };
  })();

  try {
    const [
      homeProps,
      userProps,
    ] = await Promise.all([
      homePropsPromise,
      userPropsPromise,
    ]);

    return {
      props: {
        ...fallbackHomeProps,
        ...homeProps,
        ...userProps,
      },
    };

  } catch (error) {
    console.error(
      "Home SSR failed:",
      error?.code || error?.message
    );

    return {
      props: {
        ...fallbackHomeProps,
        initialUser: null,
        initialUserData: null,
      },
    };
  }
}
