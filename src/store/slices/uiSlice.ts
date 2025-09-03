import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModalState, Notification } from '../../types';

interface UIState {
  modal: ModalState;
  notifications: Notification[];
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  autoSave: {
    enabled: boolean;
    lastSave: string | null;
    interval: number; // en millisecondes
  };
}



const initialState: UIState = {
  modal: {
    isOpen: false,
    type: null,
  },
  notifications: [],
  sidebarOpen: false,
  theme: 'light',
  autoSave: {
    enabled: true,
    lastSave: null,
    interval: 10000, // 10 secondes
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Gestion des modales
    openModal: (state, action: PayloadAction<ModalState>) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        mode: action.payload.mode ?? undefined,
        data: action.payload.data ?? undefined,
      };
    },
    closeModal: (state) => {
      state.modal = { isOpen: false, type: null } as ModalState;
    },
    
    // Gestion des notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      state.notifications.push(notification);
      
      // Limiter le nombre de notifications à 5
      if (state.notifications.length > 5) {
        state.notifications.shift();
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Gestion de la sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    // Gestion du thème
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Gestion de la sauvegarde automatique
    setAutoSaveEnabled: (state, action: PayloadAction<boolean>) => {
      state.autoSave.enabled = action.payload;
    },
    setAutoSaveInterval: (state, action: PayloadAction<number>) => {
      state.autoSave.interval = action.payload;
    },
    updateLastSave: (state) => {
      state.autoSave.lastSave = new Date().toISOString();
    },
  },
});

export const {
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  setAutoSaveEnabled,
  setAutoSaveInterval,
  updateLastSave,
} = uiSlice.actions;

export default uiSlice.reducer;

// Sélecteurs
export const selectModal = (state: { ui: UIState }) => state.ui.modal;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectAutoSave = (state: { ui: UIState }) => state.ui.autoSave;

// Actions de notification prédéfinies
export const showSuccessNotification = (title: string, message: string) => 
  addNotification({ type: 'success', title, message, duration: 5000 });

export const showErrorNotification = (title: string, message: string) => 
  addNotification({ type: 'error', title, message, duration: 8000 });

export const showWarningNotification = (title: string, message: string) => 
  addNotification({ type: 'warning', title, message, duration: 6000 });

export const showInfoNotification = (title: string, message: string) => 
  addNotification({ type: 'info', title, message, duration: 4000 });