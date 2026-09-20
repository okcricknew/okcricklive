import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // 👈 Added for routing
import Link from 'next/link';
import { Menu, X, ChevronRight, Zap, User, Lock, Eye, EyeOff, Phone, MapPin, Trophy, LogOut, Mail, Calendar, UserPlus, LayoutDashboard, PlusCircle, Home, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../lib/firebase'; 
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, onSnapshot } from 'firebase/firestore'; 

export default function Navbar() {
  const router = useRouter(); // 👈 Initialize router
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showTrophyModal, setShowTrophyModal] = useState(false); 
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States (Logic untouched)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');

  // Tournament Form States (Logic untouched)
  const [tName, setTName] = useState('');
  const [tOrganiser, setTOrganiser] = useState('');
  const [tMobile, setTMobile] = useState('');
  const [tLocation, setTLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tLogo, setTLogo] = useState(null);

  useEffect(() => {
  let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser); // User object ko turant set karein

    if (currentUser) {
      
      const docRef = doc(db, "users", currentUser.uid);

      // 🔥 REALTIME + CACHE
      unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      });
    } else {
      setUserData(null);
    }
  });

  return () => {
    unsubscribeAuth();
    if (unsubscribeSnapshot) unsubscribeSnapshot();
  };
}, []);
  
  // --- NEW ARENA BUTTON SIGNAL LISTENER ---
