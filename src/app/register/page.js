"use client";

import { useState } from "react";
import Header from "@/components/Header";
import PasswordInput from "@/components/PasswordInput";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    // Check empty fields
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    // Check password
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Get all existing users
const existingUsers = JSON.parse(
  localStorage.getItem("registeredUsers") || "[]"
);


const email = formData.email.trim().toLowerCase();


// Check if email already exists
const userExists = existingUsers.some(
  (user) => user.email === email
);


if (userExists) {
  setError("An account with this email already exists.");
  return;
}


// Create new user
const newUser = {
  fullName: formData.fullName.trim(),
  email: email,
  password: formData.password,
};


// Add new user to array
const updatedUsers = [
  ...existingUsers,
  newUser
];


// Save all users
localStorage.setItem(
  "registeredUsers",
  JSON.stringify(updatedUsers)
);


// Login this user
localStorage.setItem(
  "loggedInUser",
  JSON.stringify({
    fullName: newUser.fullName,
    email: newUser.email,
  })
);
    // Automatically log the user in after registration
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        fullName: newUser.fullName,
        email: newUser.email,
      })
    );

    // Go to dashboard
    router.push("/dashboard");
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">

          <h1 className="text-3xl font-bold text-center mb-8 text-black">
            Create Account
          </h1>

          <form onSubmit={handleRegister}>

            {/* Full Name */}
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
              className="w-full border rounded-lg p-3 mb-4 text-black placeholder:text-gray-400"
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full border rounded-lg p-3 mb-4 text-black placeholder:text-gray-400"
            />

            {/* Password */}
            <PasswordInput
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full border rounded-lg p-3 mb-4 text-black placeholder:text-gray-400"
            />

            {/* Confirm Password */}
            <PasswordInput
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full border rounded-lg p-3 mb-4 text-black placeholder:text-gray-400"
            />

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">
                {error}
              </p>
            )}

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 transition"
            >
              Create Account
            </button>

          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?
          </p>

          <Link
            href="/login"
            className="block text-center text-violet-600 hover:underline mt-2"
          >
            Sign In
          </Link>

        </div>

      </main>
    </>
  );
}
