import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectNotifications, removeNotification, markNotificationAsRead } from '../../store/slices/uiSlice';
import { Notification } from '../../types';

/**
 * Composant NotificationContainer - Affichage des notifications toast
 */
const NotificationContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);

  // Auto-suppression des notifications lues après délai
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    notifications.forEach((notification) => {
      if (notification.autoClose && notification.duration && notification.lu) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, 2000); // Délai réduit pour les notifications lues
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, dispatch]);

  const handleClose = (id: string) => {
    // Marquer comme lu au lieu de supprimer immédiatement
    dispatch(markNotificationAsRead(id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-gray-800 border-success-400 text-white';
      case 'error':
        return 'bg-gray-800 border-danger-400 text-white';
      case 'warning':
        return 'bg-gray-800 border-warning-400 text-white';
      case 'info':
        return 'bg-gray-800 border-blue-400 text-white';
      default:
        return 'bg-gray-800 border-gray-400 text-white';
    }
  };

  const getIconStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-success-400';
      case 'error':
        return 'text-danger-400';
      case 'warning':
        return 'text-warning-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  // Filtrer pour ne montrer que les notifications non lues
  const unreadNotifications = notifications.filter(n => !n.lu);

  if (unreadNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full">
      {unreadNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            relative p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out
            animate-slide-in-right
            ${getNotificationStyles(notification.type)}
          `}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start">
            {/* Icône */}
            <div className={`flex-shrink-0 ${getIconStyles(notification.type)}`}>
              {getNotificationIcon(notification.type)}
            </div>

            {/* Contenu */}
            <div className="ml-3 flex-1">
              {notification.title && (
                <h4 className="text-sm font-medium mb-1">
                  {notification.title}
                </h4>
              )}
              <p className="text-sm">{notification.message}</p>
              
              {notification.actions && notification.actions.length > 0 && (
                <div className="mt-3 flex space-x-2">
                  {notification.actions.map((action: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.action();
                        if (action.closeOnClick) {
                          handleClose(notification.id);
                        }
                      }}
                      className="text-xs font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bouton fermer */}
            <button
              onClick={() => handleClose(notification.id)}
              className="flex-shrink-0 ml-4 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
              aria-label="Fermer la notification"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Indicateur de notification non lue */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          
          {/* Barre de progression pour auto-close - désactivée pour les notifications persistantes */}
          {notification.autoClose && notification.duration && notification.lu && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden">
              <div
                className="h-full bg-current opacity-50 animate-progress-bar"
                style={{
                  animationDuration: "2000ms",
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;