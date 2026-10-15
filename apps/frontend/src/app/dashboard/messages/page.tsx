'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { format, isToday, isYesterday } from 'date-fns';
import { Search, Send, Check, CheckCheck, ArrowLeft, MoreVertical, MessageSquare } from 'lucide-react';
import { messagesApi, Conversation, Message } from '@/lib/api/messages';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function convTime(d: string) {
  const date = new Date(d);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}
function msgTime(d: string) { return format(new Date(d), 'HH:mm'); }
function initials(f?: string, l?: string) { return `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase() || '?'; }

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesApi.getConversations()
      .then(r => { if (r.success) setConversations(r.data); })
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    messagesApi.getMessages(selected.id)
      .then(r => { if (r.success) setMessages(r.data); })
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoadingMsgs(false));
    messagesApi.markAsRead(selected.id).then(() => {
      setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, unreadCount: 0 } : c));
    });
  }, [selected?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getOther = (c: Conversation) => c.participants.find(p => p.id !== user?.id);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = newMsg.trim();
    if (!content || !selected || sending) return;
    const other = getOther(selected);
    if (!other) return;

    const optimisticId = `opt-${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      conversationId: selected.id,
      senderId: user?.id || '',
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setNewMsg('');
    setSending(true);

    try {
      const res = await messagesApi.sendMessage({
        conversationId: selected.id,
        recipientId: other.id,
        content,
      });
      if (res.success) {
        setMessages(prev => prev.map(m => m.id === optimisticId ? res.data : m));
        messagesApi.getConversations().then(r => { if (r.success) setConversations(r.data); });
      }
    } catch (err: any) {
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      setNewMsg(content);
      toast.error(err?.response?.data?.error || 'Failed to send');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filtered = conversations.filter(c => {
    if (!search) return true;
    const o = getOther(c);
    return `${o?.firstName} ${o?.lastName}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="-m-4 md:-m-8 h-[calc(100vh-4rem)] flex bg-white rounded-none md:rounded-xl border overflow-hidden">
      {/* Conversation list */}
      <div className={cn(
        'w-full md:w-80 border-r flex flex-col h-full bg-white',
        selected && 'hidden md:flex'
      )}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 border-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center px-6">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                <MessageSquare className="w-7 h-7 text-slate-300" />
              </div>
              <p className="font-semibold text-slate-700 text-sm">
                {search ? 'No results' : 'No messages yet'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {search ? 'Try a different name' : 'Messages appear when you book or get booked'}
              </p>
            </div>
          ) : (
            filtered.map(conv => {
              const other = getOther(conv);
              if (!other) return null;
              const isActive = selected?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => { setSelected(conv); setShowMobileList(false); }}
                  className={cn(
                    'p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-slate-50',
                    isActive ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-slate-50'
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                      {initials(other.firstName, other.lastName)}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn('text-sm font-bold truncate', conv.unreadCount > 0 ? 'text-slate-900' : 'text-slate-700')}>
                        {other.firstName} {other.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">{convTime(conv.updatedAt)}</span>
                    </div>
                    <p className={cn('text-xs truncate', conv.unreadCount > 0 ? 'text-slate-700 font-medium' : 'text-slate-400')}>
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat */}
      <div className={cn(
        'flex-1 flex flex-col h-full bg-slate-50',
        !selected ? 'hidden md:flex items-center justify-center' : 'flex'
      )}>
        {selected ? (() => {
          const other = getOther(selected);
          return (
            <>
              {/* Chat header */}
              <div className="h-16 border-b bg-white flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelected(null)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {other && (
                    <>
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                        {initials(other.firstName, other.lastName)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{other.firstName} {other.lastName}</h4>
                      </div>
                    </>
                  )}
                </div>
                <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMsgs ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-end' : 'justify-start')}>
                        <div className={cn('h-10 rounded-2xl animate-pulse bg-slate-200', i % 2 === 0 ? 'w-48' : 'w-56')} />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                      <MessageSquare className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">Start the conversation</p>
                    <p className="text-xs text-slate-400 mt-1">Say hello to {other?.firstName}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <span className="text-[10px] px-3 py-1 bg-slate-200 text-slate-500 rounded-full">Today</span>
                    </div>
                    {messages.map(msg => {
                      const isOwn = msg.senderId === user?.id;
                      const isOptimistic = msg.id.startsWith('opt-');
                      return (
                        <div
                          key={msg.id}
                          className={cn('flex flex-col max-w-[75%]', isOwn ? 'ml-auto items-end' : 'items-start')}
                        >
                          <div className={cn(
                            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                            isOwn
                              ? `bg-primary text-white rounded-tr-sm ${isOptimistic ? 'opacity-60' : ''}`
                              : 'bg-white text-slate-900 rounded-tl-sm border shadow-sm'
                          )}>
                            {msg.content}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-slate-400">{msgTime(msg.createdAt)}</span>
                            {isOwn && (
                              <span className={msg.read ? 'text-blue-400' : 'text-slate-400'}>
                                {msg.read
                                  ? <CheckCheck className="w-3 h-3" />
                                  : <Check className="w-3 h-3" />}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t shrink-0">
                <form onSubmit={handleSend} className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send)"
                    rows={1}
                    className="flex-1 resize-none px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all max-h-28"
                  />
                  <button
                    type="submit"
                    disabled={!newMsg.trim() || sending}
                    className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center shrink-0 disabled:opacity-50 transition-colors"
                  >
                    {sending
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </>
          );
        })() : (
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Select a conversation</h3>
            <p className="text-slate-500 text-sm mt-1">Pick one from the list to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
