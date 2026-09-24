import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorScheme = 'blue'
}) => {
  const colorStyles = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      accent: 'border-l-blue-500'
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      accent: 'border-l-emerald-500'
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      accent: 'border-l-amber-500'
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      accent: 'border-l-purple-500'
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      accent: 'border-l-rose-500'
    }
  };

  const style = colorStyles[colorScheme];

  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 border-l-4 ${style.accent}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex items-baseline space-x-2 mt-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
            {trend && (
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-sm ${trend.isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${style.iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
