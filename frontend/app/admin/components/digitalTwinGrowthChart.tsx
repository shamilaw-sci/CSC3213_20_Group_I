import AdminTrendChart, { type TrendDataProps } from "./adminTrendChart";

export default function DigitalTwinGrowthChart({ weeklyData, monthlyData, threeMonthData, sixMonthData }: TrendDataProps) {
  return <AdminTrendChart title="Digital twin growth" description="Digital twins created by registered users." weeklyData={weeklyData} monthlyData={monthlyData} threeMonthData={threeMonthData} sixMonthData={sixMonthData} series={[{ key: "count", name: "Digital twins", color: "#059669" }]} />;
}
