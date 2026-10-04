import AdminTrendChart, { type TrendDataProps } from "./adminTrendChart";

export default function UserGrowthChart({ weeklyData, monthlyData, threeMonthData, sixMonthData }: TrendDataProps) {
  return <AdminTrendChart title="User growth" description="New registered accounts created over time." weeklyData={weeklyData} monthlyData={monthlyData} threeMonthData={threeMonthData} sixMonthData={sixMonthData} series={[{ key: "count", name: "New users", color: "#2563eb" }]} />;
}
