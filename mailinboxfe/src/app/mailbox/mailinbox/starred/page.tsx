/* eslint-disable @next/next/no-img-element */
/* eslint-disable prefer-const */
"use client";

import { useState, useEffect } from "react";
import {
  Star,
  StarOff,
  Trash2,
  MailCheck,
  CheckSquare,
  Square,
  ArrowLeft,
  Reply,
  Upload,
  FileText,
  Folder,
  ReplyAll,
  Forward,
  ShieldAlert,
  ChevronDown,
  ArrowDownAZ,
  ArrowUpZA,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { useSearch } from "../SearchContext";
import TypewriterLoader from "../TypewriterLoader";
import useRouter from "../useRouter";

const initialEmails = [
  {
    id: 1,
    sender: "Google",
    subject: "Security alert",
    message: "We noticed a new sign-in from a new device. Please check...",
    time: "10:24 AM",
    starred: true,
    unread: true,
    type: "inbox",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png",
  },
  {
    id: 2,
    sender: "LinkedIn",
    subject: "You appeared in 6 searches",
    message: "Grow your network and discover new opportunities.",
    time: "09:15 AM",
    starred: false,
    unread: false,
    type: "inbox",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LinkedIn_Logo.svg/800px-LinkedIn_Logo.svg.png",
  },
  {
    id: 3,
    sender: "Facebook",
    subject: "New friend request",
    message: "John Doe wants to be friends with you.",
    time: "08:30 AM",
    starred: false,
    unread: true,
    type: "inbox",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/800px-Facebook_f_logo_%282019%29.svg.png",
  },
  {
    id: 4,
    sender: "Twitter",
    subject: "New follower",
    message: "You have a new follower!",
    time: "07:45 AM",
    starred: true,
    unread: false,
    type: "inbox",
    src: "https://cdn.prod.website-files.com/5d66bdc65e51a0d114d15891/64cebdd90aef8ef8c749e848_X-EverythingApp-Logo-Twitter.jpg",
  },
  {
    id: 5,
    sender: "Amazon",
    subject: "Your order has shipped",
    message: "Your order #123456 has shipped and is on its way!",
    time: "06:30 AM",
    starred: false,
    unread: true,
    type: "inbox",
    src: "https://w7.pngwing.com/pngs/141/900/png-transparent-amazon-com-amazon-echo-amazon-music-the-everything-store-jeff-bezos-and-the-age-of-amazon-kindle-fire-black-friday-miscellaneous-text-logo.png",
  },
  {
    id: 6,
    sender: "Netflix",
    subject: "New episode available",
    message: "Your favorite show has a new episode available to watch.",
    time: "05:15 AM",
    starred: false,
    unread: false,
    type: "inbox",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/800px-Netflix_2015_logo.svg.png",
  },
  {
    id: 7,
    sender: "Spotify",
    subject: "Your daily mix is ready",
    message: "Discover new music with your personalized daily mix.",
    time: "04:00 AM",
    starred: true,
    unread: true,
    type: "inbox",
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfVoqbXvQlq8MPVaqn3PorKrb1Ue6qvAWYBg&s",
  },
];

type Email = {
  id: number;
  sender: string;
  subject: string;
  message: string;
  time: string;
  starred: boolean;
  unread: boolean;
  type: string;
  src: string;
};

export default function StarredPage() {
  const { searchTerm } = useSearch();
  const [emailList, setEmailList] = useState<Email[]>(initialEmails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isFullView, setIsFullView] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tooltipOpenId, setTooltipOpenId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [loading, setLoading] = useState(false);
  const [blink, setBlink] = useState(false);

  const emailsPerPage = 10;

  // Only starred emails
  const filteredEmails = emailList.filter(
    (email) =>
      email.starred &&
      (email.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort filtered emails by time (latest to oldest or vice versa)
  const sortedEmails = [...filteredEmails].sort((a, b) => {
    const parseTime = (t: string) => {
      const [time, modifier] = t.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    return sortBy === "latest"
      ? parseTime(b.time) - parseTime(a.time)
      : parseTime(a.time) - parseTime(b.time);
  });

  const paginatedEmails = sortedEmails.slice(
    (page - 1) * emailsPerPage,
    page * emailsPerPage
  );

  const totalPages = Math.ceil(filteredEmails.length / emailsPerPage);

  const allSelected =
    paginatedEmails.length > 0 &&
    paginatedEmails.every((email) => selectedIds.includes(email.id));

  const toggleStar = (id: number) => {
    setEmailList((prev) =>
      prev.map((email) =>
        email.id === id ? { ...email, starred: !email.starred } : email
      )
    );
  };

  const toggleCheckbox = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedEmails.some((email) => email.id === id))
      );
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...paginatedEmails.filter((email) => !prev.includes(email.id)).map(
          (email) => email.id
        ),
      ]);
    }
  };

  const handleBulkDelete = () => {
    setEmailList((prev) =>
      prev.filter((email) => !selectedIds.includes(email.id))
    );
    setSelectedIds([]);
  };

  const handleMarkRead = () => {
    setEmailList((prev) =>
      prev.map((email) =>
        selectedIds.includes(email.id) ? { ...email, unread: false } : email
      )
    );
    setSelectedIds([]);
  };

  const handleReload = () => {
    setLoading(true);
    setTimeout(() => {
      setEmailList([...initialEmails]);
      setLoading(false);
    }, 5000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setEmailList([...initialEmails]);
      setBlink(true);
      setTimeout(() => setBlink(false), 300);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const router = useRouter();

  return (
    <div className="h-[calc(100vh-64px)] p-4 dark:bg-gray-900 font-sans transition-colors duration-300">
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col ${selectedEmail ? 'md:flex-row' : ''} overflow-hidden transition-all duration-300`}>
        {/* Email List (full width if no selection, split if selected) */}
        <div className={`${selectedEmail ? 'w-full md:w-1/2 border-r border-gray-200' : 'w-full'} overflow-y-auto bg-white`}>
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-2 sticky top-0 bg-white border-b border-blue-700 z-10">
            <div className="flex items-center gap-4 text-blue-700">
              <div className="relative flex items-center">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1"
                  aria-label="Select all"
                >
                  {allSelected ? (
                    <CheckSquare className="w-5 h-5 text-blue-700" />
                  ) : (
                    <Square className="w-5 h-5 text-blue-700" />
                  )}
                </button>
              </div>
              <button onClick={handleMarkRead}>
                <MailCheck className="w-5 h-5 text-blue-700" />
              </button>
              <button onClick={handleBulkDelete}>
                <Trash2 className="w-5 h-5 text-blue-700" />
              </button>
              <button onClick={handleReload}>
                <RotateCcw className="w-5 h-5 text-blue-700" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Sort by:</span>
              <button
                onClick={() => setSortBy(sortBy === "latest" ? "oldest" : "latest")}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title={sortBy === "latest" ? "Latest First" : "Oldest First"}
              >
                {sortBy === "latest" ? (
                  <ArrowDownAZ className="w-5 h-5 text-gray-700 dark:text-white" />
                ) : (
                  <ArrowUpZA className="w-5 h-5 text-gray-700 dark:text-white" />
                )}
              </button>
            </div>
          </div>

          {paginatedEmails.map((email) => (
            <div
              key={email.id}
              className={`group flex items-center gap-3 px-4 py-3 border-b border-gray-200 transition-colors duration-200 cursor-pointer 
                ${email.unread ? "font-semibold bg-gray-50" : "bg-transparent"} 
                hover:bg-blue-50 ${selectedEmail && selectedEmail.id === email.id ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
              onClick={() => {
                setSelectedEmail(email);
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(email.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleCheckbox(email.id);
                }}
                className="accent-blue-600"
              />
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(email.id);
                }}
                className="text-gray-500 hover:text-yellow-500"
              >
                {email.starred ? (
                  <Star className="w-4 h-4 fill-yellow-400" />
                ) : (
                  <StarOff className="w-4 h-4" />
                )}
              </div>
              <div className="w-1/4 flex items-center gap-2 truncate text-black relative">
                <Image
                  src={email.src}
                  alt={email.sender}
                  width={28}
                  height={28}
                  className="rounded-full object-cover border border-gray-200 cursor-pointer"
                  onMouseEnter={() => setTooltipOpenId(email.id)}
                  onMouseLeave={() => setTooltipOpenId(null)}
                />
                <span
                  className="cursor-pointer underline decoration-dotted decoration-1"
                  onMouseEnter={() => setTooltipOpenId(email.id)}
                  onMouseLeave={() => setTooltipOpenId(null)}
                >
                  {email.sender}
                </span>
                {tooltipOpenId === email.id && (
                  <div
                    className="pointer-events-auto absolute left-1/2 top-full z-30 w-max min-w-[180px] max-w-xs -translate-x-1/2 mt-2 px-4 py-2 bg-black text-white text-xs rounded shadow-lg opacity-100 transition-opacity duration-200 whitespace-nowrap break-words"
                    style={{ maxWidth: "90vw" }}
                    onMouseEnter={() => setTooltipOpenId(email.id)}
                    onMouseLeave={() => setTooltipOpenId(null)}
                  >
                    <div>
                      <span className="font-semibold">From:</span>{" "}
                      {email.sender.toLowerCase().replace(/ /g, "")}@example.com
                    </div>
                    <div>
                      <span className="font-semibold">To:</span> you@example.com
                    </div>
                  </div>
                )}
              </div>
              <div className="w-2/4 truncate">
                <div className="text-sm text-black font-medium">
                  {email.subject}
                </div>
                <div className="text-xs text-gray-500">
                  {email.message.slice(0, 50)}...
                </div>
              </div>
              <div className="w-1/4 text-right text-sm text-gray-400">
                {email.time}
              </div>
              {/* Remove hover icons, show nothing here */}
            </div>
          ))}

          {/* Pagination */}
          <div className="flex justify-between items-center px-4 py-2 border-t border-gray-200">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="text-blue-600 disabled:text-gray-400"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="text-blue-600 disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        </div>

        {/* Email Preview (right column) */}
        {selectedEmail && (
          <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto">
            <div className="bg-white/70 h-full backdrop-blur-md border border-gray-300 rounded-2xl shadow-2xl p-6 space-y-6 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="text-gray-600 hover:text-blue-600 flex items-center gap-2 text-sm font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Starred
                  </button>
                  <h1 className="mt-4 text-2xl font-bold text-gray-800">
                    {selectedEmail.subject}
                  </h1>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-semibold text-gray-700">From:</span>{" "}
                    {selectedEmail.sender}
                    <br />
                    <span className="font-semibold text-gray-700">To:</span>{" "}
                    you@example.com
                  </p>
                </div>
                <Image
                  src={selectedEmail.src}
                  alt="Sender Logo"
                  width={50}
                  height={50}
                  className="rounded-md object-contain drop-shadow-lg"
                />
              </div>
              <div className="flex flex-wrap gap-4 border-t pt-4 border-gray-200">
                <button className="text-yellow-500 hover:text-yellow-600 flex items-center gap-2 group">
                  <Star className="w-5 h-5" />
                  <span className="hidden md:inline group-hover:underline">
                    Star
                  </span>
                </button>
                <button className="text-blue-500 hover:text-blue-600 flex items-center gap-2 group">
                  <Trash2 className="w-5 h-5" />
                  <span className="hidden md:inline group-hover:underline">
                    Delete
                  </span>
                </button>
                <button className="text-orange-500 hover:text-orange-600 flex items-center gap-2 group">
                  <ShieldAlert className="w-5 h-5" />
                  <span className="hidden md:inline group-hover:underline">
                    Spam
                  </span>
                </button>
                <button className="text-blue-500 hover:text-blue-600 flex items-center gap-2 group">
                  <Reply className="w-5 h-5" />
                  <span className="hidden md:inline group-hover:underline">
                    Reply
                  </span>
                </button>
                <button className="text-blue-600 hover:text-blue-700 flex items-center gap-2 group">
                  <ReplyAll className="w-5 h-5" />
                  <span className="hidden md:inline group-hover:underline">
                    Reply All
                  </span>
                </button>
                <button className="text-green-500 hover:text-green-600 flex items-center gap-2 group">
                  <Forward className="w-5 h-5" />
                  <span className="hidden md:inline group-hover:underline">
                    Forward
                  </span>
                </button>
              </div>
              <div className="bg-white/90 border border-gray-300 rounded-xl p-5 shadow-md text-gray-800 text-base leading-relaxed whitespace-pre-line transition-all">
                {selectedEmail.message.repeat(6)}
              </div>
            </div>
          </div>
        )}
        {loading && <TypewriterLoader />}
      </div>
    </div>
  );
}