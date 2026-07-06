import React, { useState } from 'react';
import { MessageSquare, Plus, Send, CheckCircle2, User, HelpCircle } from 'lucide-react';
import { SupportTicket, UserProfile } from '../types';

interface TicketsViewProps {
  user: UserProfile & { role: 'admin' | 'customer' };
  tickets: SupportTicket[];
  setTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
  currentTicketId: string | null;
  setCurrentTicketId: React.Dispatch<React.SetStateAction<string | null>>;
  newMessageText: string;
  setNewMessageText: React.Dispatch<React.SetStateAction<string>>;
  isTyping: boolean;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  onCreateTicket: (subject: string, initialMsg: string) => void;
  onSendMessage: (ticketId: string, message: string, sender: 'user' | 'admin') => void;
  telegramUsername?: string;
}

export default function TicketsView({
  user,
  tickets,
  setTickets,
  currentTicketId,
  setCurrentTicketId,
  newMessageText,
  setNewMessageText,
  isTyping,
  setIsTyping,
  onCreateTicket,
  onSendMessage,
  telegramUsername = '@protocolcc_bot',
}: TicketsViewProps) {
  const [openingNewTicket, setOpeningNewTicket] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newInitialMsg, setNewInitialMsg] = useState('');

  const activeTicket = tickets.find(t => t.id === currentTicketId);

  const cleanTg = telegramUsername.replace('@', '').trim();

  const handleOpenTicketSubmit = () => {
    if (!newSubject.trim() || !newInitialMsg.trim()) {
      alert('Please fill out both the Subject and Message fields.');
      return;
    }

    onCreateTicket(newSubject, newInitialMsg);
    setNewSubject('');
    setNewInitialMsg('');
    setOpeningNewTicket(false);
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim() || !currentTicketId) return;

    // Determine sender based on logged-in user role
    const sender = user.role === 'admin' ? 'admin' : 'user';
    onSendMessage(currentTicketId, newMessageText, sender);
    setNewMessageText('');
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Dynamic telegram escalation / support links */}
      <div className="bg-[#e2f0fd]/50 border border-[#b8daff] text-[#004085] p-3 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-900">Need Immediate Assistance? Connect on Telegram</h4>
            <p className="font-semibold text-gray-600 mt-0.5">We offer 24/7 dedicated escalation queues and a vibrant community group directly on Telegram.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={`https://t.me/${cleanTg}`}
            target="_blank"
            rel="noreferrer"
            className="bg-[#24a1de] hover:bg-[#1a82b4] text-white px-3 py-1.5 rounded font-extrabold text-[10px] uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all text-center"
          >
            ✈️ Escalation Support (@{cleanTg})
          </a>
          <a
            href="https://t.me/+HWRd8CbPTjU0YTU0"
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded font-extrabold text-[10px] uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all text-center"
          >
            💬 Community Telegram Group
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      
      {/* Left Column: Ticket Inbox List */}
      <div className="bg-white border border-gray-300 rounded-sm p-4 shadow-xs flex flex-col gap-3 md:col-span-1">
        <div className="flex justify-between items-center border-b pb-2 mb-1">
          <h3 className="font-extrabold text-sm text-[#0c5460] uppercase flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#0c5460]" /> Support Desk
          </h3>
          {user.role !== 'admin' && (
            <button
              onClick={() => {
                setOpeningNewTicket(true);
                setCurrentTicketId(null);
              }}
              className="bg-[#0c5460] hover:opacity-90 text-white font-extrabold px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 text-[10px] uppercase border border-[#0c5460]"
            >
              <Plus className="w-3.5 h-3.5" /> Open Ticket
            </button>
          )}
        </div>

        {openingNewTicket ? (
          <div className="flex flex-col gap-3 bg-gray-50 p-3 rounded border border-gray-200">
            <h4 className="font-bold text-gray-800 uppercase text-[11px] border-b pb-1">Create Support Ticket</h4>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Subject:</label>
              <input
                type="text"
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                className="w-full border border-gray-300 rounded p-1.5 focus:outline-none focus:border-blue-400 font-semibold text-xs"
                placeholder="e.g. Validity Refund Inquiry"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Message:</label>
              <textarea
                value={newInitialMsg}
                onChange={e => setNewInitialMsg(e.target.value)}
                className="w-full h-20 border border-gray-300 rounded p-1.5 focus:outline-none focus:border-blue-400 font-medium resize-none text-[11px]"
                placeholder="Explain your problem in detail..."
              />
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => setOpeningNewTicket(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-bold px-3 py-1 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleOpenTicketSubmit}
                className="bg-[#0c5460] hover:opacity-95 text-white font-bold px-4 py-1 rounded border border-[#0c5460] cursor-pointer"
              >
                Submit Thread
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="text-center py-8 text-gray-400 font-medium">
                No active support threads.
              </div>
            ) : (
              tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => {
                    setCurrentTicketId(ticket.id);
                    setOpeningNewTicket(false);
                  }}
                  className={`w-full text-left p-3 border rounded transition-all cursor-pointer flex flex-col gap-1.5 ${
                    currentTicketId === ticket.id
                      ? 'border-[#0c5460] bg-[#bee5eb]/10'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center gap-3">
                    <span className="font-extrabold text-gray-900 truncate pr-1">{ticket.subject}</span>
                    <span className={`px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase border ${
                      ticket.status === 'Replied'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>Messages: {ticket.messages.length}</span>
                    <span>{ticket.createdAt}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Column: Chat View */}
      <div className="bg-white border border-gray-300 rounded-sm p-4 shadow-xs md:col-span-2 flex flex-col justify-between h-[360px]">
        {activeTicket ? (
          <div className="flex flex-col justify-between h-full">
            {/* Thread Header */}
            <div className="border-b pb-2 mb-3 flex justify-between items-center">
              <div className="flex flex-col gap-0.5">
                <span className="font-extrabold text-gray-900 text-sm truncate max-w-[280px]">{activeTicket.subject}</span>
                <span className="text-[10px] text-gray-400 font-medium">Status: {activeTicket.status} | Created: {activeTicket.createdAt}</span>
              </div>
              <span className="font-mono text-gray-400 font-bold text-[10px]">{activeTicket.id}</span>
            </div>

            {/* Message Stream */}
            <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-3 max-h-[220px]">
              {activeTicket.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] rounded p-2.5 leading-relaxed relative ${
                    m.sender === 'user'
                      ? 'bg-blue-50 border border-blue-100 self-end text-right text-gray-800'
                      : 'bg-zinc-50 border border-zinc-200 self-start text-left text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap text-[10px] font-bold text-gray-400">
                    <span className={m.sender === 'user' ? 'text-blue-700 ml-auto' : 'text-zinc-600'}>
                      {m.sender === 'user' ? 'Customer Profile' : '🛡️ @protocolcc_bot'}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{m.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-700 break-words leading-relaxed font-medium">
                    {m.text}
                  </p>
                </div>
              ))}

              {isTyping && (
                <div className="bg-zinc-50 border border-zinc-200 rounded p-2.5 self-start text-left max-w-[150px]">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200" />
                    <span className="text-[9px] text-gray-400 font-bold ml-1">@protocolcc_bot typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="border-t pt-3 flex gap-2 mt-3">
              <input
                type="text"
                value={newMessageText}
                onChange={e => setNewMessageText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type reply to support desk..."
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-400 font-medium text-xs text-gray-800"
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#0c5460] hover:opacity-90 text-white font-bold px-4 py-2 rounded transition-colors flex items-center gap-1 cursor-pointer text-xs uppercase"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-1.5 text-gray-400">
            <HelpCircle className="w-10 h-10 text-gray-300" />
            <span className="font-bold text-gray-600">No ticket active</span>
            <p className="text-[11px] max-w-[250px]">
              Select a support thread on the left pane, or click "Open Ticket" to submit a new inquiry regarding diagnostic codes.
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
