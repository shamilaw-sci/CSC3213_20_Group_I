"use client";

export default function AccountSettings() {

  return (
    <div>

      <h2 className="text-2xl font-bold text-black mb-4">
        Account Settings
      </h2>

      <p className="text-gray-600 mb-6">
        Manage your account information.
      </p>

      <div className="space-y-5">

        <div>
          <label className="block text-black font-semibold mb-2">
            Username
          </label>

          <input
            value="hanarafai0714"
            readOnly
            className="w-full border border-black rounded-lg p-3 text-black"
          />
        </div>


        <div>
          <label className="block text-black font-semibold mb-2">
            Email
          </label>

          <input
            value="hanarafai0714@gmail.com"
            readOnly
            className="w-full border border-black rounded-lg p-3 text-black"
          />
        </div>


        <div>
          <label className="block text-black font-semibold mb-2">
            Password
          </label>

          <input
            value="********"
            readOnly
            className="w-full border border-black rounded-lg p-3 text-black"
          />
        </div>

      </div>


      <button
        className="mt-6 bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700"
      >
        Update Account
      </button>

    </div>
  );
}