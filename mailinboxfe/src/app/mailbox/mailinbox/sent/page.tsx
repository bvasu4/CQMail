/* eslint-disable prefer-const */
"use client";
import { useEffect } from 'react';
import { useState } from "react";
import {
  Star,
  StarOff,
  Trash2,
  MailCheck,
  CheckSquare,
  Square,
  ArrowLeft,
  Reply,
  FileText,
  ReplyAll,
  Forward,
  ShieldAlert,
  ArrowDownAZ,
  ArrowUpZA,
  RotateCcw,
  Paperclip,
} from "lucide-react";
import Image from "next/image";
import { useSearch } from "../SearchContext";
import TypewriterLoader from "../TypewriterLoader";



type Attachment = {
  name: string;
  size: string;
  type: string;
};

type Email = {
  id: number;
  sender: string;
  to: string;
  subject: string;
  message: string;
  time: string;
  starred: boolean;
  unread: boolean;
  type: string;
  src: string;
  html_content: string; // ✅ New field
  attachments: Attachment[];
  showFull?: boolean;
};
type SentEmailResponse = {
  to?: string;
  subject?: string;
  body?: string;
  date: string;
  attachments?: {
    filename: string;
    size: number;
    contentType: string;
  }[];
};


export default function SentPage() {
  const { searchTerm } = useSearch();
const [emailList, setEmailList] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [loading, setLoading] = useState(false);

  const emailsPerPage = 10;

  const filteredEmails = emailList.filter(
    (email) =>
      email.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      setEmailList([]);
      setLoading(false);
    }, 5000);
  };

  useEffect(() => {
  const fetchSentEmails = async () => {
    try {
      const token = localStorage.getItem('cqtoken');
      const res = await fetch('http://localhost:4000/mail/sent', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

     const formattedEmails: Email[] = (data as SentEmailResponse[]).map((email, index) => ({
  id: index + 1,
  sender: 'You',
  to: email.to || '',
  subject: email.subject || '',
  message: email.body || '',
  html_content: email.body || '',
  time: new Date(email.date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }),
  starred: false,
  unread: false,
  type: 'sent',
  src: 'https://randomuser.me/api/portraits/men/1.jpg',
  attachments: (email.attachments || []).map((att) => ({
    name: att.filename,
    size: `${Math.ceil(att.size / 1024)} KB`,
    type: att.contentType,
  })),
}));


      setEmailList(formattedEmails);
    } catch (err) {
      console.error('Failed to fetch sent emails', err);
    }
  };

  fetchSentEmails();
}, []); 

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
                />
                <span className="cursor-pointer underline decoration-dotted decoration-1">
                  {email.to}
                </span>
              </div>s
              <div className="w-2/4 truncate">
                <div className="text-sm text-black font-medium flex items-center gap-2">
                  {email.subject}
                  {email.attachments && email.attachments.length > 0 && (
<span title="Has attachments">
  <Paperclip className="w-4 h-4 text-gray-400 inline-block" />
</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {email.message.slice(0, 50)}...
                </div>
              </div>
              <div className="w-1/4 text-right text-sm text-gray-400">
                {email.time}
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
                    Back to Sent
                  </button>
                  <h1 className="mt-4 text-2xl font-bold text-gray-800">
                    {selectedEmail.subject}
                  </h1>
                  <p className="text-sm text-gray-600 mt-2">
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
             <div className="bg-white/90 border border-gray-300 rounded-xl p-5 shadow-md text-gray-800 text-base leading-relaxed transition-all">
{(() => {
  const html = selectedEmail.html_content?.trim();
  const text = selectedEmail.message?.trim();
  const rawContent = html || text || '';

  const textOnly = rawContent.replace(/<[^>]*>/g, '').trim();
  const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
  const showFull = emailList.find(e => e.id === selectedEmail.id)?.showFull;

  if ((textOnly.length === 0 || wordCount === 0) && !showFull) {
    return <div className="italic text-gray-500">No content available</div>;
  }

  if (wordCount > 250 && !showFull) {
    const previewText = textOnly.split(/\s+/).slice(0, 250).join(' ');
    return (
      <>
        <div>{previewText}...</div>
        <div className="flex justify-end">
          <button
            onClick={() =>
              setEmailList(list =>
                list.map(e =>
                  e.id === selectedEmail.id ? { ...e, showFull: true } : e
                )
              )
            }
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            View Full Mail
          </button>
        </div>
      </>
    );

    } else {
      return (
        <div dangerouslySetInnerHTML={{ __html: rawContent }} />
      );
    }
  })()}

  {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
    <div className="mt-4">
      <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <Paperclip className="w-4 h-4 text-gray-500" /> Attachments
      </div>
      <div className="flex flex-wrap gap-4">
        {selectedEmail.attachments.map((att, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-800">{att.name}</span>
            <span className="text-xs text-gray-500">({att.size})</span>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

            </div>
          </div>
        )}
        {loading && <TypewriterLoader />}
      </div>
    </div>
  );
}
