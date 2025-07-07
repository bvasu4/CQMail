/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState ,useEffect} from "react";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";


export default function ModernLoginSplit() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("cqtoken", data.access_token);
      alert("✅ Login successful!");
      window.location.href = "/mailbox/mailinbox"; // Change this route if needed
    } else {
      alert(`❌ ${data.message || "Login failed"}`);
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("❌ Something went wrong during login.");
  }
};
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("cqtoken");
    if (token) {
      router.push("/mailbox/mailinbox"); // 🔁 Redirect if already logged in
    }
  }, []);
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white font-serif">
      <div className="max-w-6xl w-full flex flex-col md:flex-row rounded-3xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* LEFT SIDE */}
        <div className="md:w-1/2 bg-blue-700 text-white flex flex-col justify-center items-center p-10 space-y-6">
          <img
            src="https://assets-v2.lottiefiles.com/a/23011526-3600-11f0-884f-afdbfc88ee7d/FJvi4XQ3dJ.gif"
            alt="Mail Graphic"
            className="w-56 h-56 object-contain"
          />
          <h2 className="text-3xl font-bold">Welcome to CQ Mail</h2>
          <p className="text-center text-sm max-w-md">
            Your all-in-one email platform to connect, organize, and manage your communication with elegance and speed.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="md:w-1/2 bg-white p-10 flex items-center justify-center">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-blue-700 flex items-center justify-center gap-2">
                <Mail className="w-6 h-6 text-blue-700" />
                Login to CQ Mail
              </h2>
              <p className="text-sm text-blue-600 mt-2">Enter your credentials below</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-blue-900"
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 text-blue-800">
                  <input type="checkbox" className="accent-blue-600" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => alert("Redirecting to plan purchase")}
                  className="text-blue-600 hover:underline"
                >
                  Buy Email Plan
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-lg font-bold"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
