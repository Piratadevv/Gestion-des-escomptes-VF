import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'indigo' | 'orange';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color, className }) => {
  // Use consistent banking colors like KPICard component
  const bankingClasses = {
    bg: 'bg-gradient-to-br from-banking-50 to-trust-50',
    border: 'border-trust-200',
    icon: 'text-banking-900',
    value: 'text-banking-900',
    title: 'text-neutral-600'
  };

  const classes = bankingClasses;

  return (
    <div className={`${classes.bg} ${classes.border} border rounded-banking p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-banking-sm ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${classes.title} mb-1 uppercase tracking-wide`}>
            {title}
          </h3>
          <p className={`text-2xl font-bold ${classes.value} mb-1 font-banking`}>
            {value}
          </p>
          <p className="text-sm text-neutral-700">
            {subtitle}
          </p>
        </div>
        <div className={`${classes.icon} opacity-30 p-3 rounded-banking bg-white/80 shadow-banking-sm border border-banking-200`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StatCard;