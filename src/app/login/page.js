"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");

  const [loggedInUser, setLoggedInUser] = useState(null);

  // ==========================================
  // CHECK IF USER IS CURRENTLY LOGGED IN
  // ==========================================
  useEffect(() => {
    const currentUser = localStorage.getItem("loggedInUser");

    if (currentUser) {
      setLoggedInUser(JSON.parse(currentUser));
    }

    setCheckingAuth(false);
  }, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });

    setLoginError("");
  };

  // ==========================================
  // LOGIN
  // ==========================================
  const handleLogin = (e) => {
    e.preventDefault();

    setLoginError("");

    if (!loginData.email.trim() || !loginData.password) {
      setLoginError("Please enter both email and password.");
      return;
    }

  const users = JSON.parse(
  localStorage.getItem("registeredUsers") || "[]"
);


const registeredUser = users.find(
  (user) => user.email === typedEmail
);


if (!registeredUser) {
  setLoginError("No account found with that email.");
  return;
}


if (registeredUser.password !== loginData.password) {
  setLoginError("Incorrect password.");
  return;
}

    // Create current login session
    const currentUser = {
      fullName: registeredUser.fullName,
      email: registeredUser.email,
    };

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify(currentUser)
    );

    // Go to dashboard
    router.push("/dashboard");
  };

  // ==========================================
  // SIGN OUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");

    setLoggedInUser(null);

    setLoginData({
      email: "",
      password: "",
    });
  };

  if (checkingAuth) {
    return null;
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">

          {/* ==================================
              ALREADY LOGGED IN
          ================================== */}

          {loggedInUser ? (
            <div>

              <h1 className="text-3xl font-bold text-center mb-6 text-black">
                Welcome Back!
              </h1>

              <div className="bg-gray-50 rounded-lg p-5 mb-6">

                <p className="text-lg font-semibold text-black">
                  {loggedInUser.fullName}
                </p>

                <p className="text-gray-600 mt-1">
                  {loggedInUser.email}
                </p>

              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 transition mb-3"
              >
                Continue to Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="w-full border border-gray-300 text-black py-3 rounded-lg hover:bg-gray-100 transition"
              >
                Sign Out
              </button>

            </div>
          ) : (

            /* ==================================
               LOGIN FORM
            ================================== */

            <div>

              <h1 className="text-3xl font-bold text-center mb-8 text-black">
                Sign In
              </h1>

              <form onSubmit={handleLogin}>

                {/* Email */}

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  autoComplete="email"
                  className="w-full border rounded-lg p-3 mb-4 text-black placeholder:text-gray-400"
                />

                {/* Password */}

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  autoComplete="current-password"
                  className="w-full border rounded-lg p-3 mb-4 text-black placeholder:text-gray-400"
                />

                {/* Error */}

                {loginError && (
                  <p className="text-red-500 text-sm mb-4 text-center">
                    {loginError}
                  </p>
                )}

                {/* Login */}

                <button
                  type="submit"
                  className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 transition"
                >
                  Login
                </button>

              </form>

              <p className="text-center mt-6 text-gray-600">
                Don't have an account?
              </p>

              <Link
                href="/register"
                className="block text-center text-violet-600 hover:underline mt-2"
              >
                Create an Account
              </Link>

            </div>
          )}

        </div>

      </main>
    </>
  );
}