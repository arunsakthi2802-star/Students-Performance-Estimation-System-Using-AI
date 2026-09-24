import React from 'react';
import { ShieldCheck, Eye, AlertCircle } from 'lucide-react';

interface Props {
  priority: 'Good Standing' | 'Moderate Monitoring' | 'High Academic Priority' | string;
}

export const PriorityBadge: React.FC<Props> = ({ priority }) => {
  switch (priority) {
    case 'Good Standing':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Good Standing</span>
        </span>
      );
    case 'Moderate Monitoring':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-800 border border-amber-200">
          <Eye className="w-3 h-3 text-amber-600" />
          <span>Moderate Monitoring</span>
        </span>
      );
    case 'High Academic Priority':
    default:
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100/90 text-rose-800 border border-rose-300 animate-pulse">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          <span>High Academic Priority</span>
        </span>
      );
  }
};
