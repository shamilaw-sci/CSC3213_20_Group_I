"use client";
import { dailyData,weeklyData,monthlyData } from "../../data/statistics";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


export default function UserGrowthChart() {
  const [timeFilter, setTimeFilter] = useState("months");

  const getChartData = () => {
    switch (timeFilter) {
      case "daily":
        return dailyData;
      case "weeks":
        return weeklyData;
      case "months":
        return monthlyData;
      default:
        return monthlyData;
    }
  };

  const getDataKey = () => {
    return "label";
  };

  return (
    <div className="bg-gray-100 rounded-xl shadow p-6">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          User Growth
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeFilter("daily")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeFilter === "daily"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Date
          </button>
          <button
            onClick={() => setTimeFilter("weeks")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeFilter === "weeks"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Weeks
          </button>
          <button
            onClick={() => setTimeFilter("months")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeFilter === "months"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Months
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={getChartData()}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey={getDataKey()} />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="users"
            stroke="#9989d8"
            strokeWidth={3}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}