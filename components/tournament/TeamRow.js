import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Trash2, Edit2 } from 'lucide-react';

export default function TeamRow({
  team,
  tournamentId,
  initialCount = 0,
  onManage,
  onDelete,
  onEdit,
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (!tournamentId || !team.id) return;
    const q = query(collection(db, "tournaments", tournamentId, "teams", team.id, "players"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCount(snapshot.docs.length);
    });
    return () => unsubscribe();
  }, [team.id, tournamentId]);

  return (
    <div className="w-full">
      <div className="bg-white border border-emerald-100/80 p-3 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between gap-3">
        {/* Left Section: Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0C381E] border border-emerald-200 shrink-0 flex items-center justify-center shadow-inner">
            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={team.name}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <div className="text-yellow-400 flex flex-col items-center justify-center w-full h-full">
                <span className="text-sm font-black leading-none">{count}</span>
                <span className="text-[6px] font-bold uppercase tracking-tighter text-yellow-300/80">
                  SQD
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-black text-[13px] uppercase tracking-tighter text-[#0C381E] truncate leading-tight">
              {team.name}
            </h3>
            <p className="text-[9px] text-amber-600 font-extrabold uppercase tracking-widest mt-0.5">
              {count} SQUAD PLAYERS
            </p>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(team)}
            className="p-1.5 text-gray-400 hover:text-amber-600 transition-colors"
          >
            <Edit2 size={14} />
          </button>

          <button
            onClick={() => onDelete(team.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>

          <button
            onClick={() => onManage(team)}
            className="ml-1 bg-[#0C381E] hover:bg-emerald-900 text-yellow-300 font-bold px-3 py-2 rounded-xl active:scale-90 transition-all shadow-sm text-xs"
          >
            Add Player
          </button>
        </div>
      </div>
    </div>
  );
    }
              
