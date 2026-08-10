"use client";
import Link from "next/link";
import {LayoutDashboard, Trash} from 'lucide-react';


// Main Admin Profile Function
export default function AdminProfile() {

  return (
    <div className="min-h-screen bg-pink-50 p-6">

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">
          Admin Profile
        </h1>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800"
        >
          <LayoutDashboard size={20}/> Admin Desk
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side */}
        <div className="space-y-6">
          {ProfileHeader()}
          {QuickActions()}
        </div>

        {/* Right Side */}
        <div className="lg:col-span-2 space-y-6">
          {PersonalInfo()}
          {ContactInfo()}
          {/* {AccountInfo()} 
          {SecurityCard()}
          {Preferences()}*/}
          {Permissions()}
          {ActivityTimeline()}
        </div>
      </div>
    </div>
  );
}

//Profile Header Component
function ProfileHeader(){

  return (

    <div className="bg-gray-50 rounded-xl shadow p-8 text-center">

      {/*Profile Picture*/}
      <img
        src="https://i.pravatar.cc/160"
        className="w-28 h-28 rounded-full mx-auto"
      />

      {/*Name*/}
      <h2 className="text-xl font-bold mt-4">
        John Smith
      </h2>

      {/*Username*/}
      <p className="text-gray-500">
        @johnsmith
      </p>

      {/*Role*/}
      <span className="inline-block mt-3 bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
        Administrator
      </span>

      <p className="mt-3">
        IT Department
      </p>


    </div>

  );

}



//Personal Information Component
function PersonalInfo(){

  return (

    <div className="bg-gray-50 p-6 rounded-xl shadow">

      <h2 className="text-xl font-semibold mb-4">
        Personal Information
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <p>Name: John Smith</p>
        <p>Username: johnsmith</p>
        <p>Employee ID: ADM001</p>
        <p>Designation: Administrator</p>
        <p>Department: IT</p>
        <p>Joined: January 2025</p>
      </div>

    </div>
  );
}

//Contact Information
function ContactInfo(){
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        Contact Information
      </h2>
      <p>Email: admin@example.com</p>
      <p>Phone: +94 77 1234567</p>
      <p>Address: Colombo, Sri Lanka</p>
    </div>
  );
}
{/* 
  // 4. Account Information
function AccountInfo(){
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        Account Information
      </h2>
      <p>User ID: 10001</p>
      <p>Role: Super Admin</p>
      <p>Status: Active</p>
      <p>Last Login: Today 9:30 AM</p>
    </div>
  );
}
 



// 5. Security Component
function SecurityCard(){
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        Security
      </h2>

      <button className="border p-3 rounded-lg w-full mb-3">
        Change Password
      </button>

      <button className="border p-3 rounded-lg w-full mb-3">
        Enable Two Factor Authentication
      </button>

      <button className="border p-3 rounded-lg w-full">
        Login History
      </button>
    </div>
  );
}
   */}


//Preferences Component
function Preferences(){
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        Preferences
      </h2>

      <p>Theme : Dark Mode</p>
      <p>Language : English</p>
      <p>Timezone : Asia/Colombo</p>
    </div>
  );
}

//Permissions Component
function Permissions(){
  const permissions=[
    "User Management",
    "Digital Twin Management",
    "Garment Management",
    "Reports",
    "Analytics",
    "Settings"
  ];
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow">
    <h2 className="text-xl font-semibold mb-4">
      Permissions
    </h2>
    <div className="flex flex-wrap gap-2">
    {
      permissions.map((permission)=>(
        <span
        key={permission}
        className="bg-green-100 text-green-700 px-3 py-1 rounded-full"
        >
          {permission}
        </span>
      ))
    }
    </div>
    </div>
  );
}


//Activity Timeline
function ActivityTimeline(){
return (
  <div className="bg-gray-50 p-6 rounded-xl shadow">
  <h2 className="text-xl font-semibold mb-4">
    Recent Activity
  </h2>
  <ul className="space-y-3">
    <li>
      ✔ Logged in today
    </li>
    <li>
      ✔ Updated profile
    </li>
    <li>
      ✔ Created new user
    </li>
  </ul>
  </div>
  );
}


//Quick Actions
function QuickActions(){
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow">
      <h2 className="font-semibold mb-4">
        Quick Actions
      </h2>

      <button className="w-full bg-blue-600 text-white p-3 rounded-lg mb-3">
        Edit Profile
      </button>

      <button className="w-full bg-gray-800 text-white p-3 rounded-lg">
        Logout
      </button>
    </div>
  );
}