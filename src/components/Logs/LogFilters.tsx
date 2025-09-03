import React from 'react';
import { LogFilters as LogFiltersType, LogAction, LogCategory, LogSeverity } from '../../types';

interface LogFiltersProps {
  filters: LogFiltersType;
  onFiltersChange: (filters: LogFiltersType) => void;
  onApplyFilters?: () => void;
  onClearFilters: () => void;
}

/**
 * Composant pour filtrer les logs
 */
const LogFilters: React.FC<LogFiltersProps> = ({ filters, onFiltersChange, onApplyFilters, onClearFilters }) => {
  const handleFilterChange = (key: keyof LogFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtres</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Effacer les filtres
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Champ de recherche */}
        <div className="md:col-span-2">
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Recherche
          </label>
          <input
            type="text"
            id="search-filter"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Rechercher dans les descriptions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        {/* Filtre par catégorie */}
        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie
          </label>
          <select
            id="category-filter"
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Toutes les catégories</option>
            <option value="data">Données</option>
            <option value="ui">Interface</option>
            <option value="system">Système</option>
            <option value="configuration">Configuration</option>
            <option value="error">Erreur</option>
          </select>
        </div>
        
        {/* Filtre par action */}
        <div>
          <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <select
            id="action-filter"
            value={filters.action || ''}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Toutes les actions</option>
            <option value="CREATE">Création</option>
            <option value="UPDATE">Modification</option>
            <option value="DELETE">Suppression</option>
            <option value="LOGIN">Connexion</option>
            <option value="LOGOUT">Déconnexion</option>
            <option value="EXPORT">Export</option>
            <option value="IMPORT">Import</option>
            <option value="SAVE_STATE">Sauvegarde</option>
          </select>
        </div>
        
        {/* Filtre par sévérité */}
        <div>
          <label htmlFor="severity-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Sévérité
          </label>
          <select
            id="severity-filter"
            value={filters.severity || ''}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Toutes les sévérités</option>
            <option value="LOW">Faible</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="HIGH">Élevée</option>
            <option value="CRITICAL">Critique</option>
          </select>
        </div>
        
        {/* Filtre par type d'entité */}
        <div>
          <label htmlFor="entityType-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Type d'entité
          </label>
          <select
            id="entityType-filter"
            value={filters.entityType || ''}
            onChange={(e) => handleFilterChange('entityType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Tous les types</option>
            <option value="ESCOMPTE">Escompte</option>
            <option value="REFINANCEMENT">Refinancement</option>
            <option value="CONFIGURATION">Configuration</option>
            <option value="USER">Utilisateur</option>
            <option value="SYSTEM">Système</option>
          </select>
        </div>
        
        {/* Filtre par date de début */}
        <div>
          <label htmlFor="dateStart-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            type="datetime-local"
            id="dateStart-filter"
            value={filters.dateStart || ''}
            onChange={(e) => handleFilterChange('dateStart', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        {/* Filtre par date de fin */}
        <div>
          <label htmlFor="dateEnd-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <input
            type="datetime-local"
            id="dateEnd-filter"
            value={filters.dateEnd || ''}
            onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>
      
      {/* Filtres rapides */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Filtres rapides</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const newFilters: any = { dateStart: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] };
              if (filters.search) newFilters.search = filters.search;
              if (filters.category) newFilters.category = filters.category;
              if (filters.action) newFilters.action = filters.action;
              if (filters.severity) newFilters.severity = filters.severity;
              if (filters.entityType) newFilters.entityType = filters.entityType;
              onFiltersChange(newFilters);
            }}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors duration-200"
          >
            Dernières 24h
          </button>
          <button
            onClick={() => {
              const newFilters: any = { dateStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] };
              if (filters.search) newFilters.search = filters.search;
              if (filters.category) newFilters.category = filters.category;
              if (filters.action) newFilters.action = filters.action;
              if (filters.severity) newFilters.severity = filters.severity;
              if (filters.entityType) newFilters.entityType = filters.entityType;
              onFiltersChange(newFilters);
            }}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors duration-200"
          >
            Dernière semaine
          </button>
          <button
            onClick={() => {
              const newFilters: any = { dateStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] };
              if (filters.search) newFilters.search = filters.search;
              if (filters.category) newFilters.category = filters.category;
              if (filters.action) newFilters.action = filters.action;
              if (filters.severity) newFilters.severity = filters.severity;
              if (filters.entityType) newFilters.entityType = filters.entityType;
              onFiltersChange(newFilters);
            }}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors duration-200"
          >
            Dernier mois
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, severity: 'CRITICAL' })}
            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-colors duration-200"
          >
            Critiques seulement
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, category: 'data' })}
            className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 transition-colors duration-200"
          >
            Données seulement
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, action: 'CREATE' })}
            className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-full hover:bg-purple-100 transition-colors duration-200"
          >
            Créations seulement
          </button>
        </div>
      </div>
      
      {/* Indicateur de filtres actifs */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filtres actifs:</span>
            <div className="flex flex-wrap gap-1">
              {filters.category && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  Catégorie: {filters.category}
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.action && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                  Action: {filters.action}
                  <button
                    onClick={() => handleFilterChange('action', '')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.severity && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                  Sévérité: {filters.severity}
                  <button
                    onClick={() => handleFilterChange('severity', '')}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.entityType && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                  Type: {filters.entityType}
                  <button
                    onClick={() => handleFilterChange('entityType', '')}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.dateStart && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  Depuis: {filters.dateStart}
                  <button
                    onClick={() => handleFilterChange('dateStart', '')}
                    className="ml-1 text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.dateEnd && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  Jusqu'à: {filters.dateEnd}
                  <button
                    onClick={() => handleFilterChange('dateEnd', '')}
                    className="ml-1 text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Boutons d'action */}
      {onApplyFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Effacer
          </button>
          <button
            onClick={onApplyFilters}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Appliquer
          </button>
        </div>
      )}
    </div>
  );
};

export default LogFilters;