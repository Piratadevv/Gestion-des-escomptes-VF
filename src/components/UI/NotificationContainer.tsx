import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectNotifications, removeNotification } from '../../store/slices/uiSlice';
import { Notification } from '../../types';

/**
 * Composant NotificationContainer - Affichage des notifications toast
 */
const NotificationContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);

  // Auto-suppression des notifications après délai
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    notifications.forEach((notification) => {
      if (notification.autoClose && notification.duration) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, dispatch]);

  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
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
        return 'bg-success-50 border-success-200 text-success-800';
      case 'error':
        return 'bg-danger-50 border-danger-200 text-danger-800';
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-success-600';
      case 'error':
        return 'text-danger-600';
      case 'warning':
        return 'text-warning-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
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
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
              aria-label="Fermer la notification"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Barre de progression pour auto-close */}
          {notification.autoClose && notification.duration && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden">
              <div
                className="h-full bg-current opacity-50 animate-progress-bar"
                style={{
                  animationDuration: `${notification.duration}ms`,
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