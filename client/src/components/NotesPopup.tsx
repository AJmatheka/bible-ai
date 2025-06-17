import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  Quote, 
  Type,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface Note {
  id?: string;
  title: string;
  content: string;
  createdAt?: any;
  updatedAt?: any;
}

interface NotesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note;
}

export const NotesPopup: React.FC<NotesPopupProps> = ({ isOpen, onClose, note }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);

  const handleSave = async () => {
    if (!currentUser || !title.trim()) return;

    setIsSaving(true);
    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        userId: currentUser.uid,
        updatedAt: serverTimestamp()
      };

      if (note?.id) {
        await updateDoc(doc(db, 'notes', note.id), noteData);
      } else {
        await addDoc(collection(db, 'notes'), {
          ...noteData,
          createdAt: serverTimestamp()
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatText = (command: string) => {
    document.execCommand(command, false);
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
              <h2 className="text-xl font-bold text-gray-900">
                {note ? 'Edit Note' : 'New Note'}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center space-x-2 p-4 border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => formatText('bold')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText('italic')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText('underline')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300" />
              <button
                onClick={() => formatText('insertUnorderedList')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText('formatBlock', 'blockquote')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <select
                onChange={(e) => formatText('fontSize', e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="3">Normal</option>
                <option value="1">Small</option>
                <option value="4">Large</option>
                <option value="6">Extra Large</option>
              </select>
            </div>

            {/* Content */}
            <div className={`flex flex-col ${isExpanded ? 'h-full' : 'max-h-96'}`}>
              <input
                type="text"
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 text-xl font-semibold border-none outline-none placeholder-gray-400"
              />
              
              <div
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                className={`flex-1 p-4 outline-none text-gray-700 leading-relaxed ${
                  isExpanded ? 'min-h-0' : 'min-h-48'
                }`}
                style={{ minHeight: isExpanded ? 'calc(100vh - 300px)' : '200px' }}
                dangerouslySetInnerHTML={{ __html: content }}
                placeholder="Start writing your note..."
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {content.replace(/<[^>]*>/g, '').length} characters
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !title.trim()}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Note'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};