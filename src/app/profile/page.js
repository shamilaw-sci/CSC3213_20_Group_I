"use client";

import { useState } from "react";
import Header from "@/components/Header";

import DigitalTwin from "@/components/profile/DigitalTwin";
import Measurements from "@/components/profile/Measurements";
import AccountSettings from "@/components/profile/AccountSettings";


export default function ProfilePage() {

  const [activeTab, setActiveTab] = useState("digitalTwin");


  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-100 p-8">

        {/* Title */}
        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-black">
            Profile & Settings
          </h1>

          <p className="text-gray-600 mt-2">
            Manage your Digital Twin and account settings
          </p>

        </div>


        {/* Tabs */}
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md">

          <div className="flex border-b">


            <button
              onClick={() => setActiveTab("digitalTwin")}
              className={`flex-1 py-4 font-semibold ${
                activeTab==="digitalTwin"
                ? "text-violet-600 border-b-2 border-violet-600"
                : "text-gray-600"
              }`}
            >
              Digital Twin
            </button>


            <button
              onClick={() => setActiveTab("measurements")}
              className={`flex-1 py-4 font-semibold ${
                activeTab==="measurements"
                ? "text-violet-600 border-b-2 border-violet-600"
                : "text-gray-600"
              }`}
            >
              Measurements
            </button>


            <button
              onClick={() => setActiveTab("account")}
              className={`flex-1 py-4 font-semibold ${
                activeTab==="account"
                ? "text-violet-600 border-b-2 border-violet-600"
                : "text-gray-600"
              }`}
            >
              Account
            </button>


          </div>



          <div className="p-8">


            {activeTab==="digitalTwin" && <DigitalTwin />}


            {activeTab==="measurements" && <Measurements />}


            {activeTab==="account" && <AccountSettings />}


          </div>


        </div>


      </main>
    </>
  );
}