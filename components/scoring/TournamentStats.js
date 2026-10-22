import PointsTable from "./PointTable";
import BestBatsman from "./BestBatsman";
import BestBowler from "./BestBowler";
import BestSixer from "./BestSixer";
import TotalBoundaries from "./TotalBoundaries";

export default function TournamentStats({ tId, data, matches = [] }) {

  return (

    <div className="w-full p-3 space-y-6">

      <PointsTable matches={matches} />
      <BestBatsman matches={matches} />
      <BestBowler tId={tId} />
      <BestSixer matches={matches} />
      <TotalBoundaries tId={tId}/>

    </div>

  );

}
