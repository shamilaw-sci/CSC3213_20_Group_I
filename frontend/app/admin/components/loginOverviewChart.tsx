import AdminTrendChart, { type TrendDataProps } from "./adminTrendChart";

export default function LoginOverviewChart({ weeklyData, monthlyData, threeMonthData, sixMonthData }: TrendDataProps) {
  return (
    <AdminTrendChart
      title="Login activity"
      description="Compare registered-account logins with new guest sessions."
      weeklyData={weeklyData}
      monthlyData={monthlyData}
      threeMonthData={threeMonthData}
      sixMonthData={sixMonthData}
      series={[
        { key: "registered", name: "Registered", color: "#7e22ce" },
        { key: "guests", name: "Guests", color: "#db2777" },
      ]}
    />
  );
}
