"use client";
import { dailyRedirection } from "../../data/statistics";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


export default function RedirectionChart() {

  const getChartData = () => {
    return dailyRedirection;
  };

  const getDataKey = () => {
    return "label";
  };

  return (
    <div className="bg-gray-100 rounded-xl shadow p-6">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          Redirections
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={getChartData()}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey={getDataKey()} />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="count"
            stroke="#16b34a"
            strokeWidth={3}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}