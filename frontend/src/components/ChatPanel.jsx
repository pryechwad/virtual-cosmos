import { useState, useEffect, useRef } from 'react';

export default function ChatPanel({ socket, selfId, connectedUser, connectedUserData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const prevConnectedRef = useRef(null);

  // Show/hide chat based on connection
  useEffect(() => {
    if (connectedUser) {
      setIsVisible(true);
      // Clear messages when connecting to a new user
      if (prevConnectedRef.current !== connectedUser) {
        setMessages([]);
      }
    } else {
      // Delay hide for smooth animation
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
    prevConnectedRef.current = connectedUser;
  }, [connectedUser]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      setMessages((prev) => [...prev.slice(-50), data]);
    };

    socket.on('chat:message', handleMessage);
    return () => socket.off('chat:message', handleMessage);
  }, [socket]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !connectedUser) return;
    socket.emit('chat:message', {
      to: connectedUser,
      message: input.trim(),
    });
    setInput('');
  };

  const handleKeyDown = (e) => {
    e.stopPropagation(); // Prevent movement while typing
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isVisible && !connectedUser) return null;

  return (
    <div
      className={`fixed top-0 bottom-0 right-0 w-[420px] bg-white z-30 transition-all duration-300 ease-in-out shadow-2xl flex flex-col border-l border-gray-200
        ${connectedUser ? 'translate-x-0' : 'translate-x-[420px] pointer-events-none'}`}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
        <div className="relative">
          {connectedUserData && (
            <img
              src={connectedUserData.avatarUrl}
              alt=""
              className="w-12 h-12 rounded-full border border-gray-300 bg-white"
            />
          )}
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-gray-900 truncate">
            {connectedUserData?.username || 'User'}
          </div>
          <div className="text-xs text-green-600 font-medium">
            Proximity Connected
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-60">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <span className="font-semibold text-slate-700 text-sm">Proximity Connected</span>
            <span className="text-xs text-slate-500 mt-1 max-w-[200px] text-center leading-relaxed">
              You are now in range. Say hi to start the conversation.
            </span>
          </div>
        )}
        {messages.map((msg, i) => {
          const isSelf = msg.from === selfId;
          return (
            <div key={i} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 text-[14px] shadow-sm
                ${isSelf
                  ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-sm'
                }`}
              >
                {!isSelf && (
                  <div className="text-xs font-semibold text-gray-500 mb-0.5">
                    {msg.fromUsername}
                  </div>
                )}
                <div style={{ wordBreak: 'break-word' }}>{msg.message}</div>
                <div className="text-[11px] text-gray-500 flex justify-end mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2 relative">
          
          {/* Custom Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="absolute bottom-14 left-0 bg-white border border-slate-200 shadow-xl rounded-2xl p-3 w-64 z-50">
              <div className="flex flex-wrap gap-2">
                {['😀', '😂', '🥹', '😍', '😎', '🙏', '👍', '🔥', '🎉', '💯', '✨', '🚀', '👀', '💡', '👋', '🤔'].map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => {
                      setInput(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-xl hover:bg-slate-100 p-1.5 rounded-lg transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`transition ${showEmojiPicker ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            title="Emoji"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <label className="text-slate-400 hover:text-slate-600 transition cursor-pointer" title="Attach file">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <input type="file" className="hidden" onChange={(e) => {
              if (e.target.files[0]) {
                setInput(`[Attachment: ${e.target.files[0].name}] ` + input);
              }
            }} />
          </label>

          <label className="text-slate-400 hover:text-slate-600 transition cursor-pointer" title="Camera">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
              if (e.target.files[0]) {
                setInput(`[Camera Image: ${e.target.files[0].name}] ` + input);
              }
            }} />
          </label>

          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => window.dispatchEvent(new CustomEvent('chat:focus'))}
            onBlur={() => window.dispatchEvent(new CustomEvent('chat:blur'))}
            placeholder="Write a message..."
            className="flex-1 bg-slate-100 border border-transparent rounded-full px-4 py-2 outline-none 
                       focus:border-indigo-500 focus:bg-white transition-all text-[14px] text-slate-800 ml-1"
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className={`p-2 rounded-full transition-all duration-200 
              ${input.trim() ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
