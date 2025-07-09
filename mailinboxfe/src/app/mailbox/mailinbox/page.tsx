// MailInboxPage.tsx
/* eslint-disable prefer-const */
"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useSearch } from "./SearchContext";
import TypewriterLoader from "./TypewriterLoader"; // Make sure path is correct
// import useRouter from "./useRouter"; // Make sure path is correct

// Define the Email type based on your backend's EmailMessage structure
type Email = {
  id: number; // Assuming your backend provides an ID, or you're using message_id as a unique ID
  message_id: string; // Directly from backend
  sender: string; // Mapped from backend's 'from_email'
  subject: string; // Directly from backend
  message: string; // Mapped from backend's 'summary' or a slice of 'html_content'
  time: string; // Mapped from backend's 'date' (formatted)
  starred: boolean; // Managed client-side, or from backend's 'is_starred'
  unread: boolean; // Managed client-side, or from backend's '!is_read'
  type: string; // Mapped from backend's 'folder' or other status
  src: string; // Frontend-specific for sender image
  from: string; // Direct from backend: envelope.from?.[0]?.address
  to: string; // Direct from backend: (envelope.to?.map(t => t.address).filter(Boolean) || []).join(',')
  date: Date | string; // Direct from backend: envelope.date (can be Date object or ISO string)
  summary: string; // Direct from backend (used for 'message' in your frontend)
  html_content: string; // Direct from backend
  attachments: string[]; // Direct from backend (parsed from JSON)
};


