'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { messagesApi, Conversation, Message } from '@/lib/api/messages';
import { useAuth } from '@/contexts/AuthContext';
import { Send, ChevronLeft, Trash2, MoreVertical } from 'lucide-react';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await messagesApi.getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await messagesApi.getMessages(conversationId);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await messagesApi.markAsRead(conversationId);
      // Update unread count in conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      const response = await messagesApi.sendMessage({
        conversationId: selectedConversation.id,
        content: newMessage,
      });

      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        
        // Update conversation list with new last message
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id
              ? { ...conv, lastMessage: response.data, updatedAt: new Date().toISOString() }
              : conv
          ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        );
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== user?.id);
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-80 border-r p-4">
          <Skeleton className="h-12 w-full mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full mb-2" />
          ))}
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      {/* Conversations List */}
      <div className={`${
        showMobileList ? 'flex' : 'hidden'
      } md:flex w-full md:w-80 flex-col border-r absolute md:relative bg-white z-10 h-full`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            conversations.map((conversation) => {
              const other = getOtherParticipant(conversation);
              if (!other) return null;
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    setShowMobileList(false);
                  }}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {other.firstName?.[0]}{other.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium truncate">
                        {other.firstName} {other.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage?.content}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className={`${
        !showMobileList ? 'flex' : 'hidden'
      } md:flex flex-1 flex-col h-full`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setShowMobileList(true)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                {(() => {
                  const other = getOtherParticipant(selectedConversation);
                  return other ? (
                    <>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {other.firstName?.[0]}{other.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {other.firstName} {other.lastName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Conversation started {formatTime(selectedConversation.createdAt)}
                        </p>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  if (confirm('Delete this conversation?')) {
                    try {
                      await messagesApi.deleteConversation(selectedConversation.id);
                      setConversations(prev => 
                        prev.filter(c => c.id !== selectedConversation.id)
                      );
                      setSelectedConversation(null);
                      setShowMobileList(true);
                      toast.success('Conversation deleted');
                    } catch (error) {
                      toast.error('Failed to delete conversation');
                    }
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatTime(message.createdAt)}
                        {message.read && isOwn && (
                          <span className="ml-2">✓ Read</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[60px] max-h-[120px]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}