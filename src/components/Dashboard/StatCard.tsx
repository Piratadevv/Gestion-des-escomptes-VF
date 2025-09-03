import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'indigo' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      value: 'text-blue-900',
      title: 'text-blue-800'
    },
    purple: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      icon: 'text-sky-600',
      value: 'text-sky-900',
      title: 'text-sky-800'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      value: 'text-green-900',
      title: 'text-green-800'
    },
    red: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      icon: 'text-sky-600',
      value: 'text-sky-900',
      title: 'text-sky-800'
    },
    yellow: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      icon: 'text-sky-600',
      value: 'text-sky-900',
      title: 'text-sky-800'
    },
    indigo: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      icon: 'text-sky-600',
      value: 'text-sky-900',
      title: 'text-sky-800'
    },
    orange: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      icon: 'text-sky-600',
      value: 'text-sky-900',
      title: 'text-sky-800'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`${classes.bg} ${classes.border} border rounded-lg p-6 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${classes.title} mb-1`}>
            {title}
          </h3>
          <p className={`text-2xl font-bold ${classes.value} mb-1`}>
            {value}
          </p>
          <p className="text-sm text-gray-600">
            {subtitle}
          </p>
        </div>
        <div className={`${classes.icon} opacity-20`}>
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StatCard;