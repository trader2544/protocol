import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Users, ShieldAlert, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface Message {
  id: string;
  sender: string;
  role: 'admin' | 'moderator' | 'trader' | 'user';
  text: string;
  timestamp: string;
  avatarColor: string;
}

interface LiveChatboxProps {
  user: UserProfile & { role: 'admin' | 'customer' };
}

export default function LiveChatbox({ user }: LiveChatboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(3);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Xpress_Refunds',
      role: 'trader',
      text: 'Just tested the new base loaded today. 95% validity rate! 🔥',
      timestamp: '18:32',
      avatarColor: 'bg-indigo-500'
    },
    {
      id: '2',
      sender: 'mariafq',
      role: 'admin',
      text: 'Thanks guys, support Telegram group is active for all bulk purchasers. Drop ticket if any issue.',
      timestamp: '18:34',
      avatarColor: 'bg-rose-500'
    },
    {
      id: '3',
      sender: 'Carder99',
      role: 'trader',
      text: 'Anyone tried the wholesale fullz packs? Need some fast US ones.',
      timestamp: '18:37',
      avatarColor: 'bg-emerald-500'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [usersCount, setUsersCount] = useState(148);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll chat to bottom when opened or message sent
  useEffect(() => {
    if (isOpen) {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnread(0);
    }
  }, [isOpen, messages]);

  // Simulate active traders chatting periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random users count fluctuation
      setUsersCount(prev => Math.max(130, Math.min(180, prev + (Math.random() > 0.5 ? 1 : -1))));

      // Dynamic messages pool
      const mockReplies = [
        { sender: 'ValidCheck_Bot', role: 'moderator' as const, text: '🔄 Automated Base Scan complete. Status: HIGH VALIDITY RATES detected across Visa/Mastercard.', color: 'bg-amber-600' },
        { sender: 'TonyStark_CVV', role: 'trader' as const, text: 'Deposit approved instantly. LTC is very fast tonight guys!', color: 'bg-blue-500' },
        { sender: 'mariafq', role: 'admin' as const, text: 'Bases restock coming in 3 hours. Watch out for news alert!', color: 'bg-rose-500' },
        { sender: 'Alpha_Dumps', role: 'trader' as const, text: 'Grabbed 10 fullz and got 9 good bins. Premium quality.', color: 'bg-cyan-500' },
        { sender: 'Xpress_Refunds', role: 'trader' as const, text: 'Refund for declined card took only 5 mins. Support is amazing here.', color: 'bg-indigo-500' }
      ];

      // Add random message if chat is active/idle
      if (Math.random() > 0.6) {
        const selected = mockReplies[Math.floor(Math.random() * mockReplies.length)];
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now()),
            sender: selected.sender,
            role: selected.role,
            text: selected.text,
            timestamp: timeStr,
            avatarColor: selected.color
          }
        ]);

        if (!isOpen) {
          setUnread(u => u + 1);
        }
      }
    }, 15000); // simulation interval

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // User message
    const userMsg: Message = {
      id: String(Date.now()),
      sender: user.email.split('@')[0],
      role: user.role === 'admin' ? 'admin' : 'user',
      text: inputText,
      timestamp: timeStr,
      avatarColor: user.role === 'admin' ? 'bg-purple-600' : 'bg-[#0c5460]'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Admin/Trader reply simulation after 2 seconds
    setTimeout(() => {
      const nowReply = new Date();
      const replyTimeStr = nowReply.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const responses = [
        `Welcome to the live shoutbox, @${userMsg.sender}! Drop a support ticket if you need any individual help.`,
        `Yo @${userMsg.sender}, make sure to check out the fresh live Auctions tab!`,
        `Welcome! We are currently checking valid rates. High quality dumps are live right now.`,
        `Support is active. Telegram escalation is also available at https://t.me/mariafq.`
      ];

      const responseText = responses[Math.floor(Math.random() * responses.length)];

      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'mariafq',
          role: 'admin',
          text: responseText,
          timestamp: replyTimeStr,
          avatarColor: 'bg-rose-500'
        }
      ]);
    }, 2000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans select-text text-xs">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#0c5460] hover:bg-[#073a43] text-white p-2.5 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer transition-all duration-300 transform hover:scale-102 border-2 border-white relative opacity-90 hover:opacity-100"
          id="chatbox_toggle_btn"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-extrabold text-[10px] tracking-wider uppercase pr-1">Live Shoutbox</span>
          
          {/* Active online indicator */}
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white absolute top-0.5 right-0.5 animate-pulse" />
          
          {/* Unread Badge */}
          {unread > 0 && (
            <span className="absolute -top-2 -left-2 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white animate-bounce">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* Actual Chat Window */}
      {isOpen && (
        <div className="w-[320px] h-[420px] bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col overflow-hidden animate-fade-in transition-all">
          
          {/* Chat Header */}
          <div className="bg-[#0c5460] text-white p-3 flex items-center justify-between shadow-sm select-none">
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white block animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-[11px] uppercase tracking-wide">Live Trading Shoutbox</h4>
                <div className="flex items-center gap-1 text-[9px] text-teal-100 font-bold mt-0.5">
                  <Users className="w-3 h-3" />
                  <span>{usersCount} Traders Online</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-teal-100 hover:text-white p-1 rounded transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Guidelines Header */}
          <div className="bg-amber-50/70 border-b border-amber-100 p-2 text-[9px] text-amber-900 font-semibold flex items-start gap-1.5 leading-relaxed select-none">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-700 mt-0.5" />
            <p>Official community shoutbox. Please respect traders. Absolute priority support goes to Telegram escalation chats.</p>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
            {messages.map(msg => (
              <div key={msg.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${msg.avatarColor}`} />
                    <span className="text-gray-900 font-black">{msg.sender}</span>
                    <span className={`px-1 rounded-[2px] text-[8px] font-black uppercase ${
                      msg.role === 'admin'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : msg.role === 'moderator'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-teal-50 text-teal-800 border border-teal-100'
                    }`}>
                      {msg.role}
                    </span>
                  </div>
                  <span className="text-gray-400 font-mono font-medium">{msg.timestamp}</span>
                </div>
                <p className="bg-white border rounded p-2 text-gray-700 leading-relaxed font-medium break-words shadow-xs">
                  {msg.text}
                </p>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-2 border-t bg-white flex items-center gap-1.5 shadow-sm">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Post a quick message..."
              className="flex-1 border rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0c5460] font-semibold text-xs"
            />
            <button
              onClick={handleSend}
              className="bg-[#0c5460] hover:bg-[#073a43] text-white p-1.5 rounded transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
