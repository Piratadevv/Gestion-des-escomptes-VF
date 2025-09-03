import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { addLogEntry } from '../slices/logsSlice';
import { LogEntry, LogAction, LogCategory, LogSeverity, LogEntityType } from '../../types';

// Flag pour contrôler si le logging est actif
let isLoggingActive = true;

/**
 * Réinitialise l'état du logging (désactive le logging)
 */
export const resetLoggingState = () => {
  isLoggingActive = false;
};

/**
 * Vérifie si le logging est actuellement actif
 */
export const isLoggingCurrentlyActive = () => {
  return isLoggingActive;
};

/**
 * Middleware Redux pour capturer automatiquement tous les changements d'état
 * et les enregistrer comme entrées de log
 */
export const loggingMiddleware: Middleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  const result = next(action);
  const nextState = store.getState();

  const typedAction = action as AnyAction;
  
  // Ne pas logger les actions de logs pour éviter la récursion infinie
  if (typeof typedAction.type === 'string' && typedAction.type.startsWith('logs/')) {
    return result;
  }

  // Check if action is significant
  const isSignificant = isSignificantAction(typedAction.type);

  // Créer des logs pour toutes les actions significatives
  if (isLoggingActive && isSignificant) {
    // Créer une entrée de log basée sur l'action
    const logEntry = createLogEntryFromAction(typedAction, prevState, nextState);
    
    if (logEntry) {
      // Dispatch l'action de log de manière asynchrone pour éviter les problèmes de performance
      setTimeout(() => {
        store.dispatch(addLogEntry(logEntry));
        // Also send to backend via createLogEntry thunk
        import('../slices/logsSlice').then(({ createLogEntry }) => {
          const thunkAction = createLogEntry({
            action: logEntry.action,
            category: logEntry.category,
            severity: logEntry.severity,
            description: logEntry.description,
            entityType: logEntry.entityType,
            entityId: logEntry.entityId,
            userId: logEntry.userId,
            changes: logEntry.changes,
            metadata: logEntry.metadata
          });
          (store.dispatch as any)(thunkAction);
        });
      }, 0);
    }
  }

  return result;
};

/**
 * Détermine si une action est significative et doit déclencher le début du logging
 */
function isSignificantAction(actionType: string): boolean {
  // Actions qui déclenchent le début du logging
  const significantActions = [
    // Actions d'escomptes
    'escomptes/createEscompte',
    'escomptes/updateEscompte',
    'escomptes/deleteEscompte',
    'escomptes/exportEscomptes',
    
    // Actions de refinancements
    'refinancements/createRefinancement',
    'refinancements/updateRefinancement',
    'refinancements/deleteRefinancement',
    'refinancements/exportRefinancements',
    
    // Actions d'authentification
    'auth/login',
    'auth/logout',
    
    // Actions de configuration
    'configuration/update',
    'configuration/updateConfiguration'
  ];
  
  return significantActions.some(action => actionType.startsWith(action));
}

/**
 * Crée une entrée de log basée sur l'action Redux
 */
function createLogEntryFromAction(
  action: any,
  prevState: RootState,
  nextState: RootState
): LogEntry | null {
  const timestamp = new Date().toISOString();
  const actionType = action.type as string;

  // Déterminer la catégorie et l'action basées sur le type d'action
  const { category, logAction, severity, entityType, entityId } = parseActionType(actionType, action.payload);

  if (!category || !logAction) {
    return null; // Ignorer les actions non pertinentes
  }

  // Créer la description de log
  const description = createLogMessage(actionType, action.payload, logAction, entityType);

  // Capturer les changements d'état pertinents
  const changes = captureStateChanges(prevState, nextState, category, entityType);

  return {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    action: logAction,
    category,
    severity,
    description,
    entityType: (entityType as LogEntityType) || undefined,
    entityId: entityId || undefined,
    userId: 'system',
    changes,
    metadata: {
      actionType,
      payload: action.payload,
      userAgent: navigator.userAgent,
      url: window.location.pathname
    }
  };
}

/**
 * Parse le type d'action Redux pour déterminer la catégorie et l'action de log
 */
