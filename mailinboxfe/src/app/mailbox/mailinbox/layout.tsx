/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react'; // Added useCallback
import {
  Inbox,
  Star,
  Send,
  Trash2,
  PenSquare,
  Cog,
  MailPlus,
  Menu,
  ChevronLeft,
  Search,
  Filter,
  Bell,
  Sun,
  X,
  LogOut,
  LogIn,
  UserPlus,
  Mail,
  User,
  Settings,
  BarChart2,
  Edit3,
  Moon,
} from 'lucide-react';
import { SearchProvider, useSearch } from './SearchContext';
import Image from 'next/image';

const navItems = [
  { label: 'Inbox', icon: Inbox, href: '/mailbox/mailinbox', count: 5 },
  { label: 'Starred', icon: Star, href: '/mailbox/mailinbox/starred', count: 2 },
  { label: 'Sent', icon: Send, href: '/mailbox/mailinbox/sent', count: 12 },
  { label: 'Drafts', icon: PenSquare, href: '/mailbox/mailinbox/drafts', count: 1 },
  { label: 'Trash', icon: Trash2, href: '/mailbox/mailinbox/trash' },
  { label: 'Settings', icon: Cog, href: '/mailbox/mailinbox/settings' },
];

// Moved decodeJwt function outside the component to prevent re-creation on every render
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
};

function MailLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { searchTerm, setSearchTerm, showSidebar, setShowSidebar } = useSearch();

  const [showFilter, setShowFilter] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isNotified, setIsNotified] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");
  const [loading, setLoading] = useState(true); // Your existing line
  const [error, setError] = useState<string | null>(null); // Your existing line

  // Toggle sidebar collapse
  const toggleCollapse = useCallback(() => { // Wrapped in useCallback for stability
    setCollapsed(prev => !prev);
  }, []); // No dependencies, won't change

  const closeSidebar = useCallback(() => { // Wrapped in useCallback for stability
    setShowSidebar(false);
  }, [setShowSidebar]); // No dependencies, won't change

  // FIX: Moved token decoding and user info setting into a useEffect
  // This runs only once on component mount.
  useEffect(() => {
    setLoading(true); // Start loading state for user info
    let token = localStorage.getItem('cqtoken');
    if (!token) {
      token = localStorage.getItem('cqtoken'); // Try fallback key
    }
    if (!token) {
      setError("Authentication token not found. Please log in.");
      setUserName("Guest User"); // Reset name/email if no token
      setUserEmail("guest@example.com");
    } else {
      const decodedToken = decodeJwt(token);
      if (decodedToken) {
        setUserName(decodedToken.fullname || decodedToken.fullName || decodedToken.name || decodedToken.email || "User");
        setUserEmail(decodedToken.email || "N/A");
        setError(null); // Clear any previous errors
      } else {
        setError("Invalid authentication token. Please log in again.");
        localStorage.removeItem('accessToken');
        localStorage.removeItem('cqtoken');
        setUserName("Guest User"); // Reset name/email
        setUserEmail("guest@example.com");
      }
    }
    setLoading(false); // End loading state for user info
  }, []); // Empty dependency array: runs only once on mount

  // Existing useEffect for dark mode
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  const toggleDarkMode = useCallback(() => { // Wrapped in useCallback for stability
    setIsDarkMode(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newTheme);
      return newTheme;
    });
  }, []);

  const applyFilter = useCallback(() => { // Wrapped in useCallback for stability
    // Implement filter logic here
    setShowFilter(false);
  }, []); // Add dependencies if fromDate/toDate are used in logic that needs to be current

  return (
    <div className="flex min-h-screen bg-white text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside
        className={`h-screen ${collapsed ? 'w-20' : 'w-72'} bg-blue-100 dark:bg-blue-900 fixed top-0 left-0 right-0 z-40 flex flex-col justify-between transition-all duration-300`}
      >
        <div className="p-4">
          <button
            className="mb-4 text-blue-600 hover:text-blue-800 ml-2 flex items-center gap-1 text-xs"
            onClick={toggleCollapse} // Use the memoized callback
          >
            {collapsed ? <Menu className="w-10 h-10 pr-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>{collapsed ? 'Unpin' : 'Pin'}</span>}
          </button>

          {!collapsed && (
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="https://camelq.in/wp-content/uploads/2024/12/Untitled-300-x-300-px-150-x-150-px.png"
                alt="CQMail Logo"
                width={36}
                height={36}
                className="rounded"
                priority
              />
              <h1 className="text-2xl font-bold text-blue-600">CQMail</h1>
            </div>
          )}

          <Link
            href="/mailbox/mailinbox/compose"
            className={`${collapsed ? 'w-10 h-10' : 'w-full'} flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition mb-6`}
          >
            <MailPlus className="w-5 h-5" />
            {!collapsed && 'Compose'}
          </Link>

          <nav className="space-y-2">
            {navItems.map(({ label, icon: Icon, href, count }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 transition text-sm ${
                    isActive
                      ? 'bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-white font-semibold'
                      : 'text-gray-800 dark:text-white hover:bg-blue-200 dark:hover:bg-blue-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                    {!collapsed && <span>{label}</span>}
                  </div>
                  {!collapsed && typeof count === 'number' && count > 0 && (
                    <span className="bg-blue-300 text-blue-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {!collapsed && (
            <>
              <div className="mt-6 px-2">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Storage Used</p>
                <div className="w-full h-2 bg-blue-200 dark:bg-blue-700 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-blue-500" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">6.5 GB of 10 GB used</p>
              </div>

              <div className="mt-6 px-2">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Mini Calendar</p>
                <div className="text-center text-xs bg-blue-50 dark:bg-blue-700 p-3 rounded-xl border dark:border-blue-600">
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-6" />
      </aside>

      {/* Main Area */}
      <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-72'} ${showSidebar ? 'max-w-[58rem]' : 'max-w-[70rem]'} transition-all duration-300 mx-auto`} 
        style={{
          maxWidth: showSidebar ? '58rem' : '70rem',
          transition: 'max-width 0.3s',
          overflowX: 'hidden', // Hide horizontal scroll
          overflowY: 'hidden', // Hide vertical scroll
        }}
      >
        {/* Top Navbar */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-blue-900 flex items-center justify-between px-6 z-30 ml-[inherit] shadow-none">
          <div className="flex items-center gap-2 text-xl font-semibold text-blue-600 dark:text-blue-400">
            <Inbox className="w-6 h-6" />
            Inbox
          </div>
          <div className="relative w-full max-w-2xl mx-auto">
            {/* 🔍 Search bar */}
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search mail"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-blue-950 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              </div>

              {/* 🧭 Filter Icon Button */}
              <button
                className="p-2 rounded-lg bg-gray-200 dark:bg-blue-800 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-blue-700"
                onClick={() => setShowFilter((prev) => !prev)}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* 🪟 Filter Popover (Date Range + Search) */}
            {showFilter && (
              <div className="absolute top-14 right-0 bg-white dark:bg-blue-950 border border-blue-400 shadow-lg rounded-xl p-4 z-50 w-80">
                <h4 className="text-sm font-semibold text-blue-700 dark:text-white mb-3">
                  Filter Options
                </h4>

                {/* 🔍 Search inside popover */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md bg-white dark:bg-blue-900 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md bg-white dark:bg-blue-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md bg-white dark:bg-blue-900 text-sm"
                    />
                  </div>
                  <button
                    onClick={applyFilter} // Use the memoized callback
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-semibold"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode}> {/* Use the memoized callback */}
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400 hover:text-yellow-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-800 dark:text-white hover:text-gray-600" />
              )}
            </button>
            <Bell className="w-5 h-5 text-blue-600 hover:text-blue-800 cursor-pointer" />
            <div>
              <div className="relative flex items-center gap-2">
                {/* 👤 Avatar */}
                <div
                  className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm cursor-pointer"
                  onClick={() => setShowSidebar(true)}
                >
                  CV
                </div>

                {/* 🔲 Overlay */}
                {showSidebar && (
                  <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                    onClick={closeSidebar} // Use the memoized callback
                  />
                )}

                {/* 👉 Right Sidebar */}
                <div
                  className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-blue-950 shadow-lg z-50 transform transition-transform duration-300 ${
                    showSidebar ? "translate-x-0" : "translate-x-full"
                  }`}
                >
                  {/* ❌ Header */}
                  <div className="flex justify-between items-center px-4 py-3 border-b border-blue-200 dark:border-blue-800">
                    <h2 className="text-lg font-semibold text-blue-700 dark:text-white capitalize">
                      {activeTab}
                    </h2>
                    <button
                      onClick={closeSidebar} // Use the memoized callback
                      className="text-gray-500 cursor-pointer hover:text-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 🧭 Tabs */}
                  <div className="flex justify-around border-b border-blue-200 dark:border-blue-800">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`flex items-center gap-1 px-4 py-2 text-sm font-medium ${
                        activeTab === "profile"
                          ? "text-blue-600 dark:text-white border-b-2 border-blue-600"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <User size={16} /> Profile
                    </button>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className={`flex items-center gap-1 px-4 py-2 text-sm font-medium ${
                        activeTab === "settings"
                          ? "text-blue-600 dark:text-white border-b-2 border-blue-600"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <Settings size={16} /> Settings
                    </button>
                    <button
                      onClick={() => setActiveTab("activity")}
                      className={`flex items-center gap-1 px-4 py-2 text-sm font-medium ${
                        activeTab === "activity"
                          ? "text-blue-600 dark:text-white border-b-2 border-blue-600"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <BarChart2 size={16} /> Activity
                    </button>
                  </div>

                  {/* 📄 Content */}
                  <div className="p-6 text-sm text-gray-700 dark:text-gray-300 space-y-5">
                    {activeTab === "profile" && (
                      <>
                        <div className="flex justify-center relative">
                          <img
                            src="https://ui-avatars.com/api/?name=Challa+Venkatesh&background=5C86FF&color=fff&rounded=true"
                            alt="Profile"
                            className="w-20 h-20 rounded-full shadow-md"
                          />
                          {/* ✏️ Edit icon just below the avatar */}
                          <div className="absolute -bottom-3 flex justify-center w-full">
                            <button className="bg-blue-100 text-blue-700 rounded-full p-1 shadow hover:bg-blue-200 transition">
                              <Edit3 size={16} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold">Name</p>
                          <p>{userName}</p> {/* Display decoded user name */}
                        </div>
                        <div>
                          <p className="font-semibold">Email</p>
                          <p>{userEmail}</p> {/* Display decoded user email */}
                        </div>
                        <div>
                          <p className="font-semibold">Role</p>
                          <p>Associate Software Engineer</p>
                        </div>
                        <div>
                          <p className="font-semibold">Location</p>
                          <p>Hyderabad, Telangana</p>
                        </div>
                      </>
                    )}

                    {activeTab === "settings" && (
                      <div>
                        <div className="space-y-6 p-6 text-sm text-gray-700 dark:text-gray-300">

                          {/* 🌙 Theme Toggle */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">Dark Mode</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Enable dark theme across the app.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isDarkMode}
                                onChange={toggleDarkMode} // Use the memoized callback
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-blue-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                          </div>

                          {/* 📩 Notifications */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">Email Notifications</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Receive important alerts in your inbox.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isNotified}
                                onChange={() => setIsNotified(!isNotified)}
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-blue-700 peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                          </div>

                          {/* 🌐 Language Selector */}
                          <div>
                            <label className="block font-semibold mb-1">Language Preference</label>
                            <select
                              value={selectedLanguage}
                              onChange={(e) => setSelectedLanguage(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md text-sm bg-white dark:bg-blue-900 text-gray-800 dark:text-white"
                            >
                              <option value="en">English</option>
                              <option value="hi">Hindi</option>
                              <option value="te">Telugu</option>
                              <option value="ta">Tamil</option>
                              <option value="kn">Kannada</option>
                            </select>
                          </div>

                          {/* 🔐 Password Change */}
                          <div>
                            <label className="block font-semibold mb-1">Change Password</label>
                            <input
                              type="password"
                              placeholder="New Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md text-sm bg-white dark:bg-blue-900 text-gray-800 dark:text-white"
                            />
                            <input
                              type="password"
                              placeholder="Confirm Password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md text-sm bg-white dark:bg-blue-900 text-gray-800 dark:text-white"
                            />
                            {message && (
                              <p className={`text-sm font-medium ${message.includes("success") ? "text-green-600" : "text-red-500"}`}>
                                {message}
                              </p>
                            )}
                            <button
                              onClick={() => {
                                if (password.length < 6) {
                                  setMessage("Password must be at least 6 characters.");
                                } else if (password !== confirmPassword) {
                                  setMessage("Passwords do not match.");
                                } else {
                                  setMessage("✅ Password updated successfully!");
                                  setPassword("");
                                  setConfirmPassword("");
                                }
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-semibold mt-2"
                            >
                              Update Password
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "activity" && (
                      <div>
                        <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto space-y-4 text-sm text-gray-700 dark:text-gray-300">

                          <h3 className="text-lg font-semibold text-blue-700 dark:text-white mb-3">Recent Activity</h3>

                          <ul className="space-y-3">

                            <li className="flex items-start gap-3">
                              <LogIn className="text-green-500 w-5 h-5 mt-1" />
                              <div>
                                <p className="font-medium">Logged in</p>
                                <p className="text-xs text-gray-500">Today at 10:15 AM</p>
                              </div>
                            </li>

                            <li className="flex items-start gap-3">
                              <Edit3 className="text-yellow-500 w-5 h-5 mt-1" />
                              <div>
                                <p className="font-medium">Updated profile info</p>
                                <p className="text-xs text-gray-500">Yesterday at 4:37 PM</p>
                              </div>
                            </li>

                            <li className="flex items-start gap-3">
                              <Mail className="text-blue-500 w-5 h-5 mt-1" />
                              <div>
                                <p className="font-medium">Sent an email</p>
                                <p className="text-xs text-gray-500">3 days ago at 2:23 PM</p>
                              </div>
                            </li>

                            <li className="flex items-start gap-3">
                              <UserPlus className="text-purple-500 w-5 h-5 mt-1" />
                              <div>
                                <p className="font-medium">Added a new contact</p>
                                <p className="text-xs text-gray-500">Last week at 11:02 AM</p>
                              </div>
                            </li>

                            <li className="flex items-start gap-3">
                              <LogOut className="text-red-500 w-5 h-5 mt-1" />
                              <div>
                                <p className="font-medium">Logged out</p>
                                <p className="text-xs text-gray-500">Last week at 6:55 PM</p>
                              </div>
                            </li>

                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 🔓 Logout - outlined at bottom */}
                  <div className="absolute bottom-4 left-0 w-full px-6">
                    <button 
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-red-500 text-red-500 hover:bg-red-50 text-sm font-medium transition"
                      onClick={() => {
                        localStorage.removeItem('cqtoken');
                        window.location.href = '/mailbox/login'; // Redirect to login page
                      }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="pt-20 px-6 w-full">{children}</main>
      </div>

      {/* Floating Compose */}
      <Link
        href="/mailbox/mailinbox/compose"
        title="Compose"
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center z-50" // Added tailwind classes for styling
      >
        <MailPlus className="w-6 h-6" />
      </Link>
    </div>
  );
}

export default function MailLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <MailLayoutContent>{children}</MailLayoutContent>
    </SearchProvider>
  );
}
