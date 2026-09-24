import React from 'react';
import { Award, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

interface Props {
  category: 'Distinction' | 'First Class' | 'Pass / Average' | 'Needs Support' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const PerformanceBadge: React.FC<Props> = ({ category, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  switch (category) {
    case 'Distinction':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full font-medium bg-purple-50 text-purple-700 border border-purple-200/80 shadow-xs ${sizeClasses[size]}`}>
          <Award className="w-3.5 h-3.5 text-purple-600" />
          <span>Distinction (≥ 80%)</span>
        </span>
      );
    case 'First Class':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs ${sizeClasses[size]}`}>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>First Class (60-79%)</span>
        </span>
      );
    case 'Pass / Average':
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs ${sizeClasses[size]}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Pass / Average (45-59%)</span>
        </span>
      );
    case 'Needs Support':
    default:
      return (
        <span className={`inline-flex items-center space-x-1.5 rounded-full font-medium bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs ${sizeClasses[size]}`}>
          <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
          <span>Needs Support (&lt; 45%)</span>
        </span>
      );
  }
};
