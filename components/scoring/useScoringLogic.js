import { useState, useEffect } from 'react';
import { updateMatchScore } from './firebaseActions';
import { increment, doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore'; 
import { db } from '../../lib/firebase'; 

export const useScoringLogic = (match, tId) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInningsBreak, setShowInningsBreak] = useState(false);
  
  // --- NAYA STATE: Batsman Modal ke liye ---
  const [showNewBatsmanModal, setShowNewBatsmanModal] = useState(false);

      // --- REFRESH, INNINGS BREAK & NEW BATSMAN MODAL LOGIC ---
  useEffect(() => {
    if (!match) return;

    const maxOvers = Number(match.overs || 0);
    const currentOver = Number(match.currentOver || 0);
    const ballsInOver = Number(match.ballsInOver || 0);
    const totalWickets = Number(match.totalWickets || 0);
    
    // Check legal balls in 1st Innings history
    const i1BallsCount = (match.ballHistory || []).filter(
      b => Number(b.innings || 1) === 1 && b.type !== 'MANUAL_SCORE_OVERRIDE' && !['WD', 'NB', 'PENALTY'].includes(b.type)
    ).length;

    // Innings Break tabhi hoga jab kam se kam 1 valid ball dali ho AUR overs/wickets officially finish hue ho
    const isFirstInningsOver = match.innings === 1 && match.status !== 'completed' && (totalWickets >= 10 || (maxOvers > 0 && currentOver >= maxOvers && ballsInOver === 0));
    

    if (isFirstInningsOver) { 
      setShowInningsBreak(true);
    } else {
      setShowInningsBreak(false);
    }

    // 2. New Batsman Modal Logic
    if (match.status === 'live' && !match.striker && totalWickets > 0 && totalWickets < 10) {
      setShowNewBatsmanModal(true);
    } else {
      setShowNewBatsmanModal(false);
    }
  }, [match]);
  

  // --- WINNER LOGIC CHECK ---
  const checkMatchResult = (matchData, currentUpdates) => {
    if (matchData.innings !== 2) return null;
    const target = Number(matchData.target || (Number(matchData.firstInningsScore || matchData.innings1?.runs || 0) + 1));
    const newTotalRuns = Number(matchData.totalRuns || 0) + Number(currentUpdates.ballRunValue || 0);
    const newTotalWickets = Number(matchData.totalWickets || 0) + (currentUpdates.isWicketBall ? 1 : 0);
    const maxOvers = Number(matchData.overs || 0);
    const currentBallsInOver = Number(currentUpdates.newBallsInOver || 0);
    const currentOverCount = Number(matchData.currentOver || 0);

    if (newTotalRuns >= target) {
      return {
        winner: matchData.battingTeam,
        runner: matchData.battingTeam === matchData.teamA ? matchData.teamB : matchData.teamA,
        resultSummary: `${matchData.battingTeam} won by ${10 - newTotalWickets} wickets`
      };
    }

    const isAllOut = newTotalWickets >= 10;
    const isOversFinished = currentOverCount >= (maxOvers - 1) && currentBallsInOver === 6;

    if (isAllOut || isOversFinished) {
      if (newTotalRuns < target - 1) {
        const winnerTeam = matchData.battingTeam === matchData.teamA ? matchData.teamB : matchData.teamA;
        return { winner: winnerTeam, runner: matchData.battingTeam, resultSummary: `${winnerTeam} won by ${target - 1 - newTotalRuns} runs` };
      } else if (newTotalRuns === target - 1) {
        return { winner: "Tied", runner: "Tied", resultSummary: "Match Tied (Scores Level)" };
      }
    }
    return null;
  };

  // --- 1. SELECT NEXT BOWLER ---
  const selectNextBowler = async (bowlerName) => {
    if (isProcessing || !match || !match.id) return;
    setIsProcessing(true);
    try {
      const updates = { bowler: bowlerName, bowlerBalls: 0, ballsInOver: 0, currentOver: increment(1) };
      await updateMatchScore(tId, match.id, updates, null);
    } catch (error) { console.error("Bowler Error:", error); } finally { setIsProcessing(false); }
  };

  // --- 2. SELECT. NEXT BATSMAN ---
  const selectNextBatsman = async (batsmanName, playerId) => {
  if (isProcessing || !match || !match.id) return;
  setIsProcessing(true);
  
  try {
    // Check karein ki striker khali hai ya non-striker
    let slotToUpdate = null;

if (!match.striker) {
  slotToUpdate = "striker";
} 
else if (!match.nonStriker) {
  slotToUpdate = "nonStriker";
}

    const updates = {
      [slotToUpdate]: batsmanName, // Jo khali hai wahan naya batsman jayega
      [`battingStats.${batsmanName}.playerId`]: playerId,
      battingPlayers: [...(match.battingPlayers || []), batsmanName],
      [`battingStats.${batsmanName}.runs`]: 0,
      [`battingStats.${batsmanName}.balls`]: 0,
      [`battingStats.${batsmanName}.dots`]: 0,
      [`battingStats.${batsmanName}.isOut`]: false
    };

    await updateMatchScore(tId, match.id, updates, null);
    setShowNewBatsmanModal(false);
  } catch (error) { 
    console.error("Batsman Selection Error:", error); 
  } finally { 
    setIsProcessing(false); 
  }
};
  

  // --- 3. HANDLE BALL SCORING ---
  const handleBall = async (runs, type = 'NORMAL', wicketData = null, subCategory = null) => {
    if (isProcessing || !match || !match.id || !match.striker || match.status === 'completed') return;
    
    const ballType = type || 'NORMAL';
    const isPenalty = ballType === "PENALTY";
const isExtraBall = ['WD', 'NB'].includes(ballType) || isPenalty;
    const currentBallsInOver = Number(match.ballsInOver || 0);
    const currentOverCount = Number(match.currentOver || 0);

    if (!isExtraBall && currentBallsInOver >= 6) return;

    setIsProcessing(true);
    let updates = {};
    if (match.freeHit) {
      updates.freeHit = false;
    }
    const isWide = ballType === 'WD';
    const isNoBall = ballType === 'NB';
    const isExtra = isWide || isNoBall;
    const isByesOrLegByes = ['BYE', 'LB'].includes(ballType);
    
        const isWicket = ballType === 'OUT' || !!wicketData;
    
    // Case sensitivity aur null check fix
    const outType = wicketData?.outType?.toUpperCase() || "";

    const bowlerWicketTypes = [
"BOWLED",
"CAUGHT",
"LBW",
"HIT WICKET",
"STUMPED"
];

    const isValidWicket = isWicket && (
  ballType === 'OUT' ||
  ['RUN OUT','HIT WICKET','TIMED OUT','OBSTRUCTING THE FIELD'].includes(outType) ||
  (isWide && ['RUN OUT','STUMPED','OBSTRUCTING THE FIELD'].includes(outType)) ||
  (isNoBall && ['RUN OUT','HIT WICKET','OBSTRUCTING THE FIELD'].includes(outType))
);
    
    // Yahan Number conversion zaroori hai taaki calculation sahi ho
    let totalRunValue;

if (ballType === "PENALTY") {
  totalRunValue = Number(runs); // direct 5 runs
} else {
  totalRunValue = isExtra ? (Number(runs) + 1) : Number(runs);
}
    
    const currentTotal = Number(match.totalRuns ?? match[`innings${match.innings || 1}`]?.runs ?? 0);
updates.totalRuns = currentTotal + totalRunValue;
    
    updates['currentPartnership.runs'] = increment(totalRunValue);
    
    
    const inningsKey = `innings${match.innings || 1}`; 
    if (isWide) updates[`extras.${inningsKey}.wd`] = increment(runs + 1);
    else if (isNoBall) { updates[`extras.${inningsKey}.nb`] = increment(runs + 1); updates.freeHit = true; }
    else if (ballType === 'BYE') updates[`extras.${inningsKey}.byes`] = increment(runs);
    else if (ballType === 'LB') updates[`extras.${inningsKey}.legByes`] = increment(runs);
    else if (ballType === "PENALTY") {
  updates[`extras.${inningsKey}.penalty`] = increment(runs);
    }

                if (isValidWicket) {
      updates.totalWickets = increment(1);
      updates.currentPartnership = { runs: 0, balls: 0 };

      // Out hone wale ka naam pakdein
      const outPlayerName = wicketData?.batsmanName 
  ? wicketData.batsmanName 
  : match.striker;
      
      // Safety: Direct match.totalWickets par depend na rahein
      const totalWicketsAbhi = Number(match.totalWickets || 0);

      // AGAR 10th wicket nahi hai, toh hi khali karo (Warna innings khatam ho jayegi)
      if (totalWicketsAbhi < 9) { 
        if (outPlayerName === match.nonStriker) {
          updates.nonStriker = ""; 
        } else {
          updates.striker = ""; 
        }
      }

      if (wicketData) {
        updates[`battingStats.${outPlayerName}.isOut`] = true;
        updates[`battingStats.${outPlayerName}.outType`] =
  outType === "OBSTRUCTING THE FIELD"
    ? "Obstructing the Field"
    : wicketData.outType;
        updates[`battingStats.${outPlayerName}.fielderName`] = wicketData.fielderName || "";
        updates[`battingStats.${outPlayerName}.bowlerName`] = match.bowler || "";
      }
                }
    

    let nextBallCount = currentBallsInOver;
    if (!isExtra && !isPenalty) {
      nextBallCount = currentBallsInOver + 1;
      updates.ballsInOver = nextBallCount;
      if (!isValidWicket && !isPenalty) {
  updates['currentPartnership.balls'] = increment(1);
      }

      if (nextBallCount === 6 && !isValidWicket) {
    // Normal ball par over khatam hone par strike change
    if (runs % 2 === 0) { updates.striker = match.nonStriker; updates.nonStriker = match.striker; }
} else if (Number(runs) % 2 !== 0 && !isValidWicket && !isPenalty) {
    // !isPenalty lagane se ab 1, 3, 5 penalty par strike nahi badlegi
    updates.striker = match.nonStriker;
    updates.nonStriker = match.striker;
      }
      
    } else if (Number(runs) % 2 !== 0 && !isValidWicket && !isPenalty) {
    updates.striker = match.nonStriker; updates.nonStriker = match.striker;
    }
    

    const result = checkMatchResult(match, { ballRunValue: totalRunValue, isWicketBall: isValidWicket, newBallsInOver: nextBallCount });
    if (result) {
      updates.status = "completed"; updates.winner = result.winner; updates.runner = result.runner; updates.resultSummary = result.resultSummary;
    }

        // --- BATTING STATS UPDATE START ---
    if (ballType !== 'WD' && ballType !== 'PENALTY') {
      const sName = match.striker; // Ye line upar honi chahiye
      updates[`battingStats.${sName}.balls`] = increment(1);
      
      // Check: Kya runs batsman ke khate mein jayenge?
      const runsKeHaqdaarHaiBatter = (ballType === 'NORMAL') || (isNoBall && subCategory === 'From Bat');

      // Dots logic
      if (runs === 0 && !isValidWicket && !isNoBall) {
        updates[`battingStats.${sName}.dots`] = increment(1);
      }

      // Sahi Scoring Logic
      if (runsKeHaqdaarHaiBatter && !isValidWicket) {
        updates[`battingStats.${sName}.runs`] = increment(runs);
        if (runs === 4) updates[`battingStats.${sName}.fours`] = increment(1);
        if (runs === 6) updates[`battingStats.${sName}.sixes`] = increment(1);
      }
    }
    // --- BATTING STATS UPDATE END ---
    
    const ballLog = {
      id: Date.now(), runs, type: ballType, subCategory: subCategory, striker: match.striker, nonStriker: match.nonStriker,
      bowler: match.bowler, over: currentOverCount, deliveryNum: (match.ballHistory?.length || 0) + 1, 
      timestamp: new Date().toISOString(), innings: match.innings || 1, 
      runsAtMoment: (match.totalRuns || 0) + totalRunValue,
      isLegal: ballType !== "PENALTY",
      ...(isValidWicket && { wicketInfo: wicketData })
    };

    if (match.bowler) {
      const bName = match.bowler;
      if (match.bowlerId) updates[`bowlingStats.${bName}.playerId`] = match.bowlerId;
      
      let runsToAssignToBowler = 0;

if (isNoBall) {
  // Agar NB ke sath Bye/LegBye hai, toh bowler ko sirf 1 run penalty padegi
  const isNBExtra = subCategory === 'Leg Bye' || subCategory === 'Bye';
  runsToAssignToBowler = isNBExtra ? 1 : totalRunValue; 
} else if (!isByesOrLegByes && ballType !== "PENALTY") {
  runsToAssignToBowler = totalRunValue;
}

if (runsToAssignToBowler > 0) {
  updates[`bowlingStats.${bName}.runs`] = increment(runsToAssignToBowler);
}
      
      if (isValidWicket && bowlerWicketTypes.includes(outType) && !isNoBall) updates[`bowlingStats.${bName}.wickets`] = increment(1);
      
      if (!isExtra && !isPenalty) {
        
        const bBalls = (Number(match.bowlerBalls || 0)) + 1;
        updates.bowlerBalls = bBalls;
        if (bBalls === 6) {
          updates[`bowlingStats.${bName}.overs`] = increment(1);
          const currentOverBalls = (match.ballHistory || []).filter(b => b.over === currentOverCount && b.innings === (match.innings || 1));
          const runsInOver = currentOverBalls.reduce((sum, b) => sum + (['BYE', 'LB'].includes(b.type) ? 0 : (b.runs || 0)), 0) + (isByesOrLegByes ? 0 : runs);
          const hasExtras = currentOverBalls.some(b => ['WD', 'NB'].includes(b.type)) || isExtra;
          if (runsInOver === 0 && !hasExtras) updates[`bowlingStats.${bName}.maidens`] = increment(1);
        }
      }
    }

    try { await updateMatchScore(tId, match.id, updates, ballLog); } catch (error) { console.error("Scoring Error:", error); } finally { setIsProcessing(false); }
  };

  const handleRetiredOut = async (playerName) => {

if (isProcessing || !match || !match.id) return;

setIsProcessing(true);

try {

const updates = {
totalWickets: increment(1),
[`battingStats.${playerName}.isOut`]: true,
[`battingStats.${playerName}.outType`]: "Retired Out"
};

if (playerName === match.striker) updates.striker = "";
if (playerName === match.nonStriker) updates.nonStriker = "";

await updateMatchScore(tId, match.id, updates, null);

}

catch(error){
console.error("Retired Out Error",error)
}

finally{
setIsProcessing(false)
}

};

  const handleRetiredHurt = async (playerName) => {

if (isProcessing || !match || !match.id) return;

setIsProcessing(true);

try {

const updates = {
[`battingStats.${playerName}.retiredHurt`] : true
};

if (playerName === match.striker) updates.striker = "";
if (playerName === match.nonStriker) updates.nonStriker = "";

await updateMatchScore(tId, match.id, updates, null);

}

catch(error){
console.error("Retired Hurt Error",error)
}

finally{
setIsProcessing(false)
}

};

  const handleTimedOut = async (playerName) => {

if (isProcessing || !match || !match.id) return;

setIsProcessing(true);

try {

const updates = {

totalWickets: increment(1),

[`battingStats.${playerName}.isOut`] : true,

[`battingStats.${playerName}.outType`] : "Timed Out"

};

await updateMatchScore(tId, match.id, updates, null);

}

catch(error){
console.error("Timed Out Error",error)
}

finally{
setIsProcessing(false)
}

};

  

  // --- 4. UNDO BALL LOGIC ---
  const undoLastBall = async () => {
    if (isProcessing || !match || !match.id) return;
    setIsProcessing(true);
    try {
      const matchRef = doc(db, 'tournaments', tId, 'matches', match.id);
      const lastBall = match.ballHistory?.[match.ballHistory.length - 1];
      if (!lastBall) { setIsProcessing(false); return; }

      // ==================== YAHAN ADD KAREIN (MANUAL OVERRIDE SNAPSHOT UNDO) ====================
            if (lastBall?.type === 'MANUAL_SCORE_OVERRIDE' && lastBall?.previousState) {
        const targetInningsKey = `innings${match.innings || 1}`;
        const prev = lastBall.previousState;

        let overridePayload = {
          [`${targetInningsKey}.runs`]: prev.runs,
          [`${targetInningsKey}.wickets`]: prev.wickets,
          [`${targetInningsKey}.overs`]: prev.overs,
          totalRuns: prev.totalRuns ?? prev.runs,
          totalWickets: prev.totalWickets ?? prev.wickets,
          currentOver: prev.currentOver ?? prev.overs,
          ballsInOver: prev.ballsInOver ?? 0,
          status: 'live', // <--- Line Add Ki Hai (Match active hi rahega)
          ballHistory: arrayRemove(lastBall),
          updatedAt: new Date().toISOString()
        };

        await updateDoc(matchRef, overridePayload);
        setIsProcessing(false);
        return;
            }
      
      // ========================================================================================

      if (Number(match.innings) === 2 && Number(lastBall.innings) === 1) {
      console.warn("Innings 1 is locked. Cannot undo.");
      setIsProcessing(false);
      return; 
      }

            if (match.ballsInOver === 0 && match.currentOver > 0) {
        // Sirf tabhi piche jayein agar hum current innings ke andar hi hain
        const hasCurrentInningsBall = match.ballHistory?.some(b => 
          b.over === match.currentOver && 
          Number(b.innings) === Number(match.innings)
        );
        
        if (!hasCurrentInningsBall) {
            await updateDoc(matchRef, { 
              bowler: lastBall.bowler, 
              currentOver: match.currentOver - 1, 
              ballsInOver: 6, 
              bowlerBalls: 6 
            });
            setIsProcessing(false); 
            return;
        }
            }
      

      let undoUpdates = { status: 'live', winner: "", runner: "", resultSummary: "", ballHistory: arrayRemove(lastBall) };
      const inningsKey = `innings${lastBall.innings || 1}`;
      const isExtraBall = ['WD', 'NB'].includes(lastBall.type) || lastBall.type === 'PENALTY';
      
      const isWicket = lastBall.type === 'OUT' || (lastBall.wicketInfo !== undefined);
      let totalRunValue;

if (lastBall.type === "PENALTY") {
  totalRunValue = Number(lastBall.runs) || 0;
} else {
  totalRunValue = isExtraBall ? (Number(lastBall.runs) || 0) + 1 : (Number(lastBall.runs) || 0);
}

      undoUpdates.totalRuns = increment(-totalRunValue);

      if (isWicket) {
        const historyMinusLast = match.ballHistory.slice(0, -1);
        // SIRF current innings ki history filter karein recalculation ke liye
        const currentInningsHistory = historyMinusLast.filter(b => Number(b.innings) === Number(match.innings));
        
        const lastWicketIndex = [...currentInningsHistory].reverse().findIndex(b => b.type === 'OUT' || b.wicketInfo);
        
        let prevRuns = 0; let prevBalls = 0;
        const relevantHistory = lastWicketIndex === -1 ? currentInningsHistory : currentInningsHistory.slice(currentInningsHistory.length - lastWicketIndex);
        
        relevantHistory.forEach(ball => {
          prevRuns += (['WD', 'NB'].includes(ball.type) ? (ball.runs + 1) : ball.runs);
          if (!['WD', 'NB'].includes(ball.type)) prevBalls += 1;
        });
        undoUpdates.currentPartnership = { runs: prevRuns, balls: prevBalls };
      } else {
        undoUpdates['currentPartnership.runs'] = increment(-totalRunValue);
      }

      if (lastBall.type === 'WD') undoUpdates[`extras.${inningsKey}.wd`] = increment(-totalRunValue);
      if (lastBall.type === 'NB') undoUpdates[`extras.${inningsKey}.nb`] = increment(-totalRunValue);
      if (lastBall.type === 'BYE') undoUpdates[`extras.${inningsKey}.byes`] = increment(-(Number(lastBall.runs) || 0));
      if (lastBall.type === 'LB') undoUpdates[`extras.${inningsKey}.legByes`] = increment(-(Number(lastBall.runs) || 0));
      if (lastBall.type === "PENALTY") {
  undoUpdates[`extras.${inningsKey}.penalty`] = increment(-totalRunValue);
      }
      
      if (isWicket) {
        undoUpdates.totalWickets = increment(-1);
        const outPlayer = lastBall.wicketInfo?.batsmanName || lastBall.striker;
        undoUpdates[`battingStats.${outPlayer}.isOut`] = false;
        undoUpdates[`battingStats.${outPlayer}.outType`] = "";
        if (lastBall.bowler && lastBall.type !== 'NB' && lastBall.wicketInfo?.bowlerWicket) {
          undoUpdates[`bowlingStats.${lastBall.bowler}.wickets`] = increment(-1);
        }
      }

      const currentMatchBalls = Number(match.ballsInOver || 0);
if (!isExtraBall) {
  if (!isWicket) undoUpdates['currentPartnership.balls'] = increment(-1);
  if (currentMatchBalls > 0) {
    undoUpdates.ballsInOver = increment(-1);
    undoUpdates.bowlerBalls = increment(-1);
  }
}
      const wasRunsOffBat = lastBall.type === 'NORMAL' || (lastBall.type === 'NB' && lastBall.subCategory === 'From Bat');

if (lastBall.type !== 'WD' && lastBall.type !== 'PENALTY') { 
    undoUpdates[`battingStats.${lastBall.striker}.balls`] = increment(-1);
    
    // Yahan change karein:
    if (wasRunsOffBat && !isWicket) {
        const ballRuns = Number(lastBall.runs) || 0;
        undoUpdates[`battingStats.${lastBall.striker}.runs`] = increment(-ballRuns);
        if (ballRuns === 4) undoUpdates[`battingStats.${lastBall.striker}.fours`] = increment(-1);
        if (ballRuns === 6) undoUpdates[`battingStats.${lastBall.striker}.sixes`] = increment(-1);
    }
}
      

      if (lastBall.bowler) {
        const bName = lastBall.bowler;

        let undoBowlerRuns = 0;

if (lastBall.type === 'NB') {
  // Agar NB ke sath Bye/LegBye tha, toh bowler ka sirf 1 run (penalty) undo hoga
  const isNBExtra = lastBall.subCategory === 'Leg Bye' || lastBall.subCategory === 'Bye';
  undoBowlerRuns = isNBExtra ? 1 : totalRunValue;
} else if (
  lastBall.type !== 'BYE' &&
  lastBall.type !== 'LB' &&
  lastBall.type !== 'PENALTY'
) {
  // Normal aur Wide balls ke saare runs undo honge
  undoBowlerRuns = totalRunValue;
}

if (undoBowlerRuns > 0) {
  undoUpdates[`bowlingStats.${bName}.runs`] = increment(-undoBowlerRuns);
}
        
        if (!isExtraBall && match.ballsInOver === 6) {
          undoUpdates[`bowlingStats.${bName}.overs`] = increment(-1);
          const currentOverBalls = (match.ballHistory || []).filter(b => b.over === match.currentOver && b.innings === (match.innings || 1));
          const runsInOver = currentOverBalls.reduce((sum, b) => sum + (['BYE', 'LB'].includes(b.type) ? 0 : (b.runs || 0)), 0);
          if (runsInOver === 0 && !currentOverBalls.some(b => ['WD', 'NB'].includes(b.type))) undoUpdates[`bowlingStats.${bName}.maidens`] = increment(-1);
        }
      }
      undoUpdates.striker = lastBall.striker;
      undoUpdates.nonStriker = lastBall.nonStriker;

      await updateDoc(matchRef, undoUpdates);
    } catch (error) { console.error("Undo Error:", error); } finally { setIsProcessing(false); }
  };

  // --- 5. START SECOND INNINGS ---
const startSecondInnings = async (finalOversFromModal) => {
  if (isProcessing || !match || !match.id) return;
  setIsProcessing(true);
  
  try {
    const matchRef = doc(db, 'tournaments', tId, 'matches', match.id);
    const nextBattingTeam = match.battingTeam === match.teamA ? match.teamB : match.teamA;
    const nextBowlingTeam = match.battingTeam;

    const currentHistory = match.ballHistory || [];
    
    let displayOvers = finalOversFromModal || `${match.currentOver}.${match.ballsInOver}`;

    // FOW calculation for Backup
    const i1Fow = currentHistory
      .filter(ball => Number(ball.innings) === 1 && (ball.type === 'OUT' || ball.wicketInfo))
      .map((ball, index) => ({
        num: index + 1,
        score: ball.runsAtMoment || 0,
        over: `${ball.over}.${(currentHistory.filter(b => b.over === ball.over && !['WD', 'NB'].includes(b.type)).indexOf(ball) + 1)}`,
        player: ball.wicketInfo?.batsmanName || ball.striker
      }));

    const firstInningsBackup = {
      batting: { ...match.battingStats } || {}, 
      battingPlayers: match.battingPlayers || [],
      bowling: { ...match.bowlingStats } || {},
      totalRuns: Number(match.totalRuns || 0), 
      totalWickets: Number(match.totalWickets || 0),
      overs: displayOvers,
      fow: i1Fow,
      extras: match.extras?.innings1 || match.extras || {}
    };

    // --- ATOMIC UPDATE (HISTORY SAVED PERMANENTLY) ---
    await updateDoc(matchRef, {
      innings: 2, 
      firstInningsStatsBackup: firstInningsBackup, 
      firstInningsScore: Number(match.totalRuns || 0), 
      firstInningsWickets: Number(match.totalWickets || 0), 
      target: Number(match.totalRuns || 0) + 1,
      battingTeam: nextBattingTeam, 
      bowlingTeam: nextBowlingTeam,
      
      // Resetting Live Stats for 2nd Innings
      totalRuns: 0, 
      totalWickets: 0, 
      currentOver: 0, 
      ballsInOver: 0,
      bowlerBalls: 0, 
      striker: "", 
      nonStriker: "", 
      bowler: "", 
      currentPartnership: { runs: 0, balls: 0 },
      battingStats: {}, 
      bowlingStats: {}, 
      
      // Yahan se ballHistory: [] hata diya gaya hai.
      // Ab Innings 1 ki balls database mein hamesha ke liye save rahengi.
      status: 'live'
    });

    return true;
  } catch (error) { 
    console.error("Switch Innings Error:", error); 
  } finally { 
    setIsProcessing(false); 
  }
};
  

  // Ye function ballHistory se FOW ki list banayega
const getFallOfWickets = (inningsNum) => {
  if (!match.ballHistory) return [];
  
  return match.ballHistory
    .filter(ball => ball.innings === inningsNum && (ball.type === 'OUT' || ball.wicketInfo))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Time order sahi karne ke liye
    .map((ball, index) => ({
      num: index + 1,
      score: ball.runsAtMoment || 0,
      over: `${ball.over}.${ball.deliveryNum % 6 || 6}`, 
      player: ball.wicketInfo?.batsmanName || ball.striker
    }));
};
  
  
  // --- 6. FINALIZE MATCH ---
  const finalizeMatch = async (mvpData) => { 
    if (isProcessing || !match || !match.id) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'tournaments', tId, 'matches', match.id), {
        mvp: mvpData.name || "Unknown", mvpPlayerId: mvpData.id || "", status: 'completed', completedAt: new Date().toISOString()
      });
      return true;
    } catch (error) { console.error("Finalize Error:", error); } finally { setIsProcessing(false); }
  };

  return { 
    handleBall, 
    selectNextBowler, 
    selectNextBatsman, // UI mein use karein
    undoLastBall, 
    startSecondInnings, 
    finalizeMatch,
    handleRetiredOut,
handleRetiredHurt,
handleTimedOut,
    isProcessing, 
    showInningsBreak,
    showNewBatsmanModal,// UI modal control ke liye
    fowData: {
      innings1: getFallOfWickets(1),
      innings2: getFallOfWickets(2)
    }
  };
};
