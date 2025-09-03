import { store } from '../store';
import { clearLogs } from '../store/slices/logsSlice';
import { resetLoggingState } from '../store/middleware/loggingMiddleware';

/**
 * Réinitialise complètement le système de logging
 * - Efface tous les logs existants
 * - Désactive le logging jusqu'à la prochaine action significative
 */
export const resetLoggingSystem = () => {
  // Effacer tous les logs du store
  store.dispatch(clearLogs());
  
  // Réinitialiser l'état du middleware de logging
  resetLoggingState();
  
  console.log('Système de logging réinitialisé. Les logs recommenceront à être capturés lors de la prochaine action significative.');
};

/**
 * Efface uniquement les logs sans affecter l'état du logging
 */
export const clearAllLogs = () => {
  store.dispatch(clearLogs());
  console.log('Tous les logs ont été effacés.');
};