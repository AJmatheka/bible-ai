import React, { useState, useEffect, useRef } from 'react';
import { Send, Layers, User, Search, X, Plus } from 'lucide-react';

// Types for Scripture API results
export interface ScriptureResult {
  id: string;
  reference: string;
  content: string;
}

// Types for chat messages
interface UserMessage {
  type: 'user';
  text: string;
}

interface BotMessage {
  type: 'bot';
  results: ScriptureResult[];
  text?: string; // For conversational AI responses
  error?: string | null;
  commentary?: string;
}

export type ChatMessage = UserMessage | BotMessage;

// Props for the component
export interface ChatInterfaceProps {
  onSend: (message: string) => void;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  isChatActive: boolean;
  onNewChat: () => void;
  statusMessage: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSend, chatHistory, isLoading, isChatActive, onNewChat, statusMessage }) => {
  const [message, setMessage] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'voice'>('chat');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    onSend(trimmedMessage);

    if (!searchHistory.includes(trimmedMessage)) {
      setSearchHistory(prev => [trimmedMessage, ...prev]);
    }
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleHistoryClick = (term: string) => {
    setMessage(term);
    setShowHistory(false);
  };



  return (
    <div className={`bg-white flex flex-col h-full ${isChatActive ? 'rounded-t-3xl shadow-2xl' : ''}`}>
      {/* Chat History */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatHistory.map((chat, index) => (
          <div key={index}>
            {chat.type === 'user' ? (
              <div className="flex justify-end">
                <p className="bg-gray-900 text-white rounded-lg py-2 px-4 inline-block max-w-md">{chat.text}</p>
              </div>
            ) : (
              <div>
                {chat.error && <p className="text-red-500 text-center py-2">{chat.error}</p>}
                {chat.text && (
                  <div className="prose prose-sm max-w-none text-gray-700">
                     <p className="whitespace-pre-wrap">{chat.text}</p>
                  </div>
                )}

                {chat.results.length > 0 && (
                  <div className="space-y-4 mt-4">
                    {chat.results.map((passage) => (
                      <div key={passage.id} className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="font-bold text-gray-800 mb-2">{passage.reference}</h3>
                        <div
                          className="prose prose-sm max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ __html: passage.content }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Render AI Commentary */}
                {chat.commentary && (
                  <div className="mt-4 p-4 border rounded-lg bg-orange-50 border-orange-200">
                    <h4 className="font-bold text-orange-800 mb-2">Theological Commentary</h4>
                    <div className="prose prose-sm max-w-none text-orange-900">
                      <p className="whitespace-pre-wrap">{chat.commentary}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {(isLoading || statusMessage) && (
          <div className="flex justify-center pt-4">
            <p className="text-gray-500 animate-pulse">{statusMessage || 'Searching...'}</p>
          </div>
        )}
      </div>

      {/* Chat Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 relative">
        {showHistory && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border rounded-lg shadow-lg p-4 z-10 max-h-60 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-800">Search History</h3>
              <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-200 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            <ul className="space-y-1">
              {searchHistory.length > 0 ? (
                searchHistory.map((term, i) => (
                  <li key={i} className="cursor-pointer hover:bg-gray-100 p-2 rounded text-gray-700" onClick={() => handleHistoryClick(term)}>{term}</li>
                ))
              ) : (
                <li className="text-gray-500 p-2">No history yet.</li>
              )}
            </ul>
          </div>
        )}
        
        <div className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => isChatActive && setShowHistory(true)}
            placeholder={isChatActive ? "Search for a verse or topic..." : "Start a new chat..."}
            className="w-full bg-gray-100 rounded-full py-4 pl-12 pr-16 text-gray-700 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-custom focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <button 
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              className="bg-gray-900 p-2 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between pt-4">
            {/* Toggle Buttons */}
            <div className="bg-gray-900 rounded-full p-1 flex">
                <button 
                    className={`p-3 rounded-full transition-all duration-200 ${ 
                    activeMode === 'chat' 
                        ? 'bg-white text-gray-900' 
                        : 'text-white hover:bg-gray-800'
                    }`}
                    onClick={() => {
                        setActiveMode('chat');
                        setShowHistory(prev => !prev);
                    }}
                >
                    <Layers className="w-5 h-5" />
                </button>
                <button 
                    className={`p-3 rounded-full transition-all duration-200 ${ 
                    activeMode === 'voice' 
                        ? 'bg-white text-gray-900' 
                        : 'text-white hover:bg-gray-800'
                    }`}
                    onClick={() => setActiveMode('voice')}
                >
                    <User className="w-5 h-5" />
                </button>
            </div>

            {/* New Chat Button */}
            <button
                onClick={onNewChat}
                className="bg-gray-900 p-3 rounded-full hover:bg-gray-800 transition-colors shadow-lg"
            >
                <Plus className="w-5 h-5 text-white" />
            </button>
        </div>
      </div>
    </div>
  );
};