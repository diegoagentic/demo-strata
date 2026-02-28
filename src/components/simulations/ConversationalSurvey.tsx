import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    User,
    Bot,
    Sparkles,
    Smile,
    Frown,
    Meh,
    ThumbsUp,
    MessageSquare,
    RefreshCcw,
    Zap,
    Settings
} from 'lucide-react';

interface Message {
    id: number;
    text: string;
    sender: 'ai' | 'user';
    timestamp: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
}

export default function ConversationalSurvey() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! I'm the Strata Feedback Assistant. Based on your recent transactions in the Expert Hub, I'd love to hear about your experience with the AI validation process.",
            sender: 'ai',
            timestamp: '11:05 AM'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            let aiText = "Thank you for that feedback. I've noted your points about the discrepancy resolution speed. How would you rate the clarity of the AI insights provided?";
            let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';

            if (inputValue.toLowerCase().includes('great') || inputValue.toLowerCase().includes('good') || inputValue.toLowerCase().includes('easy')) {
                aiText = "That's wonderful to hear! We've been working on making those insights more actionable. Is there anything else you'd like to see improved?";
                sentiment = 'positive';
            } else if (inputValue.toLowerCase().includes('hard') || inputValue.toLowerCase().includes('slow') || inputValue.toLowerCase().includes('confusing')) {
                aiText = "I'm sorry to hear that. I've flagged this for our design team to review the interface clarity. Which specific section felt most confusing?";
                sentiment = 'negative';
            }

            const aiResponse: Message = {
                id: Date.now() + 1,
                text: aiText,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sentiment
            };

            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f1115] text-foreground font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-2xl h-[80vh] bg-white dark:bg-[#161b22] rounded-3xl shadow-2xl shadow-primary/5 border border-border/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                {/* Chat Header */}
                <header className="p-6 border-b border-border/50 flex items-center justify-between bg-white/50 dark:bg-muted/10 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Bot size={24} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-[#161b22]" />
                        </div>
                        <div>
                            <h2 className="font-black tracking-tight text-lg">Process Audit Assistant</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Online</span>
                                <span className="text-[10px] text-muted-foreground font-medium">• Sentiment Analysis Active</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground">
                            <RefreshCcw size={18} />
                        </button>
                        <button className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground">
                            <Settings size={18} />
                        </button>
                    </div>
                </header>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${msg.sender === 'ai' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted border-border text-muted-foreground'
                                    }`}>
                                    {msg.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className="space-y-1">
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'ai'
                                        ? 'bg-muted/40 dark:bg-muted/20 rounded-tl-none border border-border/30'
                                        : 'bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10 font-medium'
                                        }`}>
                                        {msg.text}
                                        {msg.sentiment && (
                                            <div className="mt-2 pt-3 border-t border-border/20 flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">Detected Sentiment:</span>
                                                {msg.sentiment === 'positive' && <Smile size={14} className="text-green-500" />}
                                                {msg.sentiment === 'negative' && <Frown size={14} className="text-red-500" />}
                                                {msg.sentiment === 'neutral' && <Meh size={14} className="text-blue-500" />}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[9px] font-bold text-muted-foreground block ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start animate-in fade-in duration-300">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-muted/40 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggested Actions */}
                <div className="px-6 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                    {['Everything is clear', 'Needs more detail', 'Resolution is slow'].map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => { setInputValue(suggestion); }}
                            className="whitespace-nowrap px-3 py-1.5 rounded-full border border-border/50 text-xs font-bold text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <footer className="p-6 pt-2">
                    <div className="relative group">
                        <input
                            id="survey-chat-input"
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your feedback here..."
                            className="w-full bg-muted/30 border border-border/50 rounded-2xl py-4 pl-12 pr-14 text-sm font-medium focus:outline-none focus:ring-2 ring-primary/20 focus:bg-background transition-all"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <MessageSquare size={18} />
                        </div>
                        <button
                            onClick={handleSend}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-[1.1] active:scale-[0.9] transition-all"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between px-2">
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <ThumbsUp size={16} className="cursor-pointer hover:text-primary transition-colors" />
                            <Sparkles size={16} className="cursor-pointer hover:text-primary transition-colors" />
                            <Zap size={16} className="cursor-pointer hover:text-primary transition-colors" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Powered by Strata Intelligence
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
