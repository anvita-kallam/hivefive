import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { useAuthStore } from '../store/authStore';
import { format, formatDistanceToNow } from 'date-fns';
import { Send, Smile, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '🐝'];

function BuzzChat({ hiveId }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch chat messages with better deduplication
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat', hiveId],
    queryFn: async () => {
      const response = await api.get(`/chat/${hiveId}`);
      const messageList = response.data || [];
      
      // Deduplicate messages by _id (string comparison)
      const seen = new Set();
      const uniqueMessages = messageList.filter(msg => {
        if (!msg._id) return false;
        const id = typeof msg._id === 'string' ? msg._id : msg._id.toString();
        if (seen.has(id)) {
          return false;
        }
        seen.add(id);
        return true;
      });
      
      // Also deduplicate by content + timestamp + sender as fallback
      const contentSeen = new Set();
      return uniqueMessages.filter(msg => {
        const contentKey = `${msg.message}-${msg.timestamp}-${msg.sender?._id || 'buzz'}-${msg.isBuzzMessage}`;
        if (contentSeen.has(contentKey)) {
          return false;
        }
        contentSeen.add(contentKey);
        return true;
      });
    },
    refetchInterval: 3000, // Poll every 3 seconds for new messages
    enabled: !!hiveId,
    staleTime: 1000 // Consider data stale after 1 second
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, eventId, mentions }) => {
      const response = await api.post(`/chat/${hiveId}`, {
        message,
        eventId: eventId || null,
        mentions: mentions || []
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch messages to get both user and Buzz messages
      queryClient.invalidateQueries(['chat', hiveId]);
      setMessage('');
      setShowEmojiPicker(false);
      
      // Scroll to bottom after message is sent
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      alert(error.response?.data?.error || 'Failed to send message');
    }
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }) => {
      const response = await api.post(`/chat/${hiveId}/messages/${messageId}/reactions`, {
        emoji
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat', hiveId]);
    }
  });

  // Clear chat mutation
  const clearChatMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/chat/${hiveId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat', hiveId]);
      setShowClearConfirm(false);
    },
    onError: (error) => {
      console.error('Error clearing chat:', error);
      alert(error.response?.data?.error || 'Failed to clear chat');
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isLoading) return;

    sendMessageMutation.mutate({
      message: message.trim(),
      eventId: null,
      mentions: []
    });
  };

  const handleAddReaction = (messageId, emoji) => {
    addReactionMutation.mutate({ messageId, emoji });
  };

  const handleMentionBuzz = () => {
    setMessage(prev => prev ? `${prev} @Buzz ` : '@Buzz ');
    inputRef.current?.focus();
  };

  return (
    <div className="honey-card p-4 flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2D1B00]/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C17D3A]" />
          <h3 className="text-[#2D1B00] font-medium text-lg">Buzz Chat</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMentionBuzz}
            className="text-sm text-[#C17D3A] hover:text-[#6B4E00] font-medium transition-colors"
          >
            @Buzz
          </button>
          {messages.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-1.5 text-[#6B4E00] hover:text-[#C17D3A] hover:bg-[rgba(193,125,58,0.1)] rounded transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Clear Chat Confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-[rgba(245,230,211,0.8)] border border-[#C17D3A]/30 rounded-lg"
          >
            <p className="text-sm text-[#2D1B00] mb-2">
              Are you sure you want to clear all messages? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => clearChatMutation.mutate()}
                disabled={clearChatMutation.isLoading}
                className="px-3 py-1.5 bg-[#C17D3A] hover:bg-[#6B4E00] text-white text-sm rounded transition-colors disabled:opacity-50"
              >
                {clearChatMutation.isLoading ? 'Clearing...' : 'Clear Chat'}
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={clearChatMutation.isLoading}
                className="px-3 py-1.5 bg-[rgba(45,27,0,0.1)] hover:bg-[rgba(45,27,0,0.2)] text-[#2D1B00] text-sm rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
        {isLoading ? (
          <div className="text-center text-[#6B4E00] py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-[#6B4E00] py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-2 text-[#C17D3A] opacity-50" />
            <p>No messages yet. Start the conversation!</p>
            <p className="text-sm mt-2">Try mentioning @Buzz to get help with event planning 🐝</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              currentUserId={user?._id}
              onAddReaction={handleAddReaction}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message... (mention @Buzz for help)"
            className="w-full px-4 py-2 border border-[#2D1B00]/20 rounded-lg bg-[rgba(255,249,230,0.6)] text-[#2D1B00] focus:outline-none focus:ring-2 focus:ring-[#C17D3A]/50"
            disabled={sendMessageMutation.isLoading}
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6B4E00] hover:text-[#2D1B00] transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>
        <button
          type="submit"
          disabled={!message.trim() || sendMessageMutation.isLoading}
          className="px-4 py-2 bg-[rgba(193,125,58,0.8)] hover:bg-[rgba(193,125,58,0.9)] text-[#2D1B00] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 p-2 bg-[rgba(245,230,211,0.8)] rounded-lg border border-[#2D1B00]/20"
          >
            <div className="flex flex-wrap gap-2">
              {EMOJI_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MessageBubble({ message, currentUserId, onAddReaction }) {
  const isBuzz = message.isBuzzMessage;
  const isCurrentUser = !isBuzz && message.sender && message.sender._id?.toString() === currentUserId?.toString();
  const [showReactions, setShowReactions] = useState(false);

  // Handle reactions - can be Map or plain object
  let reactions = [];
  if (message.reactions && typeof message.reactions === 'object') {
    if (message.reactions instanceof Map) {
      reactions = Array.from(message.reactions.entries());
    } else {
      reactions = Object.entries(message.reactions);
    }
  }
  
  // Filter out empty reaction arrays
  reactions = reactions.filter(([emoji, userIds]) => 
    Array.isArray(userIds) ? userIds.length > 0 : userIds
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isBuzz ? (
          <div className="w-8 h-8 rounded-full bg-[#C17D3A] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        ) : message.sender?.profilePhoto ? (
          <img
            src={message.sender.profilePhoto}
            alt={message.sender.name}
            className="w-8 h-8 rounded-full object-cover border-2 border-[#C17D3A]/30"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#C17D3A]/30 flex items-center justify-center text-[#2D1B00] text-sm font-medium">
            {message.sender?.name?.[0] || 'U'}
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
            isBuzz
              ? 'bg-[rgba(193,125,58,0.2)] border border-[#C17D3A]/30'
              : isCurrentUser
              ? 'bg-[rgba(193,125,58,0.6)] text-[#2D1B00]'
              : 'bg-[rgba(245,230,211,0.6)] text-[#2D1B00]'
          }`}
        >
          {/* Sender name */}
          {!isCurrentUser && (
            <div className="text-xs font-medium text-[#6B4E00] mb-1">
              {isBuzz ? 'Buzz 🐝' : message.sender?.name || 'Unknown'}
            </div>
          )}

          {/* Message text */}
          <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>

          {/* Timestamp */}
          <div className="text-xs text-[#6B4E00] opacity-70 mt-1">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </div>

          {/* Reactions */}
          {reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {reactions.map(([emoji, userIds]) => (
                <button
                  key={emoji}
                  onClick={() => onAddReaction(message._id, emoji)}
                  className="px-2 py-1 bg-white/50 rounded-full text-xs hover:bg-white/70 transition-colors flex items-center gap-1"
                >
                  <span>{emoji}</span>
                  <span className="text-[#6B4E00]">{userIds.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reaction button */}
        <button
          onClick={() => setShowReactions(!showReactions)}
          className="text-xs text-[#6B4E00] hover:text-[#2D1B00] mt-1 transition-colors"
        >
          {reactions.length > 0 ? 'Add reaction' : 'React'}
        </button>

        {/* Reaction picker */}
        {showReactions && (
          <div className="mt-1 p-2 bg-white/80 rounded-lg border border-[#2D1B00]/20 flex gap-2">
            {EMOJI_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onAddReaction(message._id, emoji);
                  setShowReactions(false);
                }}
                className="text-xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default BuzzChat;

