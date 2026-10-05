import { getAdminDashboardAnalytics } from "@/server/modules/analytics/admin-dashboard";
import DigitalTwinGrowthChart from "../components/digitalTwinGrowthChart";
import LoginOverviewChart from "../components/loginOverviewChart";
import RedirectionChart from "../components/redirectionChart";
import UserGrowthChart from "../components/userGrowthChart";
import VirtualTryOnActivityChart from "../components/virtualTryOnActivityChart";

export default async function AnalyticsPage() {
  const analytics = await getAdminDashboardAnalytics();

  return (
    <section className="space-y-6">
      <div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-700">Reporting</p>
          <h2 className="mt-1 text-3xl font-black text-slate-950">Platform analytics</h2>
          <p className="mt-2 text-slate-600">Explore login, customer, digital twin, try-on, and merchant redirect trends.</p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="xl:col-span-2">
          <LoginOverviewChart weeklyData={analytics.loginActivity.weekly} monthlyData={analytics.loginActivity.monthly} threeMonthData={analytics.loginActivity.threeMonths} sixMonthData={analytics.loginActivity.sixMonths} />
        </div>
        <div className="xl:col-span-2">
          <UserGrowthChart weeklyData={analytics.userGrowth.weekly} monthlyData={analytics.userGrowth.monthly} threeMonthData={analytics.userGrowth.threeMonths} sixMonthData={analytics.userGrowth.sixMonths} />
        </div>
        <div className="xl:col-span-2">
          <DigitalTwinGrowthChart weeklyData={analytics.digitalTwinGrowth.weekly} monthlyData={analytics.digitalTwinGrowth.monthly} threeMonthData={analytics.digitalTwinGrowth.threeMonths} sixMonthData={analytics.digitalTwinGrowth.sixMonths} />
        </div>
        <div className="xl:col-span-2">
          <VirtualTryOnActivityChart weeklyData={analytics.tryOnActivity.weekly} monthlyData={analytics.tryOnActivity.monthly} threeMonthData={analytics.tryOnActivity.threeMonths} sixMonthData={analytics.tryOnActivity.sixMonths} />
        </div>
        <div className="xl:col-span-2">
          <RedirectionChart weeklyData={analytics.redirects.weekly} monthlyData={analytics.redirects.monthly} threeMonthData={analytics.redirects.threeMonths} sixMonthData={analytics.redirects.sixMonths} />
        </div>
      </div>
    </section>
  );
}