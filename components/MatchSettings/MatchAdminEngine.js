"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

import { db } from '../../lib/firebase'; // Ensure correct path
import { ChevronRight } from 'lucide-react';

import ReplaceBatsmanModal from './ReplaceBatsmanModal';
import ReplaceBowlerModal from './ReplaceBowlerModal';
import EditTotalScoreModal from './EditTotalScoreModal';

export default function MatchAdminEngine({
  isOpen,
  onClose,
  match,
  tId,
  battingSquad = [],
  fieldingSquad = []
}) {
  const [activeSubModal, setActiveSubModal] = useState(null); // null | 'REPLACE_BATTER' | 'REPLACE_BOWLER' | 'EDIT_TOTAL_SCORE'

  if (!isOpen) return null;

  // Firebase Master Update Handler
  const handleReplaceBatsmanSubmit = async (newPlayerName, position) => {
    try {
      const matchRef = doc(db, 'tournaments', tId, 'matches', match.id);
      let updatePayload = {
        [position]: newPlayerName
      };

      // Initialize stats if player is new
      if (!match?.battingStats?.[newPlayerName]) {
        updatePayload[`battingStats.${newPlayerName}`] = {
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          isOut: false
        };
      }

      await updateDoc(matchRef, updatePayload);
      setActiveSubModal(null);
      onClose();
    } catch (error) {
      console.error("Error updating batter:", error);
      alert("Error updating batter: " + error.message);
    }
  };

  // Firebase Bowler Update Handler
  const handleReplaceBowlerSubmit = async (newBowlerName) => {
    try {
      const matchRef = doc(db, 'tournaments', tId, 'matches', match.id);
      let updatePayload = {
        bowler: newBowlerName
      };

      // Initialize stats if bowler is new
      if (!match?.bowlingStats?.[newBowlerName]) {
        updatePayload[`bowlingStats.${newBowlerName}`] = {
          runs: 0,
          wickets: 0,
          overs: 0,
          balls: 0
        };
      }

      await updateDoc(matchRef, updatePayload);
      setActiveSubModal(null);
      onClose();
    } catch (error) {
      console.error("Error updating bowler:", error);
      alert("Error updating bowler: " + error.message);
    }
  };

          // Clean Total Score Edit Handler (With Undo-Safe Snapshot Support)
  const handleManualScoreSubmit = async ({ targetInningsKey, runs, wickets, overs, isCurrentlyActiveInnings }) => {
    try {
      const currentInningsNum = Number(match?.innings || 1);
      const activeKey = targetInningsKey || `innings${currentInningsNum}`;
      
      const isActive = isCurrentlyActiveInnings !== undefined 
        ? isCurrentlyActiveInnings 
        : (activeKey === `innings${currentInningsNum}`);

      const parsedRuns = Number(runs ?? match?.[activeKey]?.runs ?? match?.runs ?? 0);
      const parsedWickets = Number(wickets ?? match?.[activeKey]?.wickets ?? match?.wickets ?? 0);
      
      const existingOvers = match?.[activeKey]?.overs ?? match?.overs ?? 0;
      const parsedOvers = (overs !== undefined && overs !== null && overs !== '') 
        ? Number(overs) 
        : Number(existingOvers);

      const completedOvers = Math.floor(parsedOvers);
      const ballsInCurrentOver = Math.round((parsedOvers - completedOvers) * 10);

      // Snapshot entry taaki Undo button is manual edit ko undo kar sake
      const currentSnapshot = {
        type: 'MANUAL_SCORE_OVERRIDE',
        id: Date.now(),
        timestamp: new Date().toISOString(),
        runs: parsedRuns,
        wickets: parsedWickets,
        overs: parsedOvers,
        isLegal: true,
        isSystemOverride: true,
        innings: currentInningsNum,
        previousState: {
          runs: match?.[activeKey]?.runs ?? match?.runs ?? 0,
          wickets: match?.[activeKey]?.wickets ?? match?.wickets ?? 0,
          overs: match?.[activeKey]?.overs ?? match?.overs ?? 0,
          totalRuns: match?.totalRuns ?? match?.runs ?? 0,
          totalWickets: match?.totalWickets ?? match?.wickets ?? 0,
          currentOver: match?.currentOver ?? 0,
          ballsInOver: match?.ballsInOver ?? 0
        }
      };

      let updatePayload = {
        [`${activeKey}.runs`]: parsedRuns,
        [`${activeKey}.wickets`]: parsedWickets,
        [`${activeKey}.overs`]: parsedOvers,
        ballHistory: arrayUnion(currentSnapshot),
        updatedAt: new Date().toISOString()
      };

      if (activeKey === 'innings1') {
        updatePayload['firstInningsScore'] = parsedRuns;
        updatePayload['innings1.runs'] = parsedRuns;

        if (currentInningsNum > 1) {
          updatePayload['target'] = parsedRuns + 1;
          updatePayload['innings1.target'] = parsedRuns + 1;
        }
      }

      if (isActive) {
        updatePayload['totalRuns'] = parsedRuns;
        updatePayload['totalWickets'] = parsedWickets;
        updatePayload['runs'] = parsedRuns;
        updatePayload['wickets'] = parsedWickets;
        updatePayload['overs'] = parsedOvers;
        
        updatePayload['isMatchEnded'] = false;
        updatePayload['isFinished'] = false;
        updatePayload['isInningsOver'] = false;
      }

      const matchRef = doc(db, 'tournaments', tId, 'matches', match.id);
      await updateDoc(matchRef, updatePayload);
      
      setActiveSubModal(null);
      onClose();
    } catch (error) {
      console.error("Error updating score:", error);
      alert("Error updating score: " + error.message);
    }
  };
  
  
  return (
    <>
      {/* MATCH SETTINGS BOTTOM SHEET */}
      {activeSubModal === null && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-[rgb(238,238,238)] text-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-4 max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col font-sans"
            >
              {/* Sheet Drag Bar */}
              <div className="w-12 h-1 bg-slate-400 rounded-full mx-auto mb-2" />

              {/* Header */}
              <div className="flex justify-between items-center mb-3 px-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-red-500 font-medium text-base hover:opacity-80 cursor-pointer"
                >
                  Cancel
                </button>
                <h2 className="text-lg font-bold text-slate-900">Match Settings</h2>
                <div className="w-10"></div>
              </div>

              {/* SECTION 1: SCORECARD */}
              <div className="mb-4">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1.5">
                  SCORECARD
                </p>
                <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200/60">
                  <button 
                    type="button"
                    className="w-full p-3.5 flex justify-between items-center text-left hover:bg-slate-50 font-semibold text-slate-800 text-sm cursor-pointer"
                  >
                    <span>Edit Score (Ball-by-Ball)</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>

                  <button 
                    type="button"
                    onClick={() => setActiveSubModal('EDIT_TOTAL_SCORE')}
                    className="w-full p-3.5 flex justify-between items-center text-left hover:bg-slate-50 font-semibold text-slate-800 text-sm cursor-pointer"
                  >
                    <span>Edit Total Score & Overs</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                      
                </div>
              </div>

              {/* SECTION 2: PLAYERS & SQUADS */}
              <div className="mb-4">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1.5">
                  PLAYERS & SQUADS
                </p>
                <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200/60 divide-y divide-slate-100">
                  
                  {/* Replace Batter Button */}
                  <button
                    type="button"
                    onClick={() => setActiveSubModal('REPLACE_BATTER')}
                    className="w-full p-3.5 flex justify-between items-center text-left hover:bg-slate-50 font-semibold text-slate-800 text-sm cursor-pointer"
                  >
                    <span>Replace Batter</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>

                  <button 
                    type="button"
                    onClick={() => setActiveSubModal('REPLACE_BOWLER')}
                    className="w-full p-3.5 flex justify-between items-center text-left hover:bg-slate-50 font-semibold text-slate-800 text-sm cursor-pointer"
                  >
                    <span>Change Bowler</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>

                  <button 
                    type="button"
                    className="w-full p-3.5 flex justify-between items-center text-left hover:bg-slate-50 font-semibold text-slate-800 text-sm cursor-pointer"
                  >
                    <span>Modify Batting Squad</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>

                  <button 
                    type="button"
                    className="w-full p-3.5 flex justify-between items-center text-left hover:bg-slate-50 font-semibold text-slate-800 text-sm cursor-pointer"
                  >
                    <span>Modify Bowling Squad</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* SECTION 3: MATCH RULES */}
              <div className="mb-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1.5">
                  MATCH RULES
                </p>
                <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200/60 divide-y divide-slate-100">
                  <button 
                    type="button"
                    className="w-full p-3.5 flex justify-between items-center text-left hover:bg-slate-50 font-semibold text-slate-800 text-sm cursor-pointer"
                  >
                    <span>Wide/No Ball Rules</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        </AnimatePresence>
      )}

      {/* SUB-MODAL ROUTER */}
      {activeSubModal === 'REPLACE_BATTER' && (
        <ReplaceBatsmanModal
          isOpen={true}
          onClose={() => setActiveSubModal(null)}
          match={match}
          battingSquad={battingSquad}
          onSubmit={handleReplaceBatsmanSubmit}
        />
      )}

      {/* Replace Bowler Sub-Modal */}
      {activeSubModal === 'REPLACE_BOWLER' && (
        <ReplaceBowlerModal
          isOpen={true}
          onClose={() => setActiveSubModal(null)}
          match={match}
          fieldingSquad={fieldingSquad}
          onSubmit={handleReplaceBowlerSubmit}
        />
      )}

      {/* Edit Total Score Sub-Modal */}
      {activeSubModal === 'EDIT_TOTAL_SCORE' && (
        <EditTotalScoreModal
          isOpen={true}
          onClose={() => setActiveSubModal(null)}
          match={match}
          onSubmit={handleManualScoreSubmit}
        />
      )}
    </>
  );
}
