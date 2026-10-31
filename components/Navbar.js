import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Menu, X, User, Trophy, LogOut, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateTournamentModal from './navbar/CreateTournamentModal';
import AuthModal from './navbar/AuthModal';
import { auth, db } from '../lib/firebase'; 
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, onSnapshot } from 'firebase/firestore'; 

export default function Navbar({ initialUser = null, initialUserData = null }) {
  const router = useRouter(); 
  // SSR props se initial state set karne par loading false rahegi taaki flicker na ho
  const [authLoading, setAuthLoading] = useState(!initialUser); 
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showTrophyModal, setShowTrophyModal] = useState(false); 
  const [authMode, setAuthMode] = useState('login');
  
  // Directly initialize with server-side props
  const [user, setUser] = useState(initialUser);
  const [userData, setUserData] = useState(initialUserData); 

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const sessionSyncRef = useRef({ uid: null, promise: null });

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');

  // Tournament Form States
  const [tName, setTName] = useState('');
  const [tOrganiser, setTOrganiser] = useState('');
  const [tMobile, setTMobile] = useState('');
  const [tLocation, setTLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tLogo, setTLogo] = useState(null);

  

useEffect(() => {
  let unsubscribeSnapshot = null;
  let isFirstAuthCallback = true;

  const unsubscribeAuth = onAuthStateChanged(
    auth,
    async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          await createServerSession(currentUser);
        } catch (error) {
          console.error(
            "Server session synchronization failed:",
            error
          );
        }
      } else if (!isFirstAuthCallback || !initialUser) {
        setUser(null);
        sessionSyncRef.current = { uid: null, promise: null };
      }

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);

        unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        });
      } else if (!isFirstAuthCallback || !initialUserData) {
        setUserData(null);
      }

      isFirstAuthCallback = false;
      setAuthLoading(false);
    }
  );

  return () => {
    unsubscribeAuth();

    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
    }
  };
}, []);
  

  
useEffect(() => {
  if (initialUser) {
    setUser(initialUser);
    setAuthLoading(false);
  }

  if (initialUserData) {
    setUserData(initialUserData);
  }
}, [initialUser, initialUserData]);
  
  
  // --- NEW ARENA BUTTON SIGNAL LISTENER ---
  useEffect(() => {
    const handleOpenTournamentModal = () => {
      setShowTrophyModal(true); 
    };

    window.addEventListener('openCreateTournamentModal', handleOpenTournamentModal);
    
    return () => {
      window.removeEventListener('openCreateTournamentModal', handleOpenTournamentModal);
    };
  }, []);

  useEffect(() => {
    const handleOpenAuthModal = () => {
      setShowAuth(true);
      setAuthMode("login");
    };

    window.addEventListener("openAuthModal", handleOpenAuthModal);

    return () => {
      window.removeEventListener("openAuthModal", handleOpenAuthModal);
    };
  }, []);

  const createServerSession = async (firebaseUser) => {
    if (!firebaseUser) {
      throw new Error("Firebase user is missing.");
    }

    const uid = firebaseUser.uid;

    // Auth listener and login handler can fire together. Share one session request.
    if (sessionSyncRef.current.uid === uid && sessionSyncRef.current.promise) {
      return sessionSyncRef.current.promise;
    }

    const syncPromise = (async () => {
      const idToken = await firebaseUser.getIdToken();

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Unable to create server authentication session.");
      }

      return true;
    })();

    sessionSyncRef.current = { uid, promise: syncPromise };

    try {
      return await syncPromise;
    } catch (error) {
      if (sessionSyncRef.current.promise === syncPromise) {
        sessionSyncRef.current = { uid: null, promise: null };
      }
      throw error;
    }
  };
             const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === "register") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, {
          displayName: name,
        });

        const newUser = {
          uid: userCredential.user.uid,
          name,
          mobile,
          location,
          email,
          createdAt: new Date(),
        };

        await setDoc(doc(db, "users", userCredential.user.uid), newUser);
        setUserData(newUser);
        await createServerSession(userCredential.user);
        setUser(userCredential.user);

        alert("Account Created!");
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const loggedInUser = userCredential.user;

        if (!loggedInUser.displayName) {
          const userDoc = await getDoc(doc(db, "users", loggedInUser.uid));
          if (userDoc.exists() && userDoc.data().name) {
            await updateProfile(loggedInUser, {
              displayName: userDoc.data().name,
            });
          }
        }

        await createServerSession(loggedInUser);
        setUser(loggedInUser);
      }

      setShowAuth(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Authentication error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login first!");
    
    setLoading(true);
    try {
      let logoUrl = "";

      if (tLogo) {
        const formData = new FormData();
        formData.append("file", tLogo);
        formData.append("upload_preset", "okcrick");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/m4xdhjiq/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        logoUrl = data.secure_url;
      }

      const tournamentData = {
        tournamentName: tName,
        organiser: tOrganiser,
        mobile: tMobile,
        location: tLocation,
        startDate: startDate,
        endDate: endDate,
        adminId: user.uid,
        logoUrl: logoUrl,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "tournaments"), tournamentData);
      
      setShowTrophyModal(false);
      setTName(''); setTOrganiser(''); setTMobile(''); 
      setTLocation(''); setStartDate(''); setEndDate('');

      router.push('/my-tournaments');
      
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link has been sent to your email.");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    // Capture any session request already in progress before signOut changes auth state.
    const pendingSession = sessionSyncRef.current.promise;

    try {
      await signOut(auth);

      // Ensure an in-flight session creation cannot finish after the logout API clears the cookie.
      if (pendingSession) {
        await pendingSession.catch(() => {});
      }

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to clear server authentication session.");
      }

      sessionSyncRef.current = { uid: null, promise: null };
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsOpen(false);
      await router.push("/");
    }
  };

  // Direct active states utilizing SSR data
  const activeUser = user;
  const activeUserData = userData;

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-[1001] bg-[#000000] px-5 py-3.5 shadow-xl border-b border-white/5">
        <div className="w-full flex justify-between items-center px-1">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/favicon.ico" 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
  {/* Old Logo text
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#FFFFFF] uppercase tracking-normal leading-none">
                OKCRICK<span className="text-[#FFD700]">.IN</span>
              </span>
              {!authLoading && activeUser && (activeUser.displayName || activeUserData?.name) && (
                <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest mt-0.5 italic">
                  Hi, {(activeUser.displayName || activeUserData.name).split(' ')[0]}
                </span>
              )}
            </div>
            */}

  <div className="flex flex-col">
  <img
    src="/images/okcrick-logoC.png"
    alt="OKCRICK.IN"
    width="900"
    height="250"
    fetchPriority="high"
    decoding="async"
    className="w-auto h-10 object-contain"
  />

  {!authLoading && activeUser && (activeUser.displayName || activeUserData?.name) && (
    <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest mt-0.5 italic">
      Hi, {(activeUser.displayName || activeUserData.name).split(' ')[0]}
    </span>
  )}
</div>

  
          </Link>

          <button type="button" onClick={() => setIsOpen((previous) => !previous)} aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={isOpen} className="p-2.5 bg-white/10 rounded-xl border border-white/10 text-white">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* SIDEBAR */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="navbar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'linear' }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#1D2939]/80 backdrop-blur-sm z-[1002]"
          />
        )}
        {isOpen && (
          <motion.div
            key="navbar-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white z-[1003] shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col"
          >
            <div className="bg-[#1D2939] p-8 pt-12 text-white relative">
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} className="text-[#FACC15]" />
              </button>

              {authLoading ? (
                <div className="py-2">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest animate-pulse">Loading profile...</p>
                </div>
              ) : activeUser ? (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#FACC15] rounded-2xl flex items-center justify-center text-[#1D2939] font-black text-xl shadow-lg border-2 border-white/10">
                    {(activeUser.displayName || activeUserData?.name)?.substring(0, 1).toUpperCase() || <User size={24}/>}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-black text-lg truncate italic uppercase tracking-tighter">{activeUser.displayName || activeUserData?.name || 'User'}</p>
                    <p className="text-white/40 text-[10px] font-bold uppercase truncate tracking-wider">{activeUser.email}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-black text-xl italic uppercase text-[#FACC15]">Menu</p>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Explore Arena</p>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 space-y-3 overflow-y-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Navigation</p>
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-[#1D2939] font-bold text-sm uppercase italic border border-transparent hover:border-slate-200 transition-all">
                <Home size={18} /> HOME
              </Link>

              {authLoading ? null : activeUser ? (
                <>
                  <Link href="/my-tournaments" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-[#1D2939] font-bold text-sm uppercase italic border border-transparent hover:border-slate-200 transition-all">
                    <Trophy size={18} /> TOURNAMENTS
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 bg-red-50/50 font-bold uppercase text-[10px] tracking-widest mt-8">
                    <LogOut size={16} /> Logout Admin
                  </button>
                </>
              ) : (
                <div className="space-y-3 pt-4">
                  <button onClick={() => { setShowAuth(true); setAuthMode('login'); setIsOpen(false); }} className="w-full p-4 rounded-2xl border-2 border-[#1D2939] text-[#1D2939] font-black uppercase text-sm italic">Admin Login</button>
            <button onClick={() => { setShowAuth(true); setAuthMode('register'); setIsOpen(false); }} className="w-full p-4 rounded-2xl bg-[#1D2939] text-white font-black uppercase text-sm italic shadow-xl">Create Account</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEPARATE MODAL COMPONENTS */}
      <CreateTournamentModal
        isOpen={showTrophyModal}
        loading={loading}
        onClose={() => setShowTrophyModal(false)}
        onSubmit={handleCreateTournament}
        tName={tName}
        setTName={setTName}
        tOrganiser={tOrganiser}
        setTOrganiser={setTOrganiser}
        tMobile={tMobile}
        setTMobile={setTMobile}
        tLocation={tLocation}
        setTLocation={setTLocation}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        setTLogo={setTLogo}
      />

      <AuthModal
        isOpen={showAuth}
        loading={loading}
        authMode={authMode}
        setAuthMode={setAuthMode}
        onClose={() => setShowAuth(false)}
        onSubmit={handleAuth}
        onForgotPassword={handleForgotPassword}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        name={name}
        setName={setName}
        mobile={mobile}
        setMobile={setMobile}
        showPass={showPass}
        setShowPass={setShowPass}
      />
    </>
  );
      }
    
