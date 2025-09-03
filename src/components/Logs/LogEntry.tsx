import React, { useState } from 'react';
import { LogEntry as LogEntryType, LogAction, LogCategory, LogSeverity } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LogEntryProps {
  log: LogEntryType;
  onDelete?: (id: string) => void;
  showDetails?: boolean;
}

/**
 * Composant pour afficher une entrée de log
 */
const LogEntry: React.FC<LogEntryProps> = ({ log, onDelete, showDetails = false }) => {
  const [expanded, setExpanded] = useState(false);

  // Obtenir l'icône selon l'action
  const getActionIcon = (action: LogAction) => {
    switch (action) {
      case 'CREATE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'UPDATE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'DELETE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'LOGIN':
      case 'LOGOUT':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'EXPORT':
      case 'IMPORT':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        );
      case 'SAVE_STATE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Obtenir la couleur selon la sévérité
  const getSeverityColor = (severity: LogSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'MEDIUM':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'LOW':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Obtenir la couleur de l'action
  const getActionColor = (action: LogAction) => {
    switch (action) {
      case 'CREATE':
        return 'text-green-600';
      case 'UPDATE':
        return 'text-blue-600';
      case 'DELETE':
        return 'text-red-600';
      case 'LOGIN':
      case 'LOGOUT':
        return 'text-purple-600';
      case 'EXPORT':
      case 'IMPORT':
        return 'text-indigo-600';
      case 'SAVE_STATE':
        return 'text-teal-600';
      default:
        return 'text-gray-600';
    }
  };

  // Obtenir la couleur de la catégorie
  const getCategoryColor = (category: LogCategory) => {
    switch (category) {
      case 'data':
        return 'bg-blue-100 text-blue-800';
      case 'ui':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      case 'configuration':
        return 'bg-orange-100 text-orange-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Formater la date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      relative: formatDistanceToNow(date, { addSuffix: true, locale: fr }),
      absolute: date.toLocaleString('fr-FR')
    };
  };

  const formattedDate = formatDate(log.timestamp);

  return (
    <div className={`border rounded-lg p-4 ${getSeverityColor(log.severity)} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Icône d'action */}
          <div className={`flex-shrink-0 p-2 rounded-full ${getActionColor(log.action)}`}>
            {getActionIcon(log.action)}
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {/* Badge de catégorie */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
                {log.category}
              </span>
              
              {/* Badge d'action */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)} bg-current bg-opacity-10`}>
                {log.action}
              </span>
              
              {/* Type d'entité */}
              {log.entityType && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {log.entityType}
                </span>
              )}
            </div>
            
            {/* Message */}
            <p className="text-sm font-medium text-gray-900 mb-1">
              {log.description}
            </p>
            
            {/* ID d'entité */}
            {log.entityId && (
              <p className="text-xs text-gray-500 mb-1">
                ID: {log.entityId}
              </p>
            )}
            
            {/* Timestamp */}
            <p className="text-xs text-gray-500" title={formattedDate.absolute}>
              {formattedDate.relative}
            </p>
            
            {/* Changements */}
            {log.changes && Object.keys(log.changes).length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {expanded ? 'Masquer les détails' : 'Voir les changements'}
                </button>
                
                {expanded && (
                  <div className="mt-2 p-2 bg-white bg-opacity-50 rounded border">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Changements:</h4>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(log.changes, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
            
            {/* Métadonnées */}
            {showDetails && log.metadata && Object.keys(log.metadata).length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                  {expanded ? 'Masquer les métadonnées' : 'Voir les métadonnées'}
                </button>
                
                {expanded && (
                  <div className="mt-2 p-2 bg-white bg-opacity-50 rounded border">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Métadonnées:</h4>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {onDelete && (
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={() => onDelete(log.id)}
              className="text-gray-400 hover:text-red-600 transition-colors duration-200"
              title="Supprimer ce log"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogEntry;