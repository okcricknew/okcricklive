import { useScoringLogic } from './useScoringLogic';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'; 

import EndOverModal from '../EndOverModal'; 
import BowlerSelectionModal from '../BowlerSelectionModal';
import OutModal from '../OutModal'; 
import NewBatsmanModal from '../NewBatsmanModal';
import ExtraRunModal from '../ExtraRunModal'; 
import CustomRunModal from './CustomRunModal';
import InningsBreakModal from '../InningsBreakModal'; 
import PlayerSelectionModal from '../PlayerSelectionModal'; 
import MatchCompletedModal from '../MatchCompletedModal'; 
import MatchSummaryModal from '../MatchSummaryModal'; 
import ScoreHeader from './ScoreHeader';
import StatsSection from './StatsSection';
import KeypadSection from './KeypadSection';
import { Undo2 } from "lucide-react";
import MatchAdminEngine from '../MatchSettings/MatchAdminEngine';


export default function ScoringPanel({ match, tId }) {
  const { handleBall, selectNextBowler, undoLastBall, startSecondInnings, finalizeMatch, isProcessing, showInningsBreak } = useScoringLogic(match, tId);
  const router = useRouter();

  useEffect(() => {
  const timer = setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 100);

  return () => clearTimeout(timer);
}, []);
  
  const scrollRef = useRef(null);

  // --- ULTRA FAST TRANSITION CONFIG ---
  const fastTransition = { duration: 0.1, ease: "easeOut" };

  // Modals State
  const [showEndOverModal, setShowEndOverModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [isOutModalOpen, setIsOutModalOpen] = useState(false);
  const [isNewBatsmanModalOpen, setIsNewBatsmanModalOpen] = useState(false);
  const [isInningsModalOpen, setIsInningsModalOpen] = useState(false);
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const [selectedExtraType, setSelectedExtraType] = useState('WD');
  const [isSettingUpInnings, setIsSettingUpInnings] = useState(false);
  const [showMainSetup, setShowMainSetup] = useState(false);
  const [isMatchCompletedModalOpen, setIsMatchCompletedModalOpen] = useState(false);
  const [isMatchSummaryModalOpen, setIsMatchSummaryModalOpen] = useState(false);
  const [isBatsmanSelectionPending, setIsBatsmanSelectionPending] = useState(false);
  const [isCustomRunModalOpen, setIsCustomRunModalOpen] = useState(false);
  const [isAdminEngineOpen, setIsAdminEngineOpen] = useState(false);
  

  // Teams & Final Data
  const [fieldingTeamPlayers, setFieldingTeamPlayers] = useState([]);
  const [battingTeamPlayers, setBattingTeamPlayers] = useState([]);
  const [finalMatchData, setFinalMatchData] = useState(null);

  // --- DERIVED LOGIC ---
  const firstInningsScore = Number(match?.firstInningsScore || 0);
  const isSecondInnings = (match?.innings || 1) === 2;
  const target = firstInningsScore + 1;
  
  const currentWickets = Number(match?.totalWickets || 0);
  const currentOver = Number(match?.currentOver || 0);
  const ballsInOver = Number(match?.ballsInOver || 0);
  const maxOvers = Number(match?.overs || 0);

  const isAllOut = currentWickets >= 10;
  const isOversFinished = currentOver >= maxOvers || (currentOver === maxOvers - 1 && ballsInOver === 6);
  
  const isInningsOver = (isAllOut || isOversFinished) && !isSecondInnings;
  const isMatchCompletedInDB = match?.status === 'completed';

  const isOverComplete = ballsInOver === 6 && !isInningsOver && !isMatchCompletedInDB && !isAllOut;
  
  const shouldShowFloating =
(!isBatsmanSelectionPending) &&
(isInningsOver || isOverComplete || isMatchCompletedInDB || (showInningsBreak && !isSecondInnings)) &&
!isProcessing;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
    }
  }, [match?.ballHistory]);

    // --- REFRESH SYNC EFFECT ---
  useEffect(() => {
    if (showInningsBreak && (match?.innings || 1) === 1) {
      setIsInningsModalOpen(true);
      setIsNewBatsmanModalOpen(false);
    }
    
    if (match?.innings === 2 && (!match?.striker || match?.striker === "") && !isMatchCompletedInDB && !isProcessing) {
      if (match?.totalRuns === 0 && match?.totalWickets === 0) {
        setShowMainSetup(true);
        setIsInningsModalOpen(false); // Make sure innings break modal clears away safely
        setIsNewBatsmanModalOpen(false); 
      }
    }
  }, [showInningsBreak, match?.innings, match?.striker, match?.totalRuns, isMatchCompletedInDB, isProcessing]);
  

  // --- AUTO-PROMPT FOR NEW BATSMAN ---
  useEffect(() => {
    if (!match?.id || isSettingUpInnings || isMatchCompletedInDB || isProcessing) return;
    if (!isSecondInnings && (isInningsOver || showInningsBreak)) {
      setIsNewBatsmanModalOpen(false);
      return;
    }
    if (isSecondInnings && (isAllOut || isOversFinished || isMatchCompletedInDB)) {
      setIsNewBatsmanModalOpen(false);
      return;
    }
    if (
match.status === 'live' &&
(!match.striker || !match.nonStriker) &&
!isBatsmanSelectionPending
) {
      if (isSecondInnings && match.totalRuns === 0 && match.totalWickets === 0) return;
      const timer = setTimeout(() => {
        if (match.status === 'live') {
          setIsNewBatsmanModalOpen(true);
setIsBatsmanSelectionPending(true);
          
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [match?.striker, match?.nonStriker, match?.innings, match?.status, isInningsOver, isSettingUpInnings, isMatchCompletedInDB, isProcessing, showInningsBreak, isSecondInnings, isAllOut, isOversFinished]);

  // Fetch Squads
  useEffect(() => {
    const fetchSquads = async (teamId, setter) => {
      try {
        const snap = await getDocs(collection(db, 'tournaments', tId, 'teams', teamId, 'players'));
        setter(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error("Squad fetch error:", err); }
    };

    if (tId && match?.battingTeam) {
      const battingId = match.battingTeam === match.teamA ? match.teamAId : match.teamBId;
      const fieldingId = match.battingTeam === match.teamA ? match.teamBId : match.teamAId;
      fetchSquads(battingId, setBattingTeamPlayers);
      fetchSquads(fieldingId, setFieldingTeamPlayers);
    }
  }, [tId, match?.battingTeam, match?.innings]);

    const handleStartSecondInnings = async () => {
    try {
      // 1. Pehle Player Selection (Setup) modal ko screen par lakar khada karo
      setShowMainSetup(true);
      setIsSettingUpInnings(true); 
      
      // 2. Ab Innings Break modal ko hide karo (Isse smooth handover hoga, scoreboard nahi dikhega)
      setIsInningsModalOpen(false);
      
      // 3. Backend logic trigger karo
      await startSecondInnings(); 
    } catch (e) { console.error(e); }
  };
  

  const handleMainSetupConfirm = async (data) => {
    try {
      const matchRef = doc(db, 'tournaments', tId, 'matches', match.id);
      const sId = data.strikerId || data.striker || "unknown_s";
      const nsId = data.nonStrikerId || data.nonStriker || "unknown_ns";
      const bId = data.bowlerId || data.bowler || "unknown_b";

      const updatePayload = {
        striker: data.striker || "",
        strikerId: sId,
        nonStriker: data.nonStriker || "",
        nonStrikerId: nsId,
        bowler: data.bowler || "",
        bowlerId: bId,
        [`battingStats.${data.striker}`]: { 
          runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, playerId: sId 
        },
        [`battingStats.${data.nonStriker}`]: { 
          runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, playerId: nsId 
        },
        [`bowlingStats.${data.bowler}`]: { 
          runs: 0, wickets: 0, overs: 0, balls: 0, playerId: bId 
        }
      };
      await updateDoc(matchRef, updatePayload);
      setShowMainSetup(false);
      setIsSettingUpInnings(false);
    } catch (e) { 
      console.error("Setup Confirm Error:", e);
      alert("Error: " + e.message);
    }
  };
  
  const handleManualStrikeSwap = async () => {
    if (isProcessing || (isInningsOver && !isSecondInnings) || isMatchCompletedInDB) return;
    try {
      await updateDoc(doc(db, 'tournaments', tId, 'matches', match.id), { 
        striker: match.nonStriker, 
        nonStriker: match.striker 
      });
    } catch (e) { console.error(e); }
  };

  const handleFloatingAction = () => {
    if (isMatchCompletedInDB) {
      setIsMatchCompletedModalOpen(true);
    } 
    else if ((isInningsOver || showInningsBreak) && !isSecondInnings) {
      setIsInningsModalOpen(true);
    } 
    else if (isOverComplete) {
      setShowEndOverModal(true);
    }
  };

  const handleFinishMatch = async (mvpData) => {
    try {
      await finalizeMatch(mvpData);
      setFinalMatchData({ 
        ...match, 
        mvp: mvpData.name, 
        mvpPlayerId: mvpData.id, 
        status: 'completed' 
      });
      setIsMatchCompletedModalOpen(false);
      setIsMatchSummaryModalOpen(true);
    } catch (e) { console.error(e); }
  };

  if (match?.status === 'completed' && match?.mvp) {
    return (
      <MatchSummaryModal 
        isOpen={true} 
        match={match} 
        onClose={() => router.push(`/tournament/${tId}`)} 
      />
    );
  }

  return (
    <AnimatePresence initial={false}>
      <motion.div 
  initial={false} // 👈 Isse turant render hoga, koi fade-in nahi
  animate={{ opacity: 1 }}
  className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] bg-[#001d3d] flex flex-col overflow-hidden text-slate-900"
>
        <ScoreHeader 
  match={match} 
  router={router} 
  isOverComplete={isOverComplete} 
  onOpenEngine={() => setIsAdminEngineOpen(true)} // 👈 Ye prop add karein
/>


        <StatsSection 
          match={match} 
          currentBatters={[match?.striker, match?.nonStriker].filter(Boolean).sort()} 
          getBatStats={(n) => match?.battingStats?.[n] || { runs: 0, balls: 0 }} 
          bowlerStats={match?.bowlingStats?.[match?.bowler] || { runs: 0, wickets: 0 }} 
          isOverComplete={isOverComplete} 
          handleManualStrikeSwap={handleManualStrikeSwap} 
        />

        <div className="p-2 border-b flex items-center gap-2 bg-slate-50 min-h-[54px]">
          <span className="text-[9px] font-black uppercase text-slate-400 w-10">This Over</span>
          <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto no-scrollbar w-full py-1">
            {(() => {

const balls = match?.ballHistory?.filter(
  b => b.over === currentOver && b.innings === (match.innings || 1)
) || [];

// legal balls count
const legalBalls = balls.filter(b => !['WD','NB'].includes(b.type));

let emptyNeeded = Math.max(0, 6 - legalBalls.length);

const boxes = [...balls];

for(let i=0;i<emptyNeeded;i++){
  boxes.push({ type:'EMPTY' });
}

return boxes.map((ball,i)=>{

let bg="bg-slate-200 text-black";
let content="";

// empty placeholder
if(ball.type==="EMPTY"){
content=""
}

// normal wicket
else if(ball.type==="OUT"){
bg="bg-red-600 text-white"
content="W"
}

// WIDE
else if(ball.type==="WD"){

const runs = ball.runs ?? 1
const isWicket = !!ball.wicketInfo

  bg = isWicket ? "bg-red-600 text-white" : "bg-amber-400 text-black"
  

if(isWicket){
content=(
<div className="flex flex-col leading-none text-[9px] font-black text-center">
<span>WD{runs>0?runs:''}</span>
<span>W</span>
</div>
)
}else{
content=`WD${runs>0?runs:''}`
}

}

// NO BALL
else if(ball.type==="NB"){

  const runs = ball.runs ?? 1
  const isWicket = !!ball.wicketInfo

  bg = isWicket ? "bg-red-600 text-white" : "bg-amber-400 text-black"

  // Normalize subCategory
  const subCat = (ball.subCategory || '').toUpperCase();
  
  // NB + LB
  if(subCat === "LEG BYE" || subCat === "LB"){
    content=(
      <div className="flex flex-col leading-none text-[9px] font-black text-center">
        <span>NB</span>
        <span>LB{runs>0?runs:''}</span>
      </div>
    )
  }
  // NB + BYE
  else if(subCat === "BYE" || subCat === "B"){
    content=(
      <div className="flex flex-col leading-none text-[9px] font-black text-center">
        <span>NB</span>
        <span>B{runs>0?runs:''}</span>
      </div>
    )
  }
  // NB + WICKET
  else if(isWicket){
    content=(
      <div className="flex flex-col leading-none text-[9px] font-black text-center">
        <span>NB{runs>0?runs:''}</span>
        <span>W</span>
      </div>
    )
  }
  // NORMAL NB
  else{
    content=`NB${runs>0?runs:''}`
  }
}

// NORMAL BALL, LB, or BYE
else if (ball.type === "LB" || ball.type === "BYE") {
  bg = "bg-blue-600 text-white";
  content = (ball.type === "LB" ? "L" : "B") + (ball.runs || 0);
} 

// ✅ ADD THIS BLOCK
else if (ball.type === "PENALTY") {
  bg = "bg-purple-600 text-white";
  content = (
    <div className="flex flex-col leading-none text-[9px] font-black text-center">
      <span>P</span>
      <span>{ball.runs || 5}</span>
    </div>
  );
}

// NORMAL BALL
else {
  bg = "bg-slate-900 text-white";
  content = ball.runs === 0 ? "•" : ball.runs;
          }
  

return(
<div
key={i}
className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0 ${bg}`}
>
{content}
</div>
)

})

})()}
          </div>
        </div>

        <div className="relative flex-1 min-h-0 bg-white flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col">
            <KeypadSection 
              isProcessing={isProcessing} 
              isOverComplete={isOverComplete} 
              isInningsOver={isInningsOver}
              handleBall={handleBall} 
              undoLastBall={undoLastBall} 
              setIsExtraModalOpen={setIsExtraModalOpen} 
              setIsOutModalOpen={setIsOutModalOpen} 
              setSelectedExtraType={setSelectedExtraType}
              setIsCustomRunModalOpen={setIsCustomRunModalOpen}
              tId={tId}
              match={match}
            />
          </div>

                {isBatsmanSelectionPending && (
  <div className="absolute inset-0 z-50 flex flex-col backdrop-blur-sm bg-black/30">

    {/* Undo Button */}
    <div className="w-full flex justify-end p-5">
     <button onClick={() => {
  undoLastBall();
  setIsBatsmanSelectionPending(false);
  setIsNewBatsmanModalOpen(false);
}}
        className="pointer-events-auto bg-slate-900 text-white p-4 rounded-xl shadow-2xl active:scale-95 border border-slate-700 flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest">
          Undo
        </span>
      </button>
    </div>

    {/* Select Batsman Button */}
    <div className="flex-1 flex items-center justify-center -mt-12">
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={fastTransition}
        onClick={() => setIsNewBatsmanModalOpen(true)}
        className="pointer-events-auto px-10 py-5 rounded-2xl font-black shadow-2xl border-2 border-white bg-red-600 text-white active:scale-95 uppercase italic tracking-tighter"
      >
        Select New Batsman
      </motion.button>
    </div>

  </div>
)}

          <AnimatePresence>
            {shouldShowFloating && (
              <div className="absolute inset-0 z-50 flex flex-col pointer-events-none">
{/* <div className="w-full flex justify-end p-5">
                  <button onClick={() => undoLastBall()} className="pointer-events-auto bg-slate-900 text-white p-6 rounded-xl shadow-2xl active:scale-95 border border-slate-700 flex items-center gap-2">
                    
                    <span className="text-[10px] font-black uppercase tracking-widest">Undo</span>
                  </button>
                </div> */}

  <div className="w-full flex justify-end pt-2 p-5">
  <motion.button
    whileTap={{ scale: 0.96 }}
    onClick={() => undoLastBall()}
    className="pointer-events-auto bg-slate-50 text-slate-400 active:bg-slate-100 flex items-center justify-center w-16 h-19 mr-1"
  >
    <Undo2 size={24} strokeWidth={3} />
  </motion.button>
</div>

                <div className="flex-1 flex items-center justify-center -mt-12">
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    transition={fastTransition}
                    onClick={handleFloatingAction}
                    className={`pointer-events-auto px-10 py-5 rounded-2xl font-black shadow-2xl border-2 border-white active:scale-95 uppercase italic tracking-tighter ${isMatchCompletedInDB ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                  >
                     {isMatchCompletedInDB ? 'Finish Match' : (isInningsOver || (showInningsBreak && !isSecondInnings) ? 'End Innings' : 'Next Over')}
                  </motion.button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
              
    

        {/* Modals Section */}
        <MatchSummaryModal isOpen={isMatchSummaryModalOpen} match={finalMatchData || match} onClose={() => { setIsMatchSummaryModalOpen(false); router.push(`/tournament/${tId}`); }} />
        <MatchCompletedModal isOpen={isMatchCompletedModalOpen} match={match} players={[...battingTeamPlayers, ...fieldingTeamPlayers]} onClose={() => setIsMatchCompletedModalOpen(false)} onFinishMatch={handleFinishMatch} />
        <InningsBreakModal isOpen={isInningsModalOpen} onClose={() => setIsInningsModalOpen(false)} match={match} onStartNextInnings={handleStartSecondInnings} />
        <EndOverModal isOpen={showEndOverModal} match={match} onClose={() => setShowEndOverModal(false)} onContinue={() => setShowEndOverModal(false)}
  onNextOver={() => { 
    setShowEndOverModal(false); 
    setShowBowlerModal(true); 
  }} 
/>

          {/* Match Admin Settings Engine */}
<MatchAdminEngine
  isOpen={isAdminEngineOpen}
  onClose={() => setIsAdminEngineOpen(false)}
  match={match}
  tId={tId}
  battingSquad={battingTeamPlayers}
  fieldingSquad={fieldingTeamPlayers}
/>
    
        
        <BowlerSelectionModal 
  isOpen={showBowlerModal} 
  onClose={() => setShowBowlerModal(false)}
  lastBowler={match?.bowler} 
  tId={tId} 
  match={match}
  squad={fieldingTeamPlayers} 
  onSelect={(n) => { 
    selectNextBowler(n); 
    setShowBowlerModal(false); 
  }} 
/>
        
        <PlayerSelectionModal isOpen={showMainSetup} match={match} onStart={handleMainSetupConfirm} onClose={() => setShowMainSetup(false)} />

        <NewBatsmanModal 
  isOpen={isNewBatsmanModalOpen} 
  tId={tId} 
  match={match} 
  currentStriker={match?.striker} 
  currentNonStriker={match?.nonStriker} 
  onSelect={async (name, position) => {

    // 1. Agar cancel kiya toh function yahi rok do
    if (!name) { 
      setIsNewBatsmanModalOpen(false); 
      return; 
    }
    
    try {
      const matchRef = doc(db, 'tournaments', tId, 'matches', match.id);
      
      // 2. AUTO-FIX LOGIC: Check karo kaunsa slot sach mein khali hai
      // Agar striker khali hai toh striker update karo, varna nonStriker
      let targetField = "";
      if (!match.striker || match.striker === "") {
        targetField = 'striker';
      } else if (!match.nonStriker || match.nonStriker === "") {
        targetField = 'nonStriker';
      } else {
        // Agar dono bhare hain (rare case), toh jo position modal se aayi wo use karo
        targetField = position === 'striker' ? 'striker' : 'nonStriker';
      }
      
      // 3. Payload mein sirf ek hi field rakhein
      let updatePayload = { 
        [targetField]: name 
      };

      // 4. Stats initialize karein (Reset se bachne ke liye)
      if (!match.battingStats?.[name]) {
        updatePayload[`battingStats.${name}`] = { 
          runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false 
        };
      }

      // 5. Database Update
      await updateDoc(matchRef, updatePayload);
      setIsNewBatsmanModalOpen(false);
      setIsBatsmanSelectionPending(false);
      
    } catch (error) { 
      console.error("New Batsman Update Error:", error); 
    }
  }} 
/>
    
    

         <OutModal 
  isOpen={isOutModalOpen} 
  onClose={() => setIsOutModalOpen(false)} 
  striker={match?.striker} 
  nonStriker={match?.nonStriker} 
  match={match} // Match object pass karna zaroori hai
  fieldingSquad={fieldingTeamPlayers} 
  onConfirm={async (data) => {
    try {
      // 1. Delivery ka asali type (NORMAL, WD, NB)
      const deliveryType = data.ballType; 

      // 2. Agar NORMAL ball par out hai toh handleBall use 'OUT' ki tarah treat karega
      // Lekin agar WD/NB hai toh type WD/NB hi rahega
      const finalBallType = deliveryType === 'NORMAL' ? 'OUT' : deliveryType;

      await handleBall(
        Number(data.runsScored || 0), // Extra runs (e.g. Run out ke waqt bhage hue runs)
        finalBallType, 
        {
          outType: data.outType, 
          fielderName: data.fielderName,
          batsmanName: data.batsmanName, 
          batsmanId: data.batsmanId,
          bowlerWicket: data.bowlerWicket, // Run out ke liye false jayega
          isStriker: data.isStriker
        }
      );
      setIsOutModalOpen(false);
    } catch (error) { 
      console.error("Wicket Confirmation Error:", error); 
    }
  }} 
/>
    
        <ExtraRunModal 
  isOpen={isExtraModalOpen} 
  onClose={() => setIsExtraModalOpen(false)} 
  onConfirm={(d) => { 
    // Yahan d.subCategory pass karna ZAROORI hai
    handleBall(d.runs, d.type, null, d.subCategory); 
    setIsExtraModalOpen(false); 
  }} 
  initialType={selectedExtraType} 
/>

    <CustomRunModal
  isOpen={isCustomRunModalOpen}
  onClose={() => setIsCustomRunModalOpen(false)}
  onConfirm={async (data) => {
    // 1. Agar Penalty hai
    if (data.type === "PENALTY") {
      // Note: useScoringLogic mein handleBall ko countBall handle karne ke liye update karna hoga, 
      // filhal hum ise aise bhejenge:
      await handleBall(data.runs, "PENALTY");
    } 
    
    // 2. Agar Normal Run hai (Count Ball true hai)
    else if (data.countBall) {
      await handleBall(data.runs, "NORMAL");
    } 
    
    // 3. Agar Run hai par Ball count nahi karni (Extra)
    else {
      // Cricket rules mein agar ball count nahi ho rahi aur penalty bhi nahi hai, 
      // toh ye NB ya WD ki category mein aata hai.
      await handleBall(data.runs, "NORMAL"); 
      // Tip: handleBall ke andar logic check karein ki agar countBall false hai toh kya kare.
    }

    setIsCustomRunModalOpen(false);
  }}
/>
    
    

      </motion.div>
    </AnimatePresence>
  );
    }
