import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  Heart, 
  Share2, 
  Download, 
  Settings, 
  HelpCircle,
  Star,
  Calendar,
  Users
} from 'lucide-react';

interface MenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuPopup: React.FC<MenuPopupProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    {
      icon: BookOpen,
      title: 'Bible Reading Plan',
      subtitle: 'Follow structured reading plans',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Heart,
      title: 'Favorites',
      subtitle: 'Your saved verses and notes',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Calendar,
      title: 'Daily Devotions',
      subtitle: 'Daily spiritual guidance',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Users,
      title: 'Study Groups',
      subtitle: 'Join community discussions',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Share2,
      title: 'Share Verses',
      subtitle: 'Share with friends and family',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Download,
      title: 'Offline Access',
      subtitle: 'Download for offline reading',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Star,
      title: 'Rate App',
      subtitle: 'Help us improve',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: HelpCircle,
      title: 'Help & Feedback',
      subtitle: 'Get support or send feedback',
      color: 'from-gray-500 to-gray-600'
    }
  ];

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
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="overflow-y-auto max-h-96 p-4">
              <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all duration-200 text-left group"
                    onClick={() => console.log(item.title)}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.subtitle}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};