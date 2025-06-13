import React from 'react';
import { FileText, Clock, Plus } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-6">
      <div className="flex space-x-4">
        <button className="bg-gray-900 p-4 rounded-full hover:bg-gray-800 transition-colors">
          <FileText className="w-6 h-6 text-white" />
        </button>
        <button className="bg-gray-100 p-4 rounded-full hover:bg-gray-200 transition-colors">
          <Clock className="w-6 h-6 text-gray-700" />
        </button>
      </div>
      
      <button className="bg-gray-900 p-4 rounded-full hover:bg-gray-800 transition-colors shadow-lg">
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};