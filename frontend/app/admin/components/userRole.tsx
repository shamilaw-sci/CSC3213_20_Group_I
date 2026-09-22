"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { roleData as importedRoleData } from "../../data/statistics";

export default function UserRole({ data }: { data?: { name: string; value: number }[] }) {
	const defaultData = data ?? importedRoleData ?? [
		{ name: "Registered", value: 1240 },
		{ name: "Guest", value: 360 },
	];

	const COLORS = ["#4f46e5", "#06b6d4"];

	return (
		<div className="bg-card rounded-xl p-6 shadow-sm">
			<h3 className="text-lg font-semibold mb-4">User Types</h3>
			<div style={{ width: "100%", height: 260 }}>
				<ResponsiveContainer>
					<PieChart>
						<Pie
							data={defaultData}
							dataKey="value"
							nameKey="name"
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={90}
							paddingAngle={3}
							label
						>
							{defaultData.map((_, index: number) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
							<Tooltip formatter={(value: unknown) => (value == null ? "" : String(value))} />
						<Legend verticalAlign="bottom" height={36} />
					</PieChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
