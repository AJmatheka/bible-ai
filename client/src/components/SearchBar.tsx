import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search", 
  value = "", 
  onChange 
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-white rounded-full py-4 pl-12 pr-4 text-gray-700 placeholder-gray-400 shadow-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div className="bg-gray-100 rounded-full px-3 py-1">
          <span className="text-gray-500 text-sm font-medium">⌘K</span>
        </div>
      </div>
    </div>
  );
};