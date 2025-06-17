import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, X, Plus, History, User, Menu, Mic } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { VoiceInterface } from './VoiceInterface';
import { NotesPopup } from './NotesPopup';
import { HistoryPopup } from './HistoryPopup';
import { ProfilePage } from './ProfilePage';
import { MenuPopup } from './MenuPopup';

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
  text?: string;
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

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onSend, 
  chatHistory, 
  isLoading, 
  isChatActive, 
  onNewChat, 
  statusMessage 
}) => {
  const [message, setMessage] = useState('');
  const [showVoice, setShowVoice] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    onSend(trimmedMessage);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = currentUser?.displayName?.split(' ')[0] || 'Friend';
    
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const guideMessages = [
    "Try asking: 'John 3:16' for a specific verse",
    "Ask for commentary: 'Romans 8:28 by Charles Spurgeon'",
    "Search by topic: 'verses about love'",
    "Get help: 'What does faith mean in the Bible?'"
  ];

  return (
    <div className={`bg-white flex flex-col h-full ${isChatActive ? 'rounded-t-3xl shadow-2xl' : ''}`}>
      {/* Dynamic Greeting */}
      {!isChatActive && (
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getGreeting()}</h2>
          <p className="text-gray-600">How can I help you explore God's word today?</p>
        </div>
      )}

      {/* Guide Messages */}
      {!isChatActive && chatHistory.length === 0 && (
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">💡 Try these examples:</h3>
            <div className="space-y-2">
              {guideMessages.map((guide, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(guide.split("'")[1] || '')}
                  className="block w-full text-left p-3 bg-white/60 hover:bg-white/80 rounded-xl text-sm text-gray-700 transition-colors"
                >
                  {guide}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat History */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatHistory.map((chat, index) => (
          <div key={index}>
            {chat.type === 'user' ? (
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl py-3 px-4 max-w-md shadow-lg">
                  <p>{chat.text}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chat.error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-red-600">{chat.error}</p>
                  </div>
                )}
                
                {chat.text && (
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <p className="whitespace-pre-wrap">{chat.text}</p>
                    </div>
                  </div>
                )}

                {chat.results.length > 0 && (
                  <div className="space-y-4">
                    {chat.results.map((passage) => (
                      <div key={passage.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
                        <h3 className="font-bold text-blue-800 mb-3 text-lg">{passage.reference}</h3>
                        <div
                          className="prose prose-sm max-w-none text-blue-900 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: passage.content }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {chat.commentary && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
                    <h4 className="font-bold text-amber-800 mb-3 flex items-center">
                      <span className="mr-2">📖</span>
                      Theological Commentary
                    </h4>
                    <div className="prose prose-sm max-w-none text-amber-900">
                      <p className="whitespace-pre-wrap leading-relaxed">{chat.commentary}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {(isLoading || statusMessage) && (
          <div className="flex justify-center pt-4">
            <div className="bg-gray-100 rounded-full px-4 py-2">
              <p className="text-gray-600 animate-pulse text-sm">{statusMessage || 'Searching...'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative mb-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isChatActive ? "Ask about any verse or topic..." : "Start exploring God's word..."}
            className="w-full bg-gray-100 rounded-2xl py-4 pl-12 pr-20 text-gray-700 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <button 
              onClick={() => setShowVoice(true)}
              className="p-2 text-gray-400 hover:text-purple-500 transition-colors"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMenu(true)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <History className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNotes(true)}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all shadow-lg"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Popups */}
      <VoiceInterface 
        isOpen={showVoice} 
        onClose={() => setShowVoice(false)} 
        onVoiceInput={onSend}
      />
      <NotesPopup 
        isOpen={showNotes} 
        onClose={() => setShowNotes(false)} 
      />
      <HistoryPopup 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        onSelectHistory={(item) => {
          setMessage(item.text);
          setShowHistory(false);
        }}
      />
      <ProfilePage 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
      />
      <MenuPopup 
        isOpen={showMenu} 
        onClose={() => setShowMenu(false)} 
      />
    </div>
  );
};