import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  onClick?: () => void;
}

/**
 * Composant KPICard - Carte d'affichage des indicateurs clés
 */
const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  trend,
  onClick
}) => {
  // Style bancaire professionnel pour toutes les cartes KPI
  const neutralClasses = {
    bg: 'bg-gradient-to-br from-banking-50 to-trust-50',
    icon: 'text-banking-600',
    border: 'border-trust-200',
    hover: 'hover:shadow-banking-md hover:border-banking-300',
    shadow: 'shadow-banking-sm'
  };

  const getTrendClasses = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-financial-600';
      case 'negative':
        return 'text-risk-600';
      case 'neutral':
      default:
        return 'text-neutral-600';
    }
  };

  const getTrendIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'negative':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'neutral':
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };



  const CardContent = () => (
    <div className={`
      ${neutralClasses.bg} rounded-banking border ${neutralClasses.shadow} p-6 
      transition-all duration-300 hover:scale-[1.02]
      ${onClick ? `cursor-pointer ${neutralClasses.hover}` : ''}
      ${neutralClasses.border}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-600 mb-2 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-banking-900 mb-3 font-banking">
            {value}
          </p>
          
          {trend && (
            <div className={`flex items-center text-sm ${getTrendClasses(trend.type)} bg-white/50 rounded-full px-3 py-1`}>
              <span className="mr-1">
                {getTrendIcon(trend.type)}
              </span>
              <span className="font-semibold">
                {trend.value}
              </span>
              <span className="ml-1 text-neutral-700">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        
        <div className={`
          flex-shrink-0 p-4 rounded-banking bg-white/80 shadow-banking-sm
          border border-banking-200
        `}>
          <div className={`${neutralClasses.icon} text-2xl`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-banking-500 focus:ring-offset-2 rounded-banking"
        aria-label={`Voir les détails de ${title}`}
      >
        <CardContent />
      </button>
    );
  }

  return <CardContent />;
};

export default KPICard;