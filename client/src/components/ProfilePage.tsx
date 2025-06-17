import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  Edit3,
  Camera,
  Moon,
  Sun,
  Globe,
  Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ isOpen, onClose }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    {
      icon: Settings,
      title: 'Account Settings',
      subtitle: 'Manage your account preferences',
      action: () => console.log('Account Settings')
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Configure notification preferences',
      toggle: true,
      value: notifications,
      onChange: setNotifications
    },
    {
      icon: Moon,
      title: 'Dark Mode',
      subtitle: 'Switch between light and dark themes',
      toggle: true,
      value: darkMode,
      onChange: setDarkMode
    },
    {
      icon: Globe,
      title: 'Language',
      subtitle: language,
      action: () => console.log('Language Settings')
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      action: () => console.log('Privacy Settings')
    },
    {
      icon: Download,
      title: 'Download Data',
      subtitle: 'Export your notes and history',
      action: () => console.log('Download Data')
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      action: () => console.log('Help & Support')
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
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    {currentUser?.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10" />
                    )}
                  </div>
                  <button className="absolute -bottom-1 -right-1 p-2 bg-white text-purple-500 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                <h2 className="text-xl font-bold mb-1">
                  {currentUser?.displayName || 'User'}
                </h2>
                <p className="text-white/80 text-sm">
                  {currentUser?.email}
                </p>
                
                <button className="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="overflow-y-auto max-h-96">
              {menuItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={item.action}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <item.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.subtitle}</p>
                    </div>
                  </div>
                  
                  {item.toggle && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onChange?.(!item.value);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        item.value ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          item.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};