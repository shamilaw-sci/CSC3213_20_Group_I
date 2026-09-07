//analytics page
import UserGrowthChart from "../components/userGrowthChart";
import DigitalTwinGrowthChart from "../components/digitalTwinGrowthChart";
import RedirectionChart from "../components/redirectionChart";

export default function Analytics() {
  return (
    <div>
      <div className="p-6">
        <UserGrowthChart/>
      </div>
      
      <div className="p-6">
        <DigitalTwinGrowthChart/>
      </div>

      <div className="p-6">
        <RedirectionChart />
      </div>

    </div>
    
  );
}
