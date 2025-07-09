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
  signature,
  addSignature,
  showSignature,
  removeSignature,
}: {
  message: string;
  setMessage: (val: string) => void;
  signature: string;
  addSignature: () => void;
  showSignature: boolean;
  removeSignature: () => void;
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

  // Add signature if toggled
  useEffect(() => {
    if (showSignature && signature && editorRef.current && !editorRef.current.innerHTML.includes(signature)) {
      editorRef.current.innerHTML += `<br><br>${signature}`;
      setMessage(editorRef.current.innerHTML);
    }
    if (!showSignature && editorRef.current && signature) {
      // Remove signature if toggled off
      editorRef.current.innerHTML = editorRef.current.innerHTML.replace(`<br><br>${signature}`, '');
      setMessage(editorRef.current.innerHTML);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSignature]);

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
        {/* Signature Button */}
        <button
          type="button"
          className={`ml-2 px-2 py-1 rounded text-xs font-semibold border ${showSignature ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-500'}`}
          onClick={showSignature ? removeSignature : addSignature}
        >
          {showSignature ? 'Remove Signature' : 'Add Signature'}
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
  // Multiple signatures state
  // Always ensure "Best regards,<br>Venkatesh Rao" is present and undeletable
  const defaultSignature = 'Best regards,<br>Venkatesh Rao';
  const [signatures, setSignatures] = useState<string[]>([defaultSignature]);
  const [signatureInput, setSignatureInput] = useState('');
  const [selectedSignature, setSelectedSignature] = useState<string>('');
  const [showSignature, setShowSignature] = useState(false);
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [draftSaved, setDraftSaved] = useState(false);
  const [priority, setPriority] = useState('Normal');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [comment, setComment] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [savedComment, setSavedComment] = useState('');

  // Handler to add selected signature to editor
  const addSignature = () => {
    if (selectedSignature) setShowSignature(true);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fromEmail, setFromEmail] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Updating CC/BCC behavior
  const toggleCc = () => {
    setShowCc((prev) => !prev);
  };

  const toggleBcc = () => {
    setShowBcc((prev) => !prev);
  };

  const handleSend = async () => {
    const token = localStorage.getItem('cqtoken');
    if (!token) {
      alert('🔐 You are not logged in!');
      return;
    }
    try {
      // If signature is toggled on and not present, append it
      let htmlToSend = message;
      if (showSignature && selectedSignature && !message.includes(selectedSignature)) {
        htmlToSend += `<br><br>${selectedSignature}`;
      }
      const formData = {
        to,
        cc,
        bcc,
        subject,
        html: htmlToSend,
        from: fromEmail,
        // If needed: attachments, priority, etc.
      };
      const res = await fetch('http://localhost:4000/mail/send', {
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
      setAttachments([]);
    } catch (err) {
      const error = err as Error;
      alert(`❌ Failed to send: ${error.message}`);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
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
          {/* To Field with CC/BCC controls */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-blue-700">To</label>
            <div className="relative w-full">
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Recipient email"
                className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-900 w-full pr-32 focus:ring-2 focus:ring-blue-400 shadow-sm font-medium transition"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  type="button"
                  className={`text-xs ${
                    showCc ? 'text-blue-700 font-bold' : 'text-blue-500 opacity-80'
                  } hover:text-blue-700 transition`}
                  onClick={toggleCc}
                >
                  Cc
                </button>
                <button
                  type="button"
                  className={`text-xs ${
                    showBcc ? 'text-blue-700 font-bold' : 'text-blue-500 opacity-80'
                  } hover:text-blue-700 transition`}
                  onClick={toggleBcc}
                >
                  Bcc
                </button>
              </div>
            </div>
            {showCc && (
              <div className="relative mt-1">
                <input
                  type="email"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="CC recipient"
                  className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-700 w-full focus:ring-2 focus:ring-blue-400 shadow-sm font-medium transition pr-8 placeholder-blue-400"
                  style={{ color: '#2563eb' }}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 text-lg font-bold focus:outline-none"
                  onClick={toggleCc}
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
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="BCC recipient"
                  className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-700 w-full focus:ring-2 focus:ring-blue-400 shadow-sm font-medium transition pr-8 placeholder-blue-400"
                  style={{ color: '#2563eb' }}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 text-lg font-bold focus:outline-none"
                  onClick={toggleBcc}
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
          {/* ...signature editor removed as requested... */}
          <RichTextEditor
            message={message}
            setMessage={setMessage}
            signature={selectedSignature}
            addSignature={addSignature}
            showSignature={showSignature}
            removeSignature={() => setShowSignature(false)}
          />
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
              className={`flex flex-col gap-3 cursor-pointer border-2 border-dashed ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-blue-200 bg-white'
              } p-4 rounded-xl hover:bg-blue-100 transition`}
              onClick={handleAttachmentClick}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex items-center justify-center gap-3">
                <Paperclip className="w-6 h-6 text-blue-600" />
                <span className="text-sm text-blue-700">
                  Drop files here or click to attach
                </span>
                <input
                  id="file-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />
              </div>
              {attachments.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-xs text-blue-700 truncate" title={file.name}>
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAttachment(index);
                        }}
                        className="text-blue-500 hover:text-blue-700 focus:outline-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
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
            {/* Multiple Signature Management */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2">
                <Pen className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-700">Signatures</span>
              </div>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  className="border border-blue-200 rounded px-2 py-1 text-sm flex-1"
                  placeholder="Create new signature"
                  value={signatureInput}
                  onChange={e => setSignatureInput(e.target.value)}
                />
                <button
                  type="button"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-semibold"
                  onClick={() => {
                    if (signatureInput.trim() && !signatures.includes(signatureInput.replace(/\n/g, '<br>'))) {
                      setSignatures([...signatures, signatureInput.replace(/\n/g, '<br>')]);
                      setSignatureInput('');
                    }
                  }}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                {signatures.map((sig, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-900">
                    <input
                      type="radio"
                      name="signature-select"
                      checked={selectedSignature === sig}
                      onChange={() => setSelectedSignature(sig)}
                    />
                    <span dangerouslySetInnerHTML={{ __html: sig }} />
                    {sig !== defaultSignature && (
                      <button
                        type="button"
                        className="ml-auto text-red-500 hover:text-red-700 text-lg font-bold focus:outline-none"
                        onClick={() => {
                          setSignatures(signatures.filter((_, i) => i !== idx));
                          if (selectedSignature === sig) setSelectedSignature('');
                        }}
                        title="Remove Signature"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-semibold w-fit"
                onClick={addSignature}
                disabled={!selectedSignature}
              >
                Add to Editor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
