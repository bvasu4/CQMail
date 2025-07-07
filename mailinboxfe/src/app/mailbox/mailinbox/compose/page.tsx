'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  Send,
  Paperclip,
  Zap,
  Tag,
  Shield,
  Bot,
  Calendar,
  FileText,
  Pen,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Link2,
  Code,
  Table2,
} from 'lucide-react';

function RichTextEditor({
  message,
  setMessage,
}: {
  message: string;
  setMessage: (val: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState('3');
  const [fontName, setFontName] = useState('Arial');
  const [fontColor, setFontColor] = useState('#000000');
  const [highlight, setHighlight] = useState('#ffffff');

  // Set initial message when loaded
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== message) {
      editorRef.current.innerHTML = message;
    }
  }, [message]);

  const format = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertLink = () => {
    const url = prompt('Enter URL');
    if (url) format('createLink', url);
  };

  const insertTable = () => {
    const tableHTML =
      '<table border="1" style="border-collapse: collapse;"><tr><td>Row 1 Col 1</td><td>Row 1 Col 2</td></tr><tr><td>Row 2 Col 1</td><td>Row 2 Col 2</td></tr></table>';
    if (editorRef.current) {
      editorRef.current.innerHTML += tableHTML;
    }
  };

  const insertCode = () => {
    const code = prompt('Enter code');
    if (code && editorRef.current) {
      editorRef.current.innerHTML += `<pre><code>${code}</code></pre>`;
    }
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
        Message
      </label>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        <select
          value={fontName}
          onChange={(e) => {
            setFontName(e.target.value);
            format('fontName', e.target.value);
          }}
          className="px-2 py-1 text-sm rounded border dark:bg-gray-800 bg-white"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
          <option value="Courier New">Courier New</option>
        </select>

        <select
          value={fontSize}
          onChange={(e) => {
            setFontSize(e.target.value);
            format('fontSize', e.target.value);
          }}
          className="px-2 py-1 text-sm rounded border dark:bg-gray-800 bg-white"
        >
          <option value="1">Very Small</option>
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">Very Large</option>
        </select>

        <input
          type="color"
          title="Text Color"
          value={fontColor}
          onChange={(e) => {
            setFontColor(e.target.value);
            format('foreColor', e.target.value);
          }}
        />
        <input
          type="color"
          title="Highlight"
          value={highlight}
          onChange={(e) => {
            setHighlight(e.target.value);
            format('hiliteColor', e.target.value);
          }}
        />

        <button onClick={() => format('bold')}>
          <Bold className="w-4 h-4" />
        </button>
        <button onClick={() => format('italic')}>
          <Italic className="w-4 h-4" />
        </button>
        <button onClick={() => format('underline')}>
          <Underline className="w-4 h-4" />
        </button>
        <button onClick={() => format('justifyLeft')}>
          <AlignLeft className="w-4 h-4" />
        </button>
        <button onClick={() => format('justifyCenter')}>
          <AlignCenter className="w-4 h-4" />
        </button>
        <button onClick={() => format('justifyRight')}>
          <AlignRight className="w-4 h-4" />
        </button>
        <button onClick={() => format('insertUnorderedList')}>
          <List className="w-4 h-4" />
        </button>
        <button onClick={() => format('insertOrderedList')}>
          <ListOrdered className="w-4 h-4" />
        </button>
        <button onClick={insertLink}>
          <Link2 className="w-4 h-4" />
        </button>
        <button onClick={() => format('undo')}>
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={() => format('redo')}>
          <Redo2 className="w-4 h-4" />
        </button>
        <button onClick={insertCode}>
          <Code className="w-4 h-4" />
        </button>
        <button onClick={insertTable}>
          <Table2 className="w-4 h-4" />
        </button>
      </div>

      {/* Rich Text Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => setMessage((e.currentTarget as HTMLDivElement).innerHTML)}
        className="w-full min-h-[200px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-800 dark:text-white shadow-inner focus:outline-none overflow-auto"
      />
    </div>
  );
}

export default function Compose() {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [priority, setPriority] = useState('Normal');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [comment, setComment] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [savedComment, setSavedComment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fromEmail, setFromEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('cqtoken');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        setFromEmail(decodedPayload.email || '');
      } catch (error) {
        console.error('❌ Error decoding token:', error);
      }
    }
  }, []);

  // Auto-save draft every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 1000);

    return () => clearInterval(interval);
  }, [subject, message]);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleSend = async () => {
    const token = localStorage.getItem('cqtoken');
    if (!token) {
      alert('🔐 You are not logged in!');
      return;
    }
    try {
      const formData = {
        to,
        cc,
        bcc,
        subject,
        html: message,
        from: fromEmail,
        // If needed: attachments, priority, etc.
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/mail/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Send failed');
      }
      const result = await res.json();
      alert(`✅ Email sent! Message ID: ${result.messageId}`);
      setTo('');
      setCc('');
      setBcc('');
      setSubject('');
      setMessage('');
      setAttachment(null);
    } catch (err: any) {
      alert(`❌ Failed to send: ${err.message}`);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br  p-0">
      <div className="w-full max-w-6xl rounded-3xl shadow-2xl  border-blue-200 p-0 flex flex-col sm:flex-row gap-0 transition-all">
        {/* Left Side: Main Compose Form */}
        <div className="flex-1 flex flex-col gap-6 p-6 sm:p-8 border-r border-blue-100">
          <h2 className="text-3xl font-extrabold text-blue-800 flex items-center gap-2 tracking-tight mb-2">
            <Send className="w-7 h-7 text-blue-500" /> Compose Mail
          </h2>
          {/* From Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-blue-700">From</label>
            <input
              type="email"
              value={fromEmail}
              disabled
              className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-900 w-full font-semibold shadow-sm"
            />
          </div>
          {/* To Field with CC/BCC as subtle text, reveal on click only */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-blue-700">To</label>
            <div className="relative w-full">
              <input
                type="email"
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="Recipient email"
                className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-900 w-full pr-32 focus:ring-2 focus:ring-blue-400 shadow-sm font-medium transition"
              />
              {/* CC/BCC as subtle text, reveal as button on click only */}
              {!showCc && !showBcc && (
                <>
                  <span
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-blue-500 opacity-80 cursor-pointer select-none font-semibold hover:text-blue-700 transition"
                    onClick={() => setShowCc(true)}
                  >
                    Cc
                  </span>
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-500 opacity-80 cursor-pointer select-none font-semibold hover:text-blue-700 transition"
                    onClick={() => setShowBcc(true)}
                  >
                    Bcc
                  </span>
                </>
              )}
            </div>
            {showCc && (
              <div className="relative mt-1">
                <input
                  type="email"
                  value={cc}
                  onChange={e => setCc(e.target.value)}
                  placeholder="CC recipient"
                  className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-900 w-full focus:ring-2 focus:ring-blue-400 shadow-sm font-medium transition pr-8"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 text-lg font-bold focus:outline-none"
                  onClick={() => setShowCc(false)}
                  tabIndex={-1}
                  aria-label="Close CC"
                >
                  ×
                </button>
              </div>
            )}
            {showBcc && (
              <div className="relative mt-1">
                <input
                  type="email"
                  value={bcc}
                  onChange={e => setBcc(e.target.value)}
                  placeholder="BCC recipient"
                  className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-900 w-full focus:ring-2 focus:ring-blue-400 shadow-sm font-medium transition pr-8"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 text-lg font-bold focus:outline-none"
                  onClick={() => setShowBcc(false)}
                  tabIndex={-1}
                  aria-label="Close BCC"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          {/* Subject Field */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-blue-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mt-1 text-blue-900 font-medium shadow-sm focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>
          {/* Rich Text Editor */}
          <RichTextEditor message={message} setMessage={setMessage} />
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-xl shadow transition text-base">
              <Save className="w-5 h-5" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-6 py-2 rounded-xl shadow transition text-base"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
          {draftSaved && (
            <p className="text-sm text-green-600 mt-2">✅ Draft auto-saved</p>
          )}
        </div>
        {/* Right Side: Settings, Labels, Security, etc. */}
        <div className="w-full sm:w-96 flex flex-col gap-6 p-6 sm:p-8 bg-blue-50/60 rounded-b-3xl sm:rounded-b-none sm:rounded-r-3xl">
          {/* Attachment Card */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-blue-700 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-blue-500" /> Attachments
            </label>
            <div
              className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-blue-200 p-3 rounded-xl bg-white hover:bg-blue-100 transition"
              onClick={handleAttachmentClick}
            >
              <Paperclip className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-blue-700">Click to attach file</span>
              <input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                className="hidden"
              />
              {attachment && (
                <span className="ml-2 text-xs text-blue-700 font-semibold">
                  📄 {attachment.name}
                </span>
              )}
            </div>
          </div>
          {/* Priority Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-blue-700 mb-1">
              <Zap className="inline w-4 h-4 mr-1" /> Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white text-blue-900 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-400"
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
            </select>
          </div>
          {/* Labels Checkboxes */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">
              <Tag className="inline w-4 h-4 mr-1" /> Labels
            </p>
            <div className="space-y-1 pl-1 text-sm text-blue-900">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-blue-600" />
                Work
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-blue-600" />
                Personal
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-blue-600" />
                Important
              </label>
            </div>
          </div>
          {/* Security Options */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">
              <Shield className="inline w-4 h-4 mr-1" /> Security Options
            </p>
            <div className="space-y-1 pl-1 text-sm text-blue-900">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-blue-600" />
                Request Read Receipt
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-blue-600" />
                Confidential Mode
              </label>
            </div>
          </div>
          {/* Auto Reply Radio */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">
              <Bot className="inline w-4 h-4 mr-1" /> Auto-Reply
            </p>
            <div className="space-y-1 pl-1 text-sm text-blue-900">
              <label className="flex items-center gap-2">
                <input type="radio" name="autoreply" className="accent-blue-600" />
                Enable
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="autoreply" className="accent-blue-600" />
                Disable
              </label>
            </div>
          </div>
          {/* Schedule Time Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-blue-700 mb-1">
              <Calendar className="inline w-4 h-4 mr-1" /> Schedule Send
            </label>
            <select
              className="w-full px-3 py-2 text-sm bg-white text-blue-900 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-400"
            >
              <option>Send Now</option>
              <option>In 1 Hour</option>
              <option>Tomorrow Morning</option>
              <option>Custom Time</option>
            </select>
          </div>
          {/* Signature & Template Checkboxes */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-blue-900">
              <input type="checkbox" className="accent-blue-600" />
              <FileText className="w-4 h-4" />
              Insert Template
            </label>
            <label className="flex items-center gap-2 text-sm text-blue-900">
              <input type="checkbox" className="accent-blue-600" />
              <Pen className="w-4 h-4" />
              Add Signature
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