export default function MailInboxPage() {
  const { searchTerm, showSidebar } = useSearch();
  const [emailList, setEmailList] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isFullView, setIsFullView] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tooltipOpenId, setTooltipOpenId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [blink, setBlink] = useState(false);

  const emailsPerPage = 5;

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('cqtoken');

      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:4000/mail/inbox", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'omit',
      });

      console.log('API Response Status:', response.status);
      console.log('API Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response Text:', errorText);

        if (response.status === 401) {
          setError("Authentication failed. Please log in again.");
          localStorage.removeItem('accessToken');
        } else {
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();

      console.log('Parsed API Data:', data);

      if (!Array.isArray(data)) {
        throw new TypeError("API response is not an array. Received:" + JSON.stringify(data));
      }

      const mappedEmails: Email[] = (data as Array<Record<string, unknown>>).map((email, index) => {
        let parsedAttachments: string[] = [];
        try {
          if (typeof (email as Record<string, unknown>).attachments === 'string' && ((email as Record<string, unknown>).attachments as string).trim().length > 0) {
            parsedAttachments = JSON.parse((email as Record<string, unknown>).attachments as string);
          }
        } catch (parseError) {
          console.warn(`Could not parse attachments for email ID ${(email as Record<string, unknown>).id || (email as Record<string, unknown>).message_id}:`, (email as Record<string, unknown>).attachments, parseError);
          parsedAttachments = [];
        }

        const plainTextContent = ((email as Record<string, unknown>).html_content || "").toString().replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        const previewText = (email as Record<string, unknown>).summary?.toString() || plainTextContent;

        // Ensure correct types for all fields
        const idRaw = (email as Record<string, unknown>).id ?? (email as Record<string, unknown>).message_id ?? index;
        const id = typeof idRaw === "number"
          ? idRaw
          : typeof idRaw === "string" && !isNaN(Number(idRaw))
            ? Number(idRaw)
            : index;

        const message_id = (email as Record<string, unknown>).message_id?.toString() ?? `email-${index}`;
        const sender = (email as Record<string, unknown>).from_email?.toString()
          ?? (email as Record<string, unknown>).from?.toString()
          ?? "Unknown Sender";
        const subject = (email as Record<string, unknown>).subject?.toString() ?? "(No Subject)";
        const message = previewText.length > 100 ? previewText.substring(0, 97) + "..." : previewText;
        const dateValue = (email as Record<string, unknown>).date;
        const date = dateValue instanceof Date
          ? dateValue
          : typeof dateValue === "string" && dateValue
            ? new Date(dateValue)
            : "";
        const time = date instanceof Date && !isNaN(date.getTime())
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          : "";
        const starred = !!(email as Record<string, unknown>).is_starred;
        const unread = typeof (email as Record<string, unknown>).is_read === "boolean"
          ? !(email as Record<string, unknown>).is_read
          : true;
        const type = (email as Record<string, unknown>).folder === 'INBOX' ? 'inbox' : 'other';
        const from = (email as Record<string, unknown>).from?.toString()
          ?? (email as Record<string, unknown>).from_email?.toString()
          ?? "";
        let to: string = "";
        if (Array.isArray((email as Record<string, unknown>).to)) {
          to = ((email as Record<string, unknown>).to as Array<{ address?: unknown }>)
            .map((t) => typeof t.address === 'string' ? t.address : "")
            .filter(Boolean)
            .join(',');
        } else if (typeof (email as Record<string, unknown>).to === 'string') {
          to = (email as Record<string, unknown>).to as string;
        } else {
          to = "";
        }
        const summary = (email as Record<string, unknown>).summary?.toString() ?? "";
        const html_content = (email as Record<string, unknown>).html_content?.toString() ?? "";

        const fromEmail = (email as Record<string, unknown>).from_email?.toString() ?? "";
        const src =
          fromEmail.toLowerCase().includes('google') ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png' :
          fromEmail.toLowerCase().includes('linkedin') ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LinkedIn_Logo.svg/800px-LinkedIn_Logo.svg.png' :
          fromEmail.toLowerCase().includes('facebook') ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/800px-Facebook_f_logo_%282019%29.svg.png' :
          fromEmail.toLowerCase().includes('twitter') ? 'https://cdn.prod.website-files.com/5d66bdc65e51a0d114d15891/64cebdd90aef8ef8c749e848_X-EverythingApp-Logo-Twitter.jpg' :
          fromEmail.toLowerCase().includes('amazon') ? 'https://w7.pngwing.com/pngs/141/900/png-transparent-amazon-com-amazon-echo-amazon-music-the-everything-store-jeff-bezos-and-the-age-of-amazon-kindle-fire-black-friday-miscellaneous-text-logo.png' :
          fromEmail.toLowerCase().includes('netflix') ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/800px-Netflix_2015_logo.svg.png' :
          fromEmail.toLowerCase().includes('spotify') ? 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfVoqbXvQlq8MPVaqn3PorKrb1Ue6qvAWYBg&s' :
          '/default-avatar.png';

        return {
          id,
          message_id,
          sender,
          subject,
          message,
          time,
          starred,
          unread,
          type,
          src,
          from,
          to,
          date,
          summary,
          html_content,
          attachments: parsedAttachments,
        };
      });
      setEmailList(mappedEmails);
    } catch (e) {
      console.error("Failed to fetch emails:", e);
      setError(e instanceof Error ? e.message : "Failed to load emails.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const filteredEmails = emailList.filter((email) => {
    const matchSearch =
      email.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchFilter =
      selectedFilter === "all" ||
      (selectedFilter === "starred" && email.starred) ||
      (selectedFilter === "unstarred" && !email.starred) ||
      (selectedFilter === "read" && !email.unread) ||
      (selectedFilter === "unread" && email.unread);

    return matchSearch && matchFilter;
  });

  const sortedEmails = [...filteredEmails].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortBy === "latest" ? dateB - dateA : dateA - dateB;
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

  const handleArchive = () => {
    setEmailList((prev) =>
      prev.map((email) =>
        selectedIds.includes(email.id) ? { ...email, type: "archived" } : email
      )
    );
    setSelectedIds([]);
  };
  const handleSpam = () => {
    setEmailList((prev) =>
      prev.map((email) =>
        selectedIds.includes(email.id) ? { ...email, type: "spam" } : email
      )
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
  const handleBulkDelete = () => {
    setEmailList((prev) =>
      prev.filter((email) => !selectedIds.includes(email.id))
    );
    setSelectedIds([]);
  };

  const handleMoveToFolder = () => {
    alert("Move to folder functionality is not implemented yet.");
    setSelectedIds([]);
  };
  const handleDownloadPDF = () => {
    alert("Download as PDF functionality is not implemented yet.");
    setSelectedIds([]);
  };
  const handleExport = () => {
    alert("Export email functionality is not implemented yet.");
    setSelectedIds([]);
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setIsFullView(false);
    if (email.unread) {
        setEmailList(prev => prev.map(e => e.id === email.id ? { ...e, unread: false } : e));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setSelectedEmail(null);
    setIsFullView(false);
  };

  const handleReload = () => {
    fetchEmails();
  };

  useEffect(() => {
    const interval = setInterval(() => {

      setBlink(true);
      setTimeout(() => setBlink(false), 300);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // const router = useRouter();

  return (
    <div
      className={`h-[calc(100vh-64px)] ${showSidebar ? 'max-w-[58rem]' : 'max-w-[72rem]'}  p-2 dark:bg-gray-900 font-sans transition-all duration-300`}
      style={{
        maxWidth: showSidebar ? '58rem' : '70rem',
        transition: 'max-width 0.3s',
        overflowX: 'hidden', // Prevent horizontal scroll
        overflowY: 'hidden', // Prevent vertical scroll on outer container
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col md:flex-row transition ${
          blink ? "ring-4 ring-blue-400" : ""
        }`}
        style={{
          overflow: 'hidden', // Hide scrollbars on the card
        }}
      >
        {/* Email List */}
        <div
          className={`$${
            selectedEmail && !isFullView
              ? "hidden md:block md:w-2/5"
              : selectedEmail && isFullView
              ? "hidden"
              : "w-full"
          } bg-white`}
          style={{
            overflowY: 'auto', // Only vertical scroll inside the card
            overflowX: 'hidden', // No horizontal scroll inside the card
            maxHeight: '100%',
          }}
        >
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
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center justify-center w-8 h-8 ml-1 rounded hover:bg-blue-100"
                  type="button"
                  aria-label="Filter dropdown"
                >
                  <ChevronDown className="w-4 h-4 text-blue-700" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute left-0 mt-56 min-w-[160px] bg-white border border-blue-200 rounded-lg shadow-lg z-20 flex flex-col py-1">
                    {[
                      { label: "All", value: "all" },
                      { label: "Read", value: "read" },
                      { label: "Unread", value: "unread" },
                      { label: "Starred", value: "starred" },
                      { label: "Unstarred", value: "unstarred" },
                      { label: "Archived", value: "archived" },
                    ]
                      .filter((option) => selectedFilter !== option.value)
                      .map((option) => (
                        <div
                          key={option.value}
                          onClick={() => {
                            setSelectedFilter(option.value);
                            setIsDropdownOpen(false);
                            setPage(1);
                          }}
                          className="w-full flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 text-base text-gray-700"
                        >
                          {option.label}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              {selectedFilter !== "all" && (
                <div className="text-xs text-blue-700">
                  Filter:{" "}
                  <span className="font-semibold text-blue-700">
                    {selectedFilter}
                  </span>
                </div>
              )}
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
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 sticky top-12 z-20">
                {/* Archive */}
                <button
                  onClick={handleArchive}
                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition"
                  title="Archive Selected"
                >
                  <ShieldAlert className="w-5 h-5" />
                </button>

                {/* Spam */}
                <button
                  onClick={handleSpam}
                  className="p-2 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-600 transition"
                  title="Mark as Spam"
                >
                  <ShieldAlert className="w-5 h-5 rotate-45" />
                </button>

                {/* Move to Folder */}
                <button
                  onClick={handleMoveToFolder}
                  className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600 transition"
                  title="Move to Folder"
                >
                  <Folder className="w-5 h-5" />
                </button>

                {/* Download as PDF */}
                <button
                  onClick={handleDownloadPDF}
                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition"
                  title="Download as PDF"
                >
                  <FileText className="w-5 h-5" />
                </button>
                {/* Export Email */}
                <button
                  onClick={handleExport}
                  className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition"
                  title="Export Email"
                >
                  <Upload className="w-5 h-5" />
                </button>
                {/* Deselect All */}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Sort by:
                </span>
                <button
                  onClick={() =>
                    setSortBy(sortBy === "latest" ? "oldest" : "latest")
                  }
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
          </div>

          {loading && (
            <div className="flex items-center justify-center p-8">
              <TypewriterLoader />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center p-4">
              Error: {error}
            </div>
          )}

          {!loading && !error && paginatedEmails.length === 0 && (
            <div className="text-gray-500 text-center p-8">
              No emails found.
            </div>
          )}

          {!loading && !error && paginatedEmails.map((email) => (
            <div
              key={email.id}
              className={`group flex items-center gap-3 px-4 py-3 border-b border-gray-200 transition-colors duration-200 cursor-pointer
                ${email.unread ? "font-semibold bg-gray-50" : "bg-transparent"}
                hover:bg-blue-50`}
              onClick={() => handleEmailClick(email)}
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
              <div className="w-1/4 flex min-w-0 items-center gap-2 text-black relative">
                {/* Removed sender image */}
                <span
                  className="truncate cursor-pointer underline decoration-dotted decoration-1"
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
                      {email.from}
                    </div>
                    <div>
                      <span className="font-semibold">To:</span> {email.to}
                    </div>
                  </div>
                )}
              </div>
              <div className="w-2/4 min-w-0">
                <div className="truncate text-sm text-black font-medium">
                  {email.subject}
                </div>
                <div className="truncate text-xs text-gray-500">
                  {email.message}
                </div>
              </div>
              <div className="w-1/4 text-right text-sm text-gray-400">
                {email.time}
              </div>
              {/* Hover Actions */}
              <div className="hidden group-hover:flex gap-2 ml-2 items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(email.id);
                  }}
                  className="text-yellow-500 hover:text-yellow-600"
                  title="Star"
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEmailList((prev) =>
                      prev.filter((e2) => e2.id !== email.id)
                    );
                  }}
                  className="text-blue-500 hover:text-blue-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={page === totalPages}
              className="text-blue-600 disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        </div>
        {selectedEmail && (
          <div
            className={`w-full${!isFullView ? ' md:w-3/5' : ''} bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto flex flex-col`}
          >
            <div className="bg-white/70 backdrop-blur-md border border-gray-300 rounded-2xl shadow-2xl p-6 space-y-6 transition-all duration-300">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <button
                    onClick={handleBack}
                    className="text-gray-600 hover:text-blue-600 flex items-center gap-2 text-sm font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Inbox
                  </button>
                  <h1 className="mt-4 text-2xl font-bold text-gray-800">
                    {selectedEmail.subject}
                  </h1>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-semibold text-gray-700">From:</span>{" "}
                    {selectedEmail.sender}
                    <br />
                    <span className="font-semibold text-gray-700">To:</span>{" "}
                    {selectedEmail.to}
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

              {/* Action Buttons */}
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

              {/* Email Message */}
              <div
                className="bg-white/90 border border-gray-300 rounded-xl p-5 shadow-md text-gray-800 text-base leading-relaxed whitespace-pre-line transition-all"
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    let plainText = selectedEmail.summary && selectedEmail.summary.trim().length > 0
                      ? selectedEmail.summary.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
                      : (selectedEmail.html_content || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
                    const words = plainText.split(/\s+/).filter(Boolean);
                    if (!isFullView && words.length > 250) {
                      return words.slice(0, 250).join(' ') + '...';
                    }
                    return plainText;
                  })(),
                }}
              />

              {/* Show View Full Mail link if more than 250 words and not in full view */}
              {!isFullView && (() => {
                let plainText = (selectedEmail.summary && selectedEmail.summary.trim().length > 0
                  ? selectedEmail.summary
                  : selectedEmail.html_content || '')
                  .replace(/<[^>]*>?/gm, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
                const words = plainText.split(' ').filter(Boolean);
                if (words.length > 50) {
                  return (
                    <div className="flex justify-end">
                      <a
                        href="#"
                        onClick={e => { e.preventDefault(); setIsFullView(true); }}
                        className="mt-2 text-sm text-blue-600 hover:underline cursor-pointer"
                        tabIndex={0}
                        role="button"
                        aria-label="View Full Mail"
                      >
                        View Full Mail
                      </a>
                    </div>
                  );
                }
                return null;
              })()}

              {/* If you want to show attachments */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-4 border-t pt-4 border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">Attachments:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmail.attachments.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline bg-blue-50 px-3 py-1 rounded-full text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        {link.split('/').pop()}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loader Spinner Only (no background overlay) */}
        {loading && !emailList.length && <TypewriterLoader />}
      </div>
    </div>
  );
}
