import PointsTable from "./PointTable";
import BestBatsman from "./BestBatsman";
import BestBowler from "./BestBowler";
import BestSixer from "./BestSixer";
import TotalBoundaries from "./TotalBoundaries";

export default function TournamentStats({ tId, data, matches = [] }) {

  return (

    <div className="w-full p-3 space-y-6">

      <PointsTable matches={matches} />
      <BestBatsman tId={tId} />
      <BestBowler tId={tId} />
      <BestSixer tId={tId} />
      <TotalBoundaries tId={tId}/>

    </div>

  );

}
