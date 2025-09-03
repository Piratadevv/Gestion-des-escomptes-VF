import { apiClient } from './client';
import { LogEntry, LogFilters, PaginatedResponse, ApiResponse } from '../../types';

/**
 * Service API pour la gestion des logs
 */
export const logsService = {
  /**
   * Récupère la liste des logs avec pagination et filtres
   */
  async fetchLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: LogFilters;
  }): Promise<PaginatedResponse<LogEntry>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    
    if (params.filters) {
      if (params.filters.category) queryParams.append('category', params.filters.category);
      if (params.filters.action) queryParams.append('action', params.filters.action);
      if (params.filters.severity) queryParams.append('severity', params.filters.severity);
      if (params.filters.entityType) queryParams.append('entityType', params.filters.entityType);
      if (params.filters.dateStart) queryParams.append('dateStart', params.filters.dateStart);
      if (params.filters.dateEnd) queryParams.append('dateEnd', params.filters.dateEnd);
    }

    const response = await apiClient.get<{
      logs: LogEntry[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/api/logs?${queryParams.toString()}`);

    return {
      data: response.logs,
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages
    };
  },

  /**
   * Crée une nouvelle entrée de log
   */
  async createLog(logEntry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<LogEntry> {
    const response = await apiClient.post<LogEntry>('/api/logs', logEntry);
    return response;
  },

  /**
   * Supprime une entrée de log
   */
  async deleteLog(id: string): Promise<void> {
    await apiClient.delete(`/api/logs/${id}`);
  },

  /**
   * Supprime tous les logs
   */
  async clearAllLogs(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<{ success: boolean; message: string }>('/api/logs?confirm=true');
    return {
      success: response.success,
      data: { message: response.message }
    };
  },

  /**
   * Récupère les statistiques des logs
   */
  async getLogStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byAction: Record<string, number>;
    bySeverity: Record<string, number>;
    byEntityType: Record<string, number>;
    last24Hours: number;
    lastWeek: number;
  }> {
    const response = await apiClient.get<{
      total: number;
      byCategory: Record<string, number>;
      byAction: Record<string, number>;
      bySeverity: Record<string, number>;
      byEntityType: Record<string, number>;
      last24Hours: number;
      lastWeek: number;
    }>('/api/logs/stats');
    return response;
  },

  /**
   * Exporte les logs au format spécifié
   */
  async exportLogs(params: {
    format?: 'json' | 'csv' | 'excel';
    filters?: LogFilters;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (params.format) queryParams.append('format', params.format);
    
    if (params.filters) {
      if (params.filters.category) queryParams.append('category', params.filters.category);
      if (params.filters.action) queryParams.append('action', params.filters.action);
      if (params.filters.severity) queryParams.append('severity', params.filters.severity);
      if (params.filters.entityType) queryParams.append('entityType', params.filters.entityType);
      if (params.filters.dateStart) queryParams.append('dateStart', params.filters.dateStart);
      if (params.filters.dateEnd) queryParams.append('dateEnd', params.filters.dateEnd);
    }

    const response = await apiClient.get<Blob>(`/api/logs/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    
    return response;
  }
};

export default logsService;