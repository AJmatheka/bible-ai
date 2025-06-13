import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-start text-left w-full group"
    >
      <div className="mb-4 p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
        <Icon className="w-6 h-6 text-gray-700" />
      </div>
      <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{subtitle}</p>
    </button>
  );
};