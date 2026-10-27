export default function AddTeamCard({ teamName, setTeamName, setTeamLogo, handleAddTeam }) {
  return (
    <div className="mb-8 max-w-lg mx-auto">
      <div className="bg-white p-2 border border-emerald-200 flex gap-2 items-center rounded-2xl shadow-sm">
         <input 
           type="text" placeholder="NEW TEAM NAME..." value={teamName} 
           onChange={(e) => setTeamName(e.target.value)} 
           className="flex-1 bg-transparent pl-3 text-xs outline-none font-black italic uppercase text-[#0C381E] placeholder:text-gray-400" 
         />
         <input
           type="file"
           accept="image/*"
           onChange={(e) => setTeamLogo(e.target.files?.[0] || null)}
           className="text-[10px] w-[110px] text-gray-500 file:mr-2 file:py-1.5 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-[#0C381E] hover:file:bg-emerald-100 cursor-pointer"
         />
         <button onClick={handleAddTeam} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 font-black italic text-[10px] uppercase rounded-xl active:scale-95 transition-all shadow-sm">
           Add Team
         </button>
      </div>
    </div>
  );
}
