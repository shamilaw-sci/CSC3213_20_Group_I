import AdminTrendChart, { type TrendDataProps } from "./adminTrendChart";

export default function RedirectionChart({ weeklyData, monthlyData, threeMonthData, sixMonthData }: TrendDataProps) {
  return <AdminTrendChart title="Merchant redirects" description="Visits sent from TryVora to merchant product pages." weeklyData={weeklyData} monthlyData={monthlyData} threeMonthData={threeMonthData} sixMonthData={sixMonthData} series={[{ key: "count", name: "Redirects", color: "#0891b2" }]} />;
}
