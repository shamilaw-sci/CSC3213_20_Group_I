/** WBS-2.2 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Profile tab navigation. */
"use client";

import Link from "next/link";
import { History, User, Ruler, Settings } from "lucide-react";
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
          <Link
            key={tab.id}
            href={`/profile?tab=${tab.id}`}
            onClick={() => changeTab(tab.id)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
              ${
                active
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
          >
            {tab.icon}
            {tab.label}
          </Link>
        );
      })}
      <Link
        href="/profile/try-on-history"
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <History size={18} />
        Try-On History
      </Link>
    </div>
  );
}
