import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  "Make me look more confident",
  "Adjust lighting to be warmer",
  "Fix hair flyaways",
  "Make background blurred office",
  "Center my eyes",
  "Add a friendly smile"
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Optional: auto-submit
    // onSendMessage(suggestion); 
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs font-medium text-slate-500">
         <Sparkles className="w-3 h-3 text-indigo-500" />
         <span>AI Refinement Assistant</span>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
               <Bot className="w-6 h-6 text-indigo-500 opacity-75" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">How can I improve this?</p>
            <p className="text-xs text-slate-500 mb-6 max-w-[240px]">
              Describe specific changes you want to see in the generated headshot.
            </p>
            
            <div className="w-full max-w-xs space-y-2">
               <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Try asking for:</p>
               <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full transition-all shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                  }`}
                >
                  {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                 </div>
                 <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-none px-4 py-2 text-sm shadow-sm flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Thinking...
                 </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-100">
        {/* Quick Chips (only visible if messages exist to keep context) */}
        {messages.length > 0 && !isLoading && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-1 scrollbar-hide mask-fade">
               {SUGGESTIONS.slice(0, 4).map((suggestion, idx) => (
                   <button 
                     key={idx} 
                     onClick={() => handleSuggestionClick(suggestion)}
                     className="whitespace-nowrap text-[10px] bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-2 py-1 rounded-md border border-slate-200 transition-colors"
                   >
                     {suggestion}
                   </button>
               ))}
            </div>
        )}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., 'Make me smile' or 'Darker background'"
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};