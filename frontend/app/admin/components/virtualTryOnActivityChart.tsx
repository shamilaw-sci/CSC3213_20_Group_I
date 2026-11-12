import AdminTrendChart, { type TrendDataProps } from "./adminTrendChart";

export default function VirtualTryOnActivityChart({ weeklyData, monthlyData, threeMonthData, sixMonthData }: TrendDataProps) {
  return <AdminTrendChart title="Virtual try-on activity" description="Virtual try-on sessions started by guests and registered users." weeklyData={weeklyData} monthlyData={monthlyData} threeMonthData={threeMonthData} sixMonthData={sixMonthData} series={[{ key: "count", name: "Try-on sessions", color: "#ea580c" }]} />;
}
