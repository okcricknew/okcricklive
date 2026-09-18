"use client"

import { useEffect, useState } from "react"
import { useOverlay } from "../../core/OverlayProvider"
import MatchIntro from "./MatchIntro"
import LowerThirdLayout from "./LowerThirdLayout"
import BattingPanel from "./BattingPanel"
import MatchCenter from "./MatchCenter"
import MatchStats from "./MatchStats"
import BowlingPanel from "./BowlingPanel"
import InningsBreak from "./InningsBreak"
import BatsmanStats from "./BatsmanStats"
import BowlerStats from "./BowlerStats"
import WinningResult from "./WinningResult"
import SquadOverlay from "./SquadOverlay"
import BattingSummary from "./BattingSummary"
import { getBattingSummaryData } from "../../utils/getBattingSummaryData"
import BowlingSummary from "./BowlingSummary"
import { getBowlingSummaryData } from "../../utils/getBowlingSummaryData"
import MatchSummaryOverlay from "./MatchSummaryOverlay"

// ✅ ADD THESE
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../../../../lib/firebase"

export default function MatchOverlay() {
  const match = useOverlay()

  const [showBatsmanStats, setShowBatsmanStats] = useState(false)
  // ✅ Naya state bowler stats ke liye
  const [showBowlerStats, setShowBowlerStats] = useState(false) 

  useEffect(() => {
    const forceTransparency = () => {
      const selectors = ['html', 'body', 'main', '#__next', 'div[class*="layout"]', 'div[class*="container"]'];
      
      selectors.forEach(selector => {  
        const elements = document.querySelectorAll(selector);  
        elements.forEach(el => {  
          el.style.setProperty('background', 'transparent', 'important');  
          el.style.setProperty('background-color', 'transparent', 'important');  
        });  
      });  

      const uiElements = ['nav', 'header', 'footer', '.navbar', '[class*="Navbar"]', '#navbar'];  
      uiElements.forEach(selector => {  
        document.querySelectorAll(selector).forEach(el => {  
          el.style.setProperty('display', 'none', 'important');  
        });  
      });  
    };  

    forceTransparency();  
    const interval = setInterval(forceTransparency, 500);  
    return () => clearInterval(interval);
  }, []);

  // ✅ AUTO HIDE SQUAD AFTER 12 SEC
  useEffect(() => {
    if (match?.overlayType === "squad") {
      const timer = setTimeout(() => {
        const ref = doc(db, "tournaments", match.tournamentId, "matches", match.id)
        updateDoc(ref, {  
          overlayType: "main"  
        })  
      }, 12000)  

      return () => clearTimeout(timer)  
    }
  }, [match?.overlayType])

  // ✅ AUTO HIDE BATTING SUMMARY
  useEffect(() => {
    if (match?.overlayType === "battingSummary") {
      const timer = setTimeout(() => {
        const ref = doc(db, "tournaments", match.tournamentId, "matches", match.id)
        updateDoc(ref, {  
          overlayType: "main"  
        })  
      }, 8000)  

      return () => clearTimeout(timer)
    }
  }, [match?.overlayType])

  // ✅ AUTO HIDE BOWLING SUMMARY
  useEffect(() => {
    if (match?.overlayType === "bowlingSummary") {
      const timer = setTimeout(() => {
        const ref = doc(db, "tournaments", match.tournamentId, "matches", match.id)
        updateDoc(ref, {  
          overlayType: "none"  
        })  
      }, 8000)  

      return () => clearTimeout(timer)
    }
  }, [match?.overlayType])

  // ✅ Har over ke baad match summary
  useEffect(() => {
    if (match?.overlayType === "matchSummary") {
      const timer = setTimeout(() => {
        const ref = doc(db, "tournaments", match.tournamentId, "matches", match.id)
        updateDoc(ref, {  
          overlayType: "main"  
        })  
      }, 10000)  

      return () => clearTimeout(timer)
    }
  }, [match?.overlayType])

  useEffect(() => {
    if (!match) return;

    const isOverComplete = Number(match.ballsInOver) === 6;

    if (
      isOverComplete &&
      match.overlayType === "main" &&
      match.status !== "completed"
    ) {
      const ref = doc(db, "tournaments", match.tournamentId, "matches", match.id);
      updateDoc(ref, {  
        overlayType: "matchSummary"  
      });
    }
  }, [match?.ballsInOver]);

  if (!match) return null;

  // ✅ SHOW BATTING SUMMARY
  if (match?.overlayType === "battingSummary") {
    const summary = getBattingSummaryData(match)
    return <BattingSummary {...summary} />
  }

  // ✅ SHOW BOWLING SUMMARY
  if (match?.overlayType === "bowlingSummary") {
    const summary = getBowlingSummaryData(match)
    return <BowlingSummary {...summary} />
  }

  // ✅ Show Match Summary
  if (match?.overlayType === "matchSummary") {
    return <MatchSummaryOverlay match={match} />
  }

  // ✅ SHOW SQUAD DIRECTLY (NO UI BREAK)
  if (match?.overlayType === "squad") {
    return (
      <SquadOverlay
        tId={match?.tournamentId}
        teamId={match?.squadTeam === "teamA" ? match?.teamAId : match?.teamBId}
        teamName={match?.squadTeam === "teamA" ? match?.teamA : match?.teamB}
      />
    );
  }

  const isAllOut = Number(match.totalWickets || 0) >= 10;

  const isOversComplete =
    Number(match.currentOver || 0) >= Number(match.overs || 0) ||
    (Number(match.currentOver || 0) === Number(match.overs || 0) - 1 && Number(match.ballsInOver || 0) === 6);

  const isInningsBreak = Number(match.innings) === 1 && (isAllOut || isOversComplete);

  const isPreMatch = Number(match.innings || 0) === 1 && !match.striker && !match.nonStriker && !match.bowler && !match.totalRuns && !match.currentOver;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `html, body, main, #__next, .next-route-announcer { background: transparent !important; background-color: transparent !important; } nav, header, footer, .navbar { display: none !important; } #__next > div { background: transparent !important; }`
        }}
      />

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'transparent', zIndex: 99999, overflow: 'hidden' }}>  

        {/* 🔥 Batsman Stats */}  
        <BatsmanStats   
          match={match}  
          onShow={() => setShowBatsmanStats(true)}  
          onHide={() => setShowBatsmanStats(false)}  
        />  

        {/* 🔥 Bowler Stats (Ab ye bhi state change trigger karega) */}  
        <BowlerStats 
          match={match} 
          onShow={() => setShowBowlerStats(true)}
          onHide={() => setShowBowlerStats(false)}
        />  

        {/* 🔥 MAIN SCOREBOARD */}  
        {/* Dono me se koi bhi stats open ho, to main scoreboard hide ho jayega */}
        {!showBatsmanStats && !showBowlerStats && (  
          match.status === "completed" ? (
            <WinningResult />  
          ) : isInningsBreak ? (  
            <InningsBreak match={match} />  
          ) : isPreMatch ? (  
            <MatchIntro />  
          ) : (  
            <LowerThirdLayout>  
              <BattingPanel team={match?.battingTeam} batsmen={match?.batsmen || []} />  
              <MatchCenter match={match} />  
              <MatchStats />  
              <BowlingPanel team={match?.bowlingTeam} bowler={match?.bowler} balls={match?.currentOver || []} />  
            </LowerThirdLayout>  
          )  
        )}  

      </div>  
    </>
  );
                                               }