useEffect(() => {
  const handleOpenTournamentModal = () => {
    setShowTrophyModal(true); // Isse "New Tournament" modal khul jayega
  };

  window.addEventListener('openCreateTournamentModal', handleOpenTournamentModal);
  
  return () => {
    window.removeEventListener('openCreateTournamentModal', handleOpenTournamentModal);
  };
}, []);

  useEffect(() => {
  const handleOpenAuthModal = () => {
    setShowAuth(true)
    setAuthMode("login")
  }

  window.addEventListener("openAuthModal", handleOpenAuthModal)

  return () => {
    window.removeEventListener("openAuthModal", handleOpenAuthModal)
  }
}, [])

  const createServerSession = async (firebaseUser) => {
  if (!firebaseUser) {
    throw new Error("Firebase user is missing.");
  }

  const idToken = await firebaseUser.getIdToken(true);

  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idToken,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data?.error || "Unable to create server authentication session."
    );
  }

  return true;
};
  

  const handleAuth = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (authMode === "register") {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      // Existing profile logic — untouched.
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

      await setDoc(
        doc(db, "users", userCredential.user.uid),
        newUser
      );

      setUserData(newUser);

      // NEW:
      // Create server-readable session cookie.
      await createServerSession(userCredential.user);

      alert("Account Created!");
    } else {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const loggedInUser = userCredential.user;

      // Existing logic — untouched.
      if (!loggedInUser.displayName) {
        const userDoc = await getDoc(
          doc(db, "users", loggedInUser.uid)
        );

        if (
          userDoc.exists() &&
          userDoc.data().name
        ) {
          await updateProfile(
            loggedInUser,
            {
              displayName: userDoc.data().name,
            }
          );
        }
      }

      // NEW:
      // Create server-readable session cookie.
      await createServerSession(loggedInUser);
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
      
      // Reset Form & UI
      setShowTrophyModal(false);
      setTName(''); setTOrganiser(''); setTMobile(''); 
      setTLocation(''); setStartDate(''); setEndDate('');

      // 🏆 REDIRECT: Seedha my-tournaments page par routing
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
  try {
    // Existing Firebase client logout.
    await signOut(auth);

    // NEW:
    // Remove server-side authentication cookie.
    await fetch("/api/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    setIsOpen(false);
    router.push("/");
  }
};

  // --- UI REMAINS EXACTLY SAME AS YOUR ORIGINAL ---
  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-[1001] bg-[#1D2939] px-5 py-3.5 shadow-xl border-b border-white/5">
        <div className="w-full flex justify-between items-center px-1">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
  <img 
    src="/favicon.ico" 
    alt="Logo" 
    className="w-full h-full object-contain"
  />
</div>
      
            <div className="flex flex-col">
              <span className="text-xl font-black text-white uppercase tracking-normal leading-none">
                OKCRICK<span className="text-[#FACC15]">.IN</span>
              </span>
                            {user && (user.displayName || userData?.name) && (
                <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-0.5 italic">
                  Hi, {(user.displayName || userData.name).split(' ')[0]}
                </span>
              )}

            </div>
          </Link>

          <button onClick={() => setIsOpen(!isOpen)} className="p-2.5 bg-white/10 rounded-xl border border-white/10 text-white active:scale-90 transition-all">
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-[#1D2939]/80 backdrop-blur-sm z-[1002]" />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }} 
              className="fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white z-[1003] shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col"
            >
              <div className="bg-[#1D2939] p-8 pt-12 text-white relative">
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X size={20} className="text-[#FACC15]" />
                </button>

                {user ? (
                                    <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#FACC15] rounded-2xl flex items-center justify-center text-[#1D2939] font-black text-xl shadow-lg border-2 border-white/10">
                      {(user.displayName || userData?.name)?.substring(0, 1).toUpperCase() || <User size={24}/>}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black text-lg truncate italic uppercase tracking-tighter">{user.displayName || userData?.name || 'User'}</p>
                      <p className="text-white/40 text-[10px] font-bold uppercase truncate tracking-wider">{user.email}</p>
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

                {user ? (
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
          </>
        )}
      </AnimatePresence>

      {/* CREATE TOURNAMENT MODAL */}
      <AnimatePresence>
        {showTrophyModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center px-5">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !loading && setShowTrophyModal(false)} className="fixed inset-0 bg-[#1D2939]/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-white rounded-[1rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#1D2939] rounded-2xl flex items-center justify-center text-[#FACC15] shadow-lg">
                  <Trophy size={24} />
                </div>
                <div>
                  <h2 className="text-[#1D2939] font-black italic uppercase text-xl leading-none">New Tournament</h2>
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">Fill tournament details</p>
                </div>
              </div>

              <form onSubmit={handleCreateTournament} className="space-y-4">
                <InputWrapper icon={<Trophy size={18}/>}>
                  <input required type="text" placeholder="Tournament Name" value={tName} onChange={(e) => setTName(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
                </InputWrapper>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWrapper icon={<UserPlus size={18}/>}>
                    <input required type="text" placeholder="Organiser" value={tOrganiser} onChange={(e) => setTOrganiser(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
                  </InputWrapper>
                  <InputWrapper icon={<Phone size={18}/>}>
                    <input required type="tel" placeholder="Mobile" value={tMobile} onChange={(e) => setTMobile(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
                  </InputWrapper>
                </div>
                <InputWrapper icon={<MapPin size={18}/>}>
                  <input required type="text" placeholder="Location" value={tLocation} onChange={(e) => setTLocation(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
                </InputWrapper>

        <div className="space-y-2">
  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
    Tournament Logo
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => setTLogo(e.target.files[0])}
    className="w-full bg-slate-50 py-3 px-4 rounded-xl border border-slate-100 text-sm"
  />
</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-400 font-black ml-2 uppercase tracking-widest">Start Date</label>
                    <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 py-3.5 px-4 rounded-xl border border-slate-100 text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-400 font-black ml-2 uppercase tracking-widest">End Date</label>
                    <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 py-3.5 px-4 rounded-xl border border-slate-100 text-xs font-bold" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#1D2939] text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs mt-4 active:scale-95 transition-all">
                  {loading ? 'Processing...' : 'Launch Tournament 🚀'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {showAuth && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center px-5">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !loading && setShowAuth(false)} className="fixed inset-0 bg-[#1D2939]/90 backdrop-blur-md" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative w-full max-w-md bg-white rounded-[1rem] p-8 shadow-2xl">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200">
                <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-[#1D2939] text-white shadow-lg' : 'text-slate-400'}`}>Login</button>
                <button type="button" onClick={() => setAuthMode('register')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'register' ? 'bg-[#1D2939] text-white shadow-lg' : 'text-slate-400'}`}>Register</button>
              </div>
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <>
                    <InputWrapper icon={<User size={18}/>}>
                      <input required type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
                    </InputWrapper>
                    <InputWrapper icon={<Phone size={18}/>}>
                      <input required type="tel" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
                    </InputWrapper>
                  </>
                )}
                <InputWrapper icon={<Mail size={18}/>}>
                  <input required type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-4 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
                </InputWrapper>
                <div className="relative">
                  <InputWrapper icon={<Lock size={18}/>}>
                    <input required type={showPass ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 py-4 pl-12 pr-12 rounded-xl outline-none border border-slate-100 font-bold text-sm" />
                  </InputWrapper>
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                  {authMode === "login" && (
  <div className="flex justify-end mt-2">
    <button
      type="button"
      onClick={handleForgotPassword}
      className="text-[11px] font-bold text-[#1D2939] hover:text-[#FACC15]"
    >
      Forgot Password?
    </button>
  </div>
)}
                <button type="submit" disabled={loading} className="w-full bg-[#1D2939] text-white font-black py-5 rounded-2xl shadow-[0_10px_20px_-5px_rgba(29,41,57,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(29,41,57,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300 uppercase tracking-[0.2em] text-[10px] mt-4 flex items-center justify-center gap-2 group">
                  {loading ? 'Processing...' : (authMode === 'login' ? 'Login Now' : 'Create Account')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function InputWrapper({ icon, children }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 z-10">
        {icon}
      </div>
      {children}
    </div>
  );
                }