function parseActionType(actionType: string, payload: any): {
  category: LogCategory | null;
  logAction: LogAction | null;
  severity: LogSeverity;
  entityType: string | null;
  entityId: string | null;
} {
  // Actions des escomptes
  if (actionType.startsWith('escomptes/')) {
    if (actionType.includes('create') || actionType.includes('add')) {
      return {
          category: 'data',
          logAction: 'CREATE',
          severity: 'MEDIUM',
          entityType: 'escompte',
          entityId: payload?.id || null
        };
    }
    if (actionType.includes('update') || actionType.includes('edit')) {
      return {
          category: 'data',
          logAction: 'UPDATE',
          severity: 'MEDIUM',
          entityType: 'escompte',
          entityId: payload?.id || null
        };
    }
    if (actionType.includes('delete') || actionType.includes('remove')) {
      return {
          category: 'data',
          logAction: 'DELETE',
          severity: 'HIGH',
          entityType: 'escompte',
          entityId: payload?.id || payload?.ids?.[0] || null
        };
    }
    if (actionType.includes('fetch') || actionType.includes('load') || actionType.includes('export')) {
      return {
          category: 'system',
          logAction: 'EXPORT',
          severity: 'LOW',
          entityType: 'escompte',
          entityId: null
        };
    }
  }

  // Actions des refinancements
  if (actionType.startsWith('refinancements/')) {
    if (actionType.includes('create') || actionType.includes('add')) {
      return {
          category: 'data',
          logAction: 'CREATE',
          severity: 'MEDIUM',
          entityType: 'refinancement',
          entityId: payload?.id || null
        };
    }
    if (actionType.includes('update') || actionType.includes('edit')) {
      return {
          category: 'data',
          logAction: 'UPDATE',
          severity: 'MEDIUM',
          entityType: 'refinancement',
          entityId: payload?.id || null
        };
    }
    if (actionType.includes('delete') || actionType.includes('remove')) {
      return {
          category: 'data',
          logAction: 'DELETE',
          severity: 'HIGH',
          entityType: 'refinancement',
          entityId: payload?.id || payload?.ids?.[0] || null
        };
    }
    if (actionType.includes('fetch') || actionType.includes('load') || actionType.includes('export')) {
      return {
          category: 'system',
          logAction: 'EXPORT',
          severity: 'LOW',
          entityType: 'refinancement',
          entityId: null
        };
    }
  }

  // Actions de configuration
  if (actionType.startsWith('configuration/')) {
    if (actionType.includes('update') || actionType.includes('save')) {
      return {
          category: 'configuration',
          logAction: 'UPDATE',
          severity: 'MEDIUM',
          entityType: 'configuration',
          entityId: 'global'
        };
    }
    if (actionType.includes('fetch') || actionType.includes('load')) {
      return {
          category: 'system',
          logAction: 'EXPORT',
          severity: 'LOW',
          entityType: 'configuration',
          entityId: 'global'
        };
    }
  }

  // Actions de l'interface utilisateur
  if (actionType.startsWith('ui/')) {
    return {
          category: 'ui',
          logAction: 'UPDATE',
          severity: 'LOW',
          entityType: 'user',
          entityId: null
        };
  }

  // Actions du tableau de bord
  if (actionType.startsWith('dashboard/')) {
    return {
          category: 'system',
          logAction: 'EXPORT',
          severity: 'LOW',
          entityType: 'system',
          entityId: null
        };
  }

  // Actions d'erreur
  if (actionType.includes('rejected') || actionType.includes('error')) {
    return {
      category: 'error',
      logAction: 'UPDATE',
      severity: 'CRITICAL',
      entityType: extractEntityTypeFromAction(actionType),
      entityId: null
    };
  }

  return {
    category: null,
    logAction: null,
    severity: 'LOW',
    entityType: null,
    entityId: null
  };
}

/**
 * Extrait le type d'entité du type d'action
 */
function extractEntityTypeFromAction(actionType: string): string | null {
  if (actionType.includes('escomptes')) return 'escompte';
  if (actionType.includes('refinancements')) return 'refinancement';
  if (actionType.includes('configuration')) return 'configuration';
  if (actionType.includes('dashboard')) return 'dashboard';
  return null;
}

/**
 * Crée un message de log lisible
 */
function createLogMessage(
  actionType: string,
  payload: any,
  logAction: LogAction,
  entityType: string | null
): string {
  const entityName = entityType ? entityType.charAt(0).toUpperCase() + entityType.slice(1) : 'Élément';
  
  switch (logAction) {
    case 'CREATE':
      return `${entityName} créé${payload?.id ? ` (ID: ${payload.id})` : ''}`;
    case 'UPDATE':
      return `${entityName} modifié${payload?.id ? ` (ID: ${payload.id})` : ''}`;
    case 'DELETE':
      const ids = payload?.ids || (payload?.id ? [payload.id] : []);
      if (ids.length > 1) {
        return `${ids.length} ${entityType}s supprimés`;
      }
      return `${entityName} supprimé${ids[0] ? ` (ID: ${ids[0]})` : ''}`;
    case 'LOGIN':
    case 'LOGOUT':
    case 'EXPORT':
    case 'IMPORT':
    case 'SAVE_STATE':
      return `${entityName}s chargés`;
    default:
      return `Action ${actionType} exécutée`;
  }
}

/**
 * Capture les changements d'état pertinents
 */
function captureStateChanges(
  prevState: RootState,
  nextState: RootState,
  category: LogCategory,
  entityType: string | null
): Record<string, any> | undefined {
  const changes: Record<string, any> = {};

  // Capturer les changements selon la catégorie
  switch (category) {
    case 'data':
      if (entityType === 'escompte') {
        if (prevState.escomptes.escomptes.length !== nextState.escomptes.escomptes.length) {
          changes.count = {
            before: prevState.escomptes.escomptes.length,
            after: nextState.escomptes.escomptes.length
          };
        }
      }
      if (entityType === 'refinancement') {
        if (prevState.refinancements.refinancements.length !== nextState.refinancements.refinancements.length) {
          changes.count = {
            before: prevState.refinancements.refinancements.length,
            after: nextState.refinancements.refinancements.length
          };
        }
      }
      break;

    case 'configuration':
      if (prevState.configuration.configuration?.autorisationBancaire !== nextState.configuration.configuration?.autorisationBancaire) {
        changes.autorisationBancaire = {
          before: prevState.configuration.configuration?.autorisationBancaire,
          after: nextState.configuration.configuration?.autorisationBancaire
        };
      }
      break;

    case 'ui':
      // Capturer les changements d'état de l'interface utilisateur si nécessaire
      break;

    case 'system':
      // Capturer les changements système si nécessaire
      break;
  }

  return Object.keys(changes).length > 0 ? changes : undefined;
}