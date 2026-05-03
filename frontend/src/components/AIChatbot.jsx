import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, Send, Bot, User, Sparkles, Zap, Trash2, 
    RotateCcw, ChevronDown, Wifi, WifiOff, AlertCircle
} from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            id: "welcome",
            role: "bot", 
            text: "👋 Welcome! I'm your AI Shopping Assistant powered by Groq AI.\n\nI can help you with:\n• 🛍️ Product recommendations\n• 📦 Order tracking\n• 📏 Size guides\n• 💰 Deals & discounts\n• 🔄 Returns & refunds\n\nWhat can I help you with today?" 
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [errorDetails, setErrorDetails] = useState(null);
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const [showScrollButton, setShowScrollButton] = useState(false);
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const chatWindowRef = useRef(null); // ✅ Chat window ka ref

    const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const scrollToBottom = useCallback((behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, scrollToBottom]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // ✅ Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && 
                chatWindowRef.current && 
                !chatWindowRef.current.contains(event.target) &&
                !event.target.closest('.chatbot-trigger')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Check backend connection
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const res = await axios.get("/chatbot/health", { timeout: 5000 });
                console.log("✅ Backend connected:", res.data);
                setIsOnline(true);
                setErrorDetails(null);
            } catch (err) {
                console.error("❌ Backend not connected:", err.message);
                setIsOnline(false);
                setErrorDetails(err.message);
            }
        };
        checkConnection();
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleScroll = useCallback(() => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
        }
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        const messageId = generateId();
        setInput("");
        setErrorDetails(null);
        
        setMessages(prev => [...prev, { 
            id: messageId, 
            role: "user", 
            text: userMessage,
            timestamp: new Date().toISOString()
        }]);
        
        setLoading(true);

        try {
            console.log("📤 Sending to backend:", userMessage);
            
            const res = await axios.post("/chatbot/chat", {
                message: userMessage,
                sessionId: sessionId
            }, { 
                timeout: 20000,
                headers: { 'Content-Type': 'application/json' }
            });

            console.log("📥 Response from backend:", res.data);

            if (res.data?.success && res.data?.response) {
                setMessages(prev => [...prev, { 
                    id: generateId(),
                    role: "bot", 
                    text: res.data.response,
                    timestamp: new Date().toISOString()
                }]);
                setIsOnline(true);
            } else {
                throw new Error(res.data?.error || "Invalid response from server");
            }
        } catch (error) {
            console.error("❌ Full error:", error);
            
            let errorMessage = "Sorry, I'm having trouble right now. ";
            let details = "";
            
            if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
                errorMessage += "Cannot connect to server. Please check if backend is running. 🌐";
                details = "Backend not reachable";
                setIsOnline(false);
            } else if (error.response?.status === 404) {
                errorMessage += "Chat service not found. Please check server setup. 🔧";
                details = "Route not found (404)";
            } else if (error.response?.status === 500) {
                errorMessage += "Server error. Please try again. 🔧";
                details = error.response?.data?.details || "Internal server error";
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
                details = error.response.data.details || "";
            } else {
                errorMessage += "Please try again. 🤖";
                details = error.message;
            }

            setErrorDetails(details);
            setMessages(prev => [...prev, { 
                id: generateId(),
                role: "bot", 
                text: errorMessage,
                isError: true,
                timestamp: new Date().toISOString()
            }]);
            
            toast.error("Connection issue: " + details);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = async () => {
        try {
            await axios.post("/chatbot/clear", { sessionId });
        } catch (e) { /* ignore */ }
        
        setMessages([
            { 
                id: generateId(),
                role: "bot", 
                text: "👋 Chat cleared! How can I help you today?" 
            }
        ]);
        setErrorDetails(null);
        toast.success("Chat history cleared");
    };

    const quickSuggestions = [
        { icon: "🔥", text: "Today's Deals" },
        { icon: "💻", text: "Best Laptops" },
        { icon: "📱", text: "Top Phones" },
        { icon: "👗", text: "Fashion Sale" },
        { icon: "🎁", text: "Gift Ideas" },
        { icon: "📦", text: "Track Order" }
    ];

    const handleSuggestionClick = (text) => {
        setInput(text);
        inputRef.current?.focus();
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed z-[9999] flex items-center justify-center chatbot-trigger"
                style={{ 
                    bottom: '100px',
                    right: '24px' 
                }}
            >
                <div className={`
                    relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl
                    ${isOpen 
                        ? 'bg-[#880E4F]' 
                        : 'bg-gradient-to-br from-[#C2185B] via-[#E91E63] to-[#F8BBD9]'
                    }
                    transition-all duration-300 border-2 border-white/30 backdrop-blur-sm
                `}>
                    {!isOpen && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-[#C2185B] animate-ping opacity-20"></div>
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#F8BBD9] to-[#C2185B] rounded-full blur opacity-40 animate-pulse"></div>
                        </>
                    )}
                    
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative z-10"
                    >
                        {isOpen ? (
                            <X size={24} className="text-white" />
                        ) : (
                            <div className="relative">
                                <Sparkles size={24} className="text-white" />
                                {!isOnline && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></span>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {!isOpen && messages.length <= 1 && (
                        <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#C2185B] to-[#880E4F] rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-lg"
                        >
                            AI
                        </motion.span>
                    )}
                </div>

                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: 2 }}
                        className="absolute right-16 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl text-[#880E4F] text-sm px-4 py-2.5 rounded-xl whitespace-nowrap border border-[#F8BBD9]/30 shadow-xl"
                    >
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-[#C2185B]" />
                            <span className="font-medium">Ask AI Assistant</span>
                        </div>
                        <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-b border-[#F8BBD9]/30 rotate-[-45deg]"></div>
                    </motion.div>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={chatWindowRef} // ✅ Ref add kiya
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed z-[9998] flex flex-col overflow-hidden border border-[#F8BBD9]/30 shadow-2xl"
                        style={{ 
                            bottom: '170px',
                            right: '24px',
                            width: '380px',
                            maxWidth: 'calc(100vw - 3rem)',
                            height: '550px',
                            maxHeight: '70vh',
                            borderRadius: '20px',
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(20px)'
                        }}
                    >
                        {/* Header */}
                        <div className="relative p-3 flex items-center gap-3 shrink-0 overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, rgba(194, 24, 91, 0.95), rgba(136, 14, 79, 0.95))'
                            }}
                        >
                           
                            
                            <div className="relative">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                                    <Bot size={22} className="text-white" />
                                </div>
                                <motion.span 
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#C2185B]"
                                ></motion.span>
                            </div>
                            <div className="relative flex-1">
                                <h3 className="font-bold text-white text-sm">AI Shopping Assistant</h3>
                                <div className="flex items-center gap-1.5 text-white/80 text-xs">
                                    {isOnline ? (
                                        <>
                                            <Wifi size={10} className="text-green-400" />
                                            <span>Online • Groq AI</span>
                                        </>
                                    ) : (
                                        <>
                                            <WifiOff size={10} className="text-yellow-400" />
                                            <span>Offline • {errorDetails || "Check console"}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={handleClearChat}
                                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                                    title="Clear chat"
                                >
                                    <Trash2 size={14} className="text-white" />
                                </button>
                                {/* ✅ Close Button - Active */}
                               <button 
    onClick={() => setIsOpen(false)}
    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors active:scale-95"
    title="Close chat"
>
    <X size={18} className="text-white" />
</button>
                            </div>
                        </div>

                        {/* Error Banner */}
                        {errorDetails && (
                            <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2">
                                <AlertCircle size={14} className="text-red-500 shrink-0" />
                                <p className="text-xs text-red-600 truncate">{errorDetails}</p>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div 
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-3 space-y-3 relative"
                            style={{ background: 'linear-gradient(180deg, rgba(255, 245, 247, 0.6), rgba(255, 255, 255, 0.4))' }}
                        >
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id || idx}
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.role === "bot" && (
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1 border ${
                                            msg.isError 
                                                ? "bg-red-100 border-red-200" 
                                                : "bg-gradient-to-br from-[#C2185B]/20 to-[#F8BBD9]/20 border-[#F8BBD9]/30"
                                        }`}>
                                            {msg.isError ? (
                                                <AlertCircle size={14} className="text-red-500" />
                                            ) : (
                                                <Bot size={14} className="text-[#C2185B]" />
                                            )}
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] ${
                                        msg.role === "user" 
                                            ? "bg-gradient-to-br from-[#C2185B] to-[#880E4F] text-white rounded-br-md shadow-md" 
                                            : msg.isError 
                                                ? "bg-red-50 border-red-200 text-red-800 rounded-bl-md"
                                                : "bg-white/80 backdrop-blur-sm text-[#2D2D2D] rounded-bl-md border border-[#F8BBD9]/30 shadow-sm"
                                    } p-3 rounded-xl text-sm leading-relaxed whitespace-pre-line`}>
                                        {msg.text}
                                        {msg.timestamp && (
                                            <div className={`text-[10px] mt-1 text-right ${msg.role === "user" ? "text-white/60" : "text-gray-400"}`}>
                                                {formatTime(msg.timestamp)}
                                            </div>
                                        )}
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="w-7 h-7 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-lg flex items-center justify-center shrink-0 mt-1 shadow-md">
                                            <User size={14} className="text-white" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-2 items-center"
                                >
                                    <div className="w-7 h-7 bg-gradient-to-br from-[#C2185B]/20 to-[#F8BBD9]/20 rounded-lg flex items-center justify-center shrink-0 border border-[#F8BBD9]/30">
                                        <Bot size={14} className="text-[#C2185B]" />
                                    </div>
                                    <div className="bg-white/80 backdrop-blur-sm border border-[#F8BBD9]/30 rounded-xl rounded-bl-md p-3 flex items-center gap-2 shadow-sm">
                                        <div className="flex gap-1">
                                            <motion.div 
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                className="w-1.5 h-1.5 bg-[#C2185B] rounded-full"
                                            />
                                            <motion.div 
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                                className="w-1.5 h-1.5 bg-[#C2185B] rounded-full"
                                            />
                                            <motion.div 
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                                className="w-1.5 h-1.5 bg-[#C2185B] rounded-full"
                                            />
                                        </div>
                                        <span className="text-gray-500 text-xs">AI is thinking...</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Scroll to bottom button */}
                        <AnimatePresence>
                            {showScrollButton && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    onClick={() => scrollToBottom()}
                                    className="absolute bottom-20 right-4 w-7 h-7 bg-[#C2185B] text-white rounded-full shadow-lg flex items-center justify-center z-10"
                                >
                                    <ChevronDown size={14} />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Quick Suggestions */}
                        {messages.length <= 2 && !loading && (
                            <div className="px-3 py-2 bg-white/60 backdrop-blur-md border-t border-[#F8BBD9]/20 shrink-0">
                                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                    <Sparkles size={10} className="text-[#C2185B]" />
                                    Quick Questions
                                </p>
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {quickSuggestions.map((suggestion, idx) => (
                                        <motion.button
                                            key={idx}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleSuggestionClick(suggestion.text)}
                                            className="whitespace-nowrap px-3 py-1.5 bg-white/80 backdrop-blur-sm hover:bg-[#FFF5F7] border border-[#F8BBD9]/40 hover:border-[#C2185B]/50 rounded-lg text-xs text-[#880E4F] transition-all shadow-sm hover:shadow-md font-medium flex items-center gap-1.5"
                                        >
                                            <span>{suggestion.icon}</span>
                                            {suggestion.text}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-white/80 backdrop-blur-xl border-t border-[#F8BBD9]/20 shrink-0">
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={isOnline ? "Ask me anything..." : "Offline - check connection"}
                                        disabled={loading}
                                        className="w-full bg-[#FFF5F7]/80 backdrop-blur-sm border border-[#F8BBD9]/40 rounded-lg px-3 py-2.5 pr-8 text-[#2D2D2D] placeholder-gray-400 focus:outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#C2185B]/10 transition-all text-sm disabled:opacity-50"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                handleSend(e);
                                            }
                                        }}
                                    />
                                    {input && !loading && (
                                        <button
                                            type="button"
                                            onClick={() => setInput("")}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C2185B] transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                                <motion.button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 bg-gradient-to-br from-[#C2185B] to-[#880E4F] hover:from-[#880E4F] hover:to-[#C2185B] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center justify-center shadow-md disabled:shadow-none"
                                >
                                    <Send size={16} className={loading ? "opacity-50" : ""} />
                                </motion.button>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                                <p className="text-[9px] text-gray-400 flex items-center gap-1">
                                    <Sparkles size={8} />
                                    {isOnline ? "Powered by Groq AI" : "Offline mode"}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleClearChat}
                                    className="text-[9px] text-gray-400 hover:text-[#C2185B] transition-colors flex items-center gap-1"
                                >
                                    <RotateCcw size={8} />
                                    Reset Chat
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatbot;