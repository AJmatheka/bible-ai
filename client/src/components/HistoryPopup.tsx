import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Search, Trash2, Maximize2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface HistoryItem {
  id: string;
  text: string;
  timestamp: any;
  results?: any[];
}

interface HistoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistory: (item: HistoryItem) => void;
}

export const HistoryPopup: React.FC<HistoryPopupProps> = ({ isOpen, onClose, onSelectHistory }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser || !isOpen) return;

    const historyCollection = collection(db, 'searchHistory');
    const q = query(
      historyCollection,
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const historyItems: HistoryItem[] = [];
      querySnapshot.forEach((doc) => {
        historyItems.push({ id: doc.id, ...doc.data() } as HistoryItem);
      });
      setHistory(historyItems);
    });

    return () => unsubscribe();
  }, [currentUser, isOpen]);

  const filteredHistory = history.filter(item =>
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'searchHistory', id));
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`bg-white rounded-3xl shadow-2xl transition-all duration-300 ${
              isExpanded ? 'w-full h-full max-w-none max-h-none' : 'w-full max-w-2xl max-h-[80vh]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900">Search History</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* History List */}
            <div className={`overflow-y-auto ${isExpanded ? 'flex-1' : 'max-h-96'}`}>
              {filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No search history</p>
                  <p className="text-sm">Your searches will appear here</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {filteredHistory.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer"
                      onClick={() => onSelectHistory(item)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">{item.text}</p>
                        <p className="text-sm text-gray-500">{formatDate(item.timestamp)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};