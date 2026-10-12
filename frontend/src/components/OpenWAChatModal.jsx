import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  Car, 
  User, 
  CheckCheck, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  MessageCircle, 
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { useOpenWAChat } from '../context/ChatContext';
import { sendDirectChatMessage, getDirectChatHistory, getWhatsAppStatus } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function OpenWAChatModal() {
  const { isOpen, chatTarget, closeChat } = useOpenWAChat();
  const { showSuccess, showError } = useToast();

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [waConnected, setWaConnected] = useState(true);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check OpenWA connection & load history when modal opens
  useEffect(() => {
    if (isOpen && chatTarget?.phone) {
      setSendError('');
      setMessageText(chatTarget.initialMessage || '');
      fetchHistory(chatTarget.phone);
      checkGatewayStatus();

      // Focus input
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isOpen, chatTarget]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingHistory]);

  const checkGatewayStatus = async () => {
    try {
      const res = await getWhatsAppStatus();
      setWaConnected(res.connected);
    } catch {
      setWaConnected(false);
    }
  };

  const fetchHistory = async (phone) => {
    setLoadingHistory(true);
    try {
      const history = await getDirectChatHistory(phone);
      setMessages(Array.isArray(history) ? history : []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCopyPhone = () => {
    if (!chatTarget?.phone) return;
    navigator.clipboard.writeText(chatTarget.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed || !chatTarget?.phone || sending) return;

    setSending(true);
    setSendError('');

    // Optimistic UI message
    const tempId = Date.now();
    const optimisticMessage = {
      id: tempId,
      phone: chatTarget.phone,
      content: trimmed,
      message_type: `CHAT_${(chatTarget.role || 'CUSTOMER').toUpperCase()}`,
      status: 'SENDING',
      sent_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setMessageText('');

    try {
      const res = await sendDirectChatMessage({
        phone: chatTarget.phone,
        message: trimmed,
        recipient_name: chatTarget.name,
        recipient_role: chatTarget.role,
        customer_id: chatTarget.customerId || null,
        booking_reference: chatTarget.bookingRef || null,
      });

      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'SENT' } : m))
        );
        showSuccess(`Message sent to ${chatTarget.name} via OpenWA!`);
      } else {
        const errMsg = res.error || res.message || 'Failed to deliver message via OpenWA';
        setSendError(errMsg);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'FAILED', error_detail: errMsg } : m))
        );
      }
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Network error sending WhatsApp message';
      setSendError(errMsg);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'FAILED', error_detail: errMsg } : m))
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const applyTemplate = (tpl) => {
    const personalized = tpl
      .replace('{name}', chatTarget?.name || '')
      .replace('{ref}', chatTarget?.bookingRef || '');
    setMessageText(personalized);
    textareaRef.current?.focus();
  };

  if (!isOpen || !chatTarget) return null;

  const isDriver = chatTarget.role === 'Driver';

  // Role-specific quick template chips
  const quickTemplates = isDriver
    ? [
        '🚖 New ride duty assigned to you! Please check details.',
        '📍 Customer is waiting at pickup location.',
        '📞 Please call passenger as soon as you reach.',
        '⚠️ Ride updated. Please acknowledge dispatch.',
      ]
    : [
        `👋 Hello ${chatTarget.name}, greeting from PB08 TAXI!`,
        '🚗 Your cab booking is confirmed & driver is dispatched.',
        '📍 Driver is arriving at your pickup location shortly.',
        '✅ Your ride has been completed. Thank you for choosing PB08 TAXI!',
      ];

  const waWebFallbackUrl = `https://wa.me/${chatTarget.phone.replace(/[^\d]/g, '')}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px] max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Chat Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-850 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-950 flex items-center justify-between">
          <div className="flex items-center space-x-3.5 min-w-0">
            {/* Avatar */}
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md ${
              isDriver 
                ? 'bg-taxi-yellow text-black' 
                : 'bg-emerald-500/20 text-[#25D366] border border-[#25D366]/30'
            }`}>
              {isDriver ? <Car className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>

            {/* Recipient Information */}
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white truncate">
                  {chatTarget.name}
                </h3>
                <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${
                  isDriver
                    ? 'bg-taxi-yellow/15 text-taxi-yellow border-taxi-yellow/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isDriver ? 'Driver 🚕' : 'Customer 👤'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-0.5">
                {/* Phone */}
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="font-mono text-zinc-300 hover:text-white flex items-center space-x-1 group"
                  title="Click to copy phone number"
                >
                  <Phone className="w-3 h-3 text-[#25D366]" />
                  <span>{chatTarget.phone}</span>
                  {copiedPhone ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                {/* Driver Taxi Reg */}
                {chatTarget.taxiReg && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="font-mono font-bold text-amber-300 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800 text-[11px]">
                      {chatTarget.taxiReg}
                    </span>
                  </>
                )}

                {/* Driver Car Name */}
                {chatTarget.carName && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="text-taxi-yellow font-bold text-[11px]">
                      {chatTarget.carName}
                    </span>
                  </>
                )}

                {/* Booking Ref */}
                {chatTarget.bookingRef && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      #{chatTarget.bookingRef}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* OpenWA Gateway Status Pill */}
            <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              waConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${waConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span>{waConnected ? 'OpenWA Live' : 'OpenWA Offline'}</span>
            </div>

            {/* Refresh History */}
            <button
              type="button"
              onClick={() => fetchHistory(chatTarget.phone)}
              disabled={loadingHistory}
              title="Refresh Message History"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin text-taxi-yellow' : ''}`} />
            </button>

            {/* External WhatsApp Web Link */}
            <a
              href={waWebFallbackUrl}
              target="_blank"
              rel="noreferrer"
              title="Open in WhatsApp Web"
              className="p-2 rounded-xl text-zinc-400 hover:text-[#25D366] hover:bg-zinc-800/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeChat}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Notification Banner if any */}
        {sendError && (
          <div className="px-4 py-2.5 bg-red-950/60 border-b border-red-800/50 flex items-center justify-between text-xs text-red-300 animate-in fade-in">
            <div className="flex items-center space-x-2 truncate">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="truncate">{sendError}</span>
            </div>
            <button
              type="button"
              onClick={() => setSendError('')}
              className="text-red-400 hover:text-white ml-2 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Message Log / Chat Bubble Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#0a0a0a]">
          {loadingHistory ? (
            <div className="h-full flex flex-col items-center justify-center text-xs text-zinc-500 space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin text-taxi-yellow" />
              <span>Loading WhatsApp history with {chatTarget.name}...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#25D366] shadow-inner">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">Direct OpenWA Chat</p>
                <p className="text-xs text-zinc-400 max-w-sm mt-1">
                  Start direct conversation with <strong className="text-white">{chatTarget.name}</strong> ({chatTarget.role}). 
                  Messages are sent instantly through your OpenWA WhatsApp gateway.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isSending = msg.status === 'SENDING';
              const isFailed = msg.status === 'FAILED';
              const timeStr = msg.sent_at 
                ? new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div key={msg.id || idx} className="flex justify-end animate-in fade-in duration-150">
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-md space-y-1.5 transition-all ${
                    isFailed
                      ? 'bg-red-950/70 border border-red-800 text-red-200'
                      : 'bg-emerald-950/80 border border-emerald-800/60 text-emerald-50'
                  }`}>
                    {/* Message Category Badge */}
                    <div className="flex items-center justify-between text-[10px] text-emerald-400/80 font-bold">
                      <span className="uppercase tracking-wider">
                        {msg.message_type?.replace(/_/g, ' ') || 'DIRECT CHAT'}
                      </span>
                    </div>

                    {/* Message Body */}
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words text-white">
                      {msg.content}
                    </p>

                    {/* Message Status & Timestamp */}
                    <div className="flex items-center justify-end space-x-1.5 text-[10px] text-zinc-400 pt-0.5">
                      <span>{timeStr}</span>
                      {isSending ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-taxi-yellow" />
                      ) : isFailed ? (
                        <span className="text-red-400 font-bold flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center space-x-0.5" title="Delivered via OpenWA">
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Sent</span>
                        </span>
                      )}
                    </div>

                    {/* Error detail if failed */}
                    {isFailed && msg.error_detail && (
                      <div className="text-[10px] text-red-300 font-mono bg-red-900/30 p-1.5 rounded border border-red-800/40">
                        {msg.error_detail}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-850 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-zinc-500 flex items-center space-x-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-taxi-yellow" />
            <span>Quick:</span>
          </span>
          {quickTemplates.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1 rounded-full border border-zinc-800 hover:border-zinc-700 whitespace-nowrap transition-all flex-shrink-0"
            >
              {tpl}
            </button>
          ))}
        </div>

        {/* Message Input & Send Bar */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-zinc-950 border-t border-zinc-850 space-y-2">
          <div className="flex items-end space-x-2.5">
            <div className="flex-1 bg-zinc-900/90 border border-zinc-800 focus-within:border-[#25D366] focus-within:ring-1 focus-within:ring-[#25D366] rounded-2xl p-2.5 transition-all">
              <textarea
                ref={textareaRef}
                rows={2}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Type message to ${chatTarget.name} (${chatTarget.role})... Press Enter to send`}
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 outline-none resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                <span>Enter to send • Shift + Enter for new line</span>
                <span>{messageText.length} / 2500</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className={`p-3.5 rounded-2xl font-bold flex items-center justify-center transition-all flex-shrink-0 shadow-lg ${
                messageText.trim() && !sending
                  ? 'bg-[#25D366] hover:bg-[#20ba59] text-black shadow-[#25D366]/20 cursor-pointer active:scale-95'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
              }`}
              title="Send via OpenWA WhatsApp"
            >
              {sending ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
