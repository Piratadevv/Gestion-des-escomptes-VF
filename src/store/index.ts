import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import escomptesReducer from './slices/escomptesSlice';
import refinancementsReducer from './slices/refinancementsSlice';
import configurationReducer from './slices/configurationSlice';
import dashboardReducer from './slices/dashboardSlice';
import logsReducer from './slices/logsSlice';
import uiReducer from './slices/uiSlice';
import { loggingMiddleware } from './middleware/loggingMiddleware';

const rootReducer = combineReducers({
  escomptes: escomptesReducer,
  configuration: configurationReducer,
  dashboard: dashboardReducer,
  refinancements: refinancementsReducer,
  logs: logsReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(loggingMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;;