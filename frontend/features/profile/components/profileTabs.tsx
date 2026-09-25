/** WBS-2.2 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Profile tab navigation. */
"use client";

import { User, Ruler, Settings } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import type { ProfileTab } from "../types/profile";

const tabs: {
  id: ProfileTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "digitalTwin",
    label: "Digital Twin",
    icon: <User size={18} />,
  },
  {
    id: "measurements",
    label: "Measurements",
    icon: <Ruler size={18} />,
  },
  {
    id: "account",
    label: "Account",
    icon: <Settings size={18} />,
  },
];

export default function ProfileTabs() {
  const { profile, changeTab } = useProfile();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 flex flex-col md:flex-row gap-2">
      {tabs.map((tab) => {
        const active = profile.activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => changeTab(tab.id)}
            className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl font-medium transition-all duration-200
              ${
                active
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
