import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Audit, LogEntry, LogFilters as LogFiltersType, LogsState as LogsStateType, LogSortField, SortOrder } from '../../types';
import { logsService } from '../../services/api/logsService';

// Use LogFilters and LogsState from types/index.ts
type LogFilters = LogFiltersType;
type LogsState = LogsStateType;

const initialState: LogsState = {
  logs: [],
  filters: {},
  sorting: {
    field: 'timestamp',
    order: 'desc',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 50,
    totalItems: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchLogs = createAsyncThunk(
  'logs/fetchLogs',
  async (params: { page?: number; limit?: number; filters?: LogFilters } = {}) => {
    const { page = 1, limit = 50, filters = {} } = params;
    const response = await logsService.fetchLogs({ page, limit, filters });
    return {
      logs: response.data,
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages
    };
  }
);

export const createLogEntry = createAsyncThunk(
  'logs/createLogEntry',
  async (logData: Omit<LogEntry, 'id' | 'timestamp'>) => {
    return await logsService.createLog(logData);
  }
);

export const deleteOldLogs = createAsyncThunk(
  'logs/deleteOldLogs',
  async (daysToKeep: number = 90) => {
    return await logsService.clearAllLogs();
  }
);

const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<LogFilters>) => {
      state.filters = action.payload;
      state.pagination.currentPage = 1; // Reset to first page when filters change
    },
    
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.currentPage = 1;
    },
    
    setSorting: (state, action: PayloadAction<{ field: LogSortField; order: SortOrder }>) => {
      state.sorting = action.payload;
    },
    
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1; // Reset to first page when changing limit
    },
    
    addLogEntry: (state, action: PayloadAction<LogEntry>) => {
      state.logs.unshift(action.payload); // Add to beginning for newest first
      // Keep only the most recent logs in memory (limit to 1000)
      if (state.logs.length > 1000) {
        state.logs = state.logs.slice(0, 1000);
      }
    },
    
    clearLogs: (state) => {
      state.logs = [];
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch logs
      .addCase(fetchLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.logs;
        state.pagination = {
          currentPage: action.payload.page,
          itemsPerPage: action.payload.limit,
          totalItems: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch logs';
      })
      
      // Create log entry
      .addCase(createLogEntry.fulfilled, (state, action) => {
        state.logs.unshift(action.payload);
      })
      .addCase(createLogEntry.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create log entry';
      })
      
      // Delete old logs
      .addCase(deleteOldLogs.fulfilled, (state, action) => {
        // Refresh logs after cleanup
        // This will be handled by dispatching fetchLogs after successful cleanup
      })
      .addCase(deleteOldLogs.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete old logs';
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSorting,
  setPage,
  setItemsPerPage,
  addLogEntry,
  clearLogs,
  clearError,
} = logsSlice.actions;

// Selectors
export const selectLogs = (state: { logs: LogsState }) => state.logs.logs;
export const selectLogsFilters = (state: { logs: LogsState }) => state.logs.filters;
export const selectLogsLoading = (state: { logs: LogsState }) => state.logs.loading;
export const selectLogsError = (state: { logs: LogsState }) => state.logs.error;
export const selectLogsPagination = (state: { logs: LogsState }) => state.logs.pagination;
export const selectLogsSorting = (state: { logs: LogsState }) => state.logs.sorting;

export default logsSlice.reducer;

// Helper function to create log entries
export const createLog = (
  action: LogEntry['action'],
  entityType: LogEntry['entityType'],
  description: string,
  options: Partial<LogEntry> = {}
): Omit<LogEntry, 'id' | 'timestamp'> => {
  return {
    action,
    entityType,
    description,
    userId: 'system',
    severity: 'MEDIUM',
    category: 'ui',
    ...options,
  };
};