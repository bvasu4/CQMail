// Updated settings page with full content for all tabs
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { FaPalette } from "react-icons/fa";
import { FaShieldAlt } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";

const iconProps = { size: 18, color: '#2563eb' };

const tabs = [
  { name: "Account", icon: <span className="inline mr-2 align-middle"><FaUser {...iconProps} /></span> },
  { name: "Password", icon: <span className="inline mr-2 align-middle"><FaLock {...iconProps} /></span> },
  { name: "Notifications", icon: <span className="inline mr-2 align-middle"><FaBell {...iconProps} /></span> },
  { name: "Appearance", icon: <span className="inline mr-2 align-middle"><FaPalette {...iconProps} /></span> },
  { name: "Security", icon: <span className="inline mr-2 align-middle"><FaShieldAlt {...iconProps} /></span> },
  { name: "Logout", icon: <span className="inline mr-2 align-middle"><FaSignOutAlt {...iconProps} /></span> }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].name);
  const [name, setName] = useState("Venkatesh Rao");
  const [displayName, setDisplayName] = useState("Venkatesh");
  const [email, setEmail] = useState("user@example.com");
  const [phone, setPhone] = useState("+91 99999 99999");
  const [profilePublic, setProfilePublic] = useState(true);
  const [contactPublic, setContactPublic] = useState(true);
  const [avatar, setAvatar] = useState("https://randomuser.me/api/portraits/men/75.jpg");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");

  // Appearance states
  const [theme, setTheme] = useState("Light");
  const [accent, setAccent] = useState("#2563eb"); // blue-600
  const accentColors = [
    "#2563eb", // blue
    "#f59e42", // orange
    "#22c55e", // green
    "#ef4444", // red
    "#a21caf", // purple
    "#eab308", // yellow
    "#0ea5e9"  // sky
  ];

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    let score = 0;
    const feedback = [];
    if (password.length >= 8) score++;
    else feedback.push("At least 8 characters");
    if (/[A-Z]/.test(password)) score++;
    else feedback.push("One uppercase letter");
    if (/[0-9]/.test(password)) score++;
    else feedback.push("One number");
    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push("One special character");
    setPasswordStrength(score);
    setPasswordFeedback(feedback.length ? `Missing: ${feedback.join(", ")}` : "Strong password!");
  };

  const handlePasswordUpdate = () => {
    setPasswordError("");
    setSuccessMessage("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("Password must contain at least one number.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setPasswordError("Password must contain at least one special character.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    // Simulate success
    setSuccessMessage("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordStrength(0);
    setPasswordFeedback("");
  };

  // Avatar upload handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Apply theme and accent globally
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme.toLowerCase());
    document.documentElement.style.setProperty("--accent", accent);
  }, [theme, accent]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Account":
        return (
          <>
            <h1 className="text-3xl font-bold text-blue-800 mb-1">Account Settings</h1>
            <p className="text-sm text-blue-500 mb-6">Update your CQMail account details and profile.</p>
            <div className="mb-6 flex items-center gap-8">
              <div className="relative">
                <Image src={avatar} alt="avatar" width={90} height={90} className="rounded-full border-4 border-blue-300" />
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer shadow-md">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <span className="text-xs">Upload</span>
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-blue-700">{displayName}</span>
                <span className="text-blue-500 text-xs">{email}</span>
                <button className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 mt-2">Remove Avatar</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div><label className="block text-sm font-medium text-blue-600 mb-1">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-blue-200 p-3 rounded-lg focus:outline-blue-400" /></div>
              <div><label className="block text-sm font-medium text-blue-600 mb-1">Display Name</label><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full border border-blue-200 p-3 rounded-lg focus:outline-blue-400" /></div>
              <div><label className="block text-sm font-medium text-blue-600 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-blue-200 p-3 rounded-lg focus:outline-blue-400" /></div>
              <div><label className="block text-sm font-medium text-blue-600 mb-1">Phone</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-blue-200 p-3 rounded-lg focus:outline-blue-400" /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div>
                <h3 className="text-md font-semibold text-blue-700 mb-2">Profile Visibility</h3>
                <div className="flex gap-5 text-blue-600">
                  <label className="flex items-center gap-2"><input type="radio" checked={profilePublic} onChange={() => setProfilePublic(true)} />Public</label>
                  <label className="flex items-center gap-2"><input type="radio" checked={!profilePublic} onChange={() => setProfilePublic(false)} />Private</label>
                </div>
              </div>
              <div>
                <h3 className="text-md font-semibold text-blue-700 mb-2">Contact Info Visibility</h3>
                <div className="flex gap-5 text-blue-600">
                  <label className="flex items-center gap-2"><input type="radio" checked={contactPublic} onChange={() => setContactPublic(true)} />Public</label>
                  <label className="flex items-center gap-2"><input type="radio" checked={!contactPublic} onChange={() => setContactPublic(false)} />Private</label>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Save Changes</button>
              <button className="px-5 py-3 text-red-600 border border-red-300 font-semibold rounded-md hover:bg-red-50">Remove Account</button>
            </div>
          </>
        );
      case "Password":
        return (
          <div className="relative bg-white rounded-xl shadow-md p-8">
            <div className="absolute top-0 right-0 mt-4 mr-4">
              <Image src={avatar} alt="avatar" width={60} height={60} className="rounded-full border-2 border-blue-300" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Change Your Password</h2>
            <p className="text-sm text-blue-500 mb-2">Make sure your new password is strong and secure.</p>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border p-3 rounded-lg focus:outline-blue-500"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                checkPasswordStrength(e.target.value);
              }}
              className="w-full border p-3 rounded-lg focus:outline-blue-500 mt-3"
            />
            <div className="w-full h-2 bg-gray-200 rounded-full mb-1 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  passwordStrength === 1
                    ? "bg-red-400 w-1/4"
                    : passwordStrength === 2
                    ? "bg-yellow-400 w-2/4"
                    : passwordStrength === 3
                    ? "bg-blue-400 w-3/4"
                    : passwordStrength === 4
                    ? "bg-green-500 w-full"
                    : "bg-gray-200 w-0"
                }`}
              ></div>
            </div>
            <p className={`text-xs ${passwordStrength === 4 ? "text-green-600" : "text-red-500"}`}>{passwordFeedback}</p>
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-3 rounded-lg focus:outline-blue-500 mt-3"
            />
            {passwordError && <p className="text-red-600 text-sm font-medium mt-2">{passwordError}</p>}
            {successMessage && <p className="text-green-600 text-sm font-medium mt-2">{successMessage}</p>}
            <button
              onClick={handlePasswordUpdate}
              className="mt-4 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
            >
              Update Password
            </button>
          </div>
        );
      case "Notifications":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Email & App Notifications</h2>
            <div className="bg-white rounded-xl shadow p-6">
              <label className="flex items-center gap-3 mb-3">
                <input type="checkbox" defaultChecked /> Receive notifications for new emails
              </label>
              <label className="flex items-center gap-3 mb-3">
                <input type="checkbox" defaultChecked /> Receive marketing updates
              </label>
              <label className="flex items-center gap-3 mb-3">
                <input type="checkbox" /> Weekly activity reports
              </label>
              <label className="flex items-center gap-3 mb-3">
                <input type="checkbox" /> Push notifications to mobile
              </label>
              <label className="flex items-center gap-3 mb-3">
                <input type="checkbox" /> Important security alerts
              </label>
              <button className="mt-4 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Notification Settings</button>
            </div>
          </div>
        );
      case "Appearance":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center"><FaPalette className="mr-2" />Theme & Appearance</h2>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex flex-col gap-4 w-full md:w-1/2">
                <label className="font-semibold text-blue-700">Theme</label>
                <select
                  className="border p-3 rounded-md"
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                >
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Blue</option>
                  <option>System Default</option>
                </select>
                <label className="font-semibold text-blue-700 mt-2">Accent Color</label>
                <div className="flex gap-3 mt-1">
                  {accentColors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${accent === color ? "border-4 border-blue-700" : "border-gray-300"}`}
                      style={{ background: color }}
                      onClick={() => setAccent(color)}
                      aria-label={`Select accent color ${color}`}
                    />
                  ))}
                </div>
                <label className="font-semibold text-blue-700 mt-4">Font Size</label>
                <input type="range" min="12" max="24" defaultValue="16" className="w-full accent-[var(--accent)]" />
                <label className="font-semibold text-blue-700 mt-4">Preview</label>
                <div className="border rounded-lg p-4" style={{ background: "var(--accent, #2563eb)", color: "#fff" }}>
                  This is a preview of your selected theme and accent color.
                </div>
              </div>
              <div className="w-full md:w-1/2 flex flex-col items-center">
                <Image src={avatar} alt="avatar" width={70} height={70} className="rounded-full border-2 border-blue-300 mb-2" />
                <span className="text-blue-700 font-semibold">{displayName}</span>
              </div>
            </div>
            <div className="text-blue-500 text-xs mt-2">* Appearance settings apply to your entire mailbox instantly.</div>
          </div>
        );
      case "Security":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Security Settings</h2>
            <div className="bg-white rounded-xl shadow p-6">
              <button className="text-blue-600 underline mb-3">Enable 2FA (Two-Factor Authentication)</button>
              <button className="text-blue-600 underline mb-3">View Login Activity</button>
              <button className="text-blue-600 underline mb-3">Manage Trusted Devices</button>
              <button className="text-blue-600 underline">Change Security Questions</button>
            </div>
          </div>
        );
      case "Logout":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <Image src={avatar} alt="avatar" width={80} height={80} className="rounded-full border-2 border-blue-300 mb-2" />
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Ready to leave?</h2>
            <p className="text-blue-600 text-center">Click below to securely log out of your CQMail account.</p>
            <button
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md text-lg font-semibold"
              onClick={() => {
                // Simulate logout (replace with real logic as needed)
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        );
      default:
        return <div className="text-blue-600 text-lg font-semibold">Settings not available.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-4">
        <aside className="bg-blue-100 p-6 space-y-4 text-blue-900 font-medium">
          <h2 className="text-xl font-bold text-blue-700">CQMail Settings</h2>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`w-full text-left py-2 px-3 rounded-md flex items-center gap-2 transition-colors duration-200 ${activeTab === tab.name ? "bg-blue-600 text-white" : "hover:bg-blue-200"}`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </aside>
        <main className="col-span-3 p-10">{renderTabContent()}</main>
      </div>
    </div>
  );
}