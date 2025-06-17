import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ActionCard } from './components/ActionCard';
import { ChatInterface, ChatMessage, ScriptureResult } from './components/ChatInterface';
import { AuthPage } from './components/auth/AuthPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  ScanLine, 
  Edit3, 
  RefreshCw, 
  MessageSquare,
  HelpCircle,
  Bell,
  User
} from 'lucide-react';

function AppContent() {
  const [isChatActive, setIsChatActive] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const { currentUser } = useAuth();

  // Define the allowed list of theologians
  const allowedTheologians = [
    "Charles Spurgeon",
    "Martin Luther King Jr.",
    "C.S. Lewis",
    "Sam Shamoun"
  ];

  useEffect(() => {
    if (currentUser) {
      // Generate a unique session ID when the user is authenticated
      const newSessionId = localStorage.getItem('sessionId') || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('sessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!sessionId || !currentUser) return;

    const messagesCollection = collection(db, 'chats', sessionId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const history: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        history.push(doc.data() as ChatMessage);
      });
      setChatHistory(history);
    });

    return () => unsubscribe();
  }, [sessionId, currentUser]);

  const handleActionClick = (action: string) => {
    if (!currentUser) {
      setShowAuth(true);
      return;
    }
    
    console.log(`${action} clicked`);
    if (action === 'Ask AI') {
      setIsChatActive(true);
    }
  };

  const handleNewChat = () => {
    if (!currentUser) return;
    
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('sessionId', newSessionId);
    setSessionId(newSessionId);
    setChatHistory([]);
    setIsChatActive(false);
  };

  const generateAICommentary = async (verseText: string, theologianName = '') => {
    let effectiveTheologian = '';
    const normalizedTheologianName = theologianName.trim().toLowerCase();
    const foundTheologian = allowedTheologians.find(
      (name) => name.toLowerCase() === normalizedTheologianName
    );

    if (foundTheologian) {
      effectiveTheologian = foundTheologian;
      setStatusMessage(`Generating commentary in the style of ${effectiveTheologian}...`);
    } else if (theologianName.trim()) {
      setStatusMessage(`"${theologianName}" is not an allowed theologian. Generating a general theological commentary instead.`);
    } else {
      setStatusMessage('Generating general theological commentary...');
    }

    try {
      let prompt = `Provide a theological commentary on the following Bible verse: "${verseText}"`;
      if (effectiveTheologian) {
        prompt += `\n\nFocus on the perspective or style of theologian/pastor: ${effectiveTheologian}.`;
      }

      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        return result.candidates[0].content.parts[0].text;
      } else {
        return 'No AI-generated commentary received or unexpected format.';
      }
    } catch (error) {
      console.error('Error generating AI commentary:', error);
      const err = error as Error;
      return `Failed to generate commentary: ${err.message}`;
    }
  };

  const generateConversationalResponse = async (userMessage: string, history: ChatMessage[]) => {
    setStatusMessage('Thinking...');
    try {
      const formattedHistory = history.map(chat => {
        if (chat.type === 'user') {
          return { role: 'user', parts: [{ text: chat.text }] };
        }
        let botText = '';
        if (chat.results.length > 0) {
          const contentWithoutHtml = chat.results[0].content.replace(/<[^>]*>/g, ' ');
          botText += `${chat.results[0].reference}\n${contentWithoutHtml}\n`;
        }
        if (chat.commentary) botText += `Commentary: ${chat.commentary}\n`;
        if (chat.text) botText += chat.text;
        return { role: 'model', parts: [{ text: botText.trim() }] };
      }).filter(item => item.parts[0].text);

      const contents = [...formattedHistory, { role: "user", parts: [{ text: userMessage }] }];
      const payload = { contents };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`API error! Status: ${response.status}`);

      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";
    } catch (error) {
      console.error('Error in conversational AI:', error);
      const err = error as Error;
      return `There was an error connecting to the AI service: ${err.message}`;
    }
  };

  const handleSend = async (message: string) => {
    if (!currentUser) {
      setShowAuth(true);
      return;
    }

    if (!isChatActive) setIsChatActive(true);

    const userMessage: ChatMessage = { type: 'user', text: message };
    setChatHistory(prev => [...prev, userMessage]);
    await addDoc(collection(db, 'chats', sessionId, 'messages'), { ...userMessage, timestamp: serverTimestamp() });

    // Save to search history
    await addDoc(collection(db, 'searchHistory'), {
      text: message,
      userId: currentUser.uid,
      timestamp: serverTimestamp()
    });

    setIsLoading(true);
    setStatusMessage('');

    try {
      const theologianRegex = /(.*?)(?:\s+by\s+(.*))?$/i;
      const match = message.match(theologianRegex);
      const passage = match ? match[1].trim() : message;
      const theologian = match ? match[2]?.trim() || '' : '';

      const bibleApiResponse = await fetch(`https://bible-api.com/${encodeURIComponent(passage)}?translation=kjv`);

      if (bibleApiResponse.ok) {
        const data = await bibleApiResponse.json();
        if (data.verses && data.verses.length > 0) {
          const verseText = data.verses.map((v: any) => v.text.trim()).join(' ');
          const formattedContent = data.verses
            .map((v: { verse: number; text: string }) => `<p><strong>${v.verse}</strong> ${v.text.trim()}</p>`)
            .join('');
          
          const scriptureResult: ScriptureResult = {
              id: data.reference,
              reference: data.reference,
              content: formattedContent
          };

          const commentaryText = await generateAICommentary(verseText, theologian);

          const botMessage: ChatMessage = {
              type: 'bot',
              results: [scriptureResult],
              error: null,
              commentary: commentaryText,
          };
          await addDoc(collection(db, 'chats', sessionId, 'messages'), { ...botMessage, timestamp: serverTimestamp() });
          setIsLoading(false);
          return;
        }
      }

      const aiResponseText = await generateConversationalResponse(message, chatHistory);
      const botMessage: ChatMessage = {
        type: 'bot',
        results: [],
        text: aiResponseText,
        error: null
      };
      await addDoc(collection(db, 'chats', sessionId, 'messages'), { ...botMessage, timestamp: serverTimestamp() });

    } catch (error) {
      const err = error as Error;
      const errorMessage: ChatMessage = { type: 'bot', results: [], error: `An unexpected error occurred: ${err.message}` };
      await addDoc(collection(db, 'chats', sessionId, 'messages'), { ...errorMessage, timestamp: serverTimestamp() });
      console.error('Error in handleSend:', error);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col h-screen">
      {/* Header */}
      <div className={`transition-all duration-300 ${isChatActive ? 'flex-none' : 'flex-1'}`}>
        <div className="bg-transparent px-6 pt-12 pb-8">
          <div className="flex items-center justify-between mb-8">
            <button className="p-2 hover:bg-white/50 rounded-full transition-colors">
              <HelpCircle className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-white/50 rounded-full transition-colors relative">
                <Bell className="w-6 h-6 text-orange-custom" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-custom rounded-full"></div>
              </button>
              
              {currentUser ? (
                <button 
                  onClick={() => setShowAuth(true)}
                  className="flex items-center space-x-2 bg-white/50 hover:bg-white/70 rounded-full px-4 py-2 transition-colors"
                >
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="w-6 h-6 rounded-full" />
                  ) : (
                    <User className="w-6 h-6 text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {currentUser.displayName?.split(' ')[0] || 'User'}
                  </span>
                </button>
              ) : (
                <button 
                  onClick={() => setShowAuth(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {!isChatActive && (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-gray-600 text-lg mb-1">
                  {currentUser ? `Hi ${currentUser.displayName?.split(' ')[0] || 'Friend'}` : 'Welcome'}
                </h1>
                <h2 className="text-gray-900 text-3xl font-bold leading-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  How can I help you<br />explore God's word today?
                </h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                <ActionCard 
                  icon={ScanLine} 
                  title="Scan" 
                  subtitle="Documents, verses..." 
                  onClick={() => handleActionClick('Scan')} 
                />
                <ActionCard 
                  icon={Edit3} 
                  title="Study" 
                  subtitle="Notes, highlights..." 
                  onClick={() => handleActionClick('Study')} 
                />
                <ActionCard 
                  icon={RefreshCw} 
                  title="Compare" 
                  subtitle="Translations, versions..." 
                  onClick={() => handleActionClick('Compare')} 
                />
                <ActionCard 
                  icon={MessageSquare} 
                  title="Ask AI" 
                  subtitle="Questions, commentary..." 
                  onClick={() => handleActionClick('Ask AI')} 
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chat Interface Wrapper */}
      <div className={`mt-auto flex-1 flex flex-col min-h-0 transition-all duration-300 ${isChatActive ? 'h-full' : 'h-auto'}`}>
        <ChatInterface 
          onSend={handleSend}
          chatHistory={chatHistory}
          isLoading={isLoading}
          isChatActive={isChatActive}
          onNewChat={handleNewChat}
          statusMessage={statusMessage}
        />
      </div>

      {/* Auth Modal */}
      {showAuth && <AuthPage onClose={() => setShowAuth(false)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;