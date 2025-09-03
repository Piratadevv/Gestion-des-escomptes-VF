import { AxiosRequestConfig } from 'axios';
import { Escompte, EscompteResponse, Configuration, DashboardKPI, Refinancement, RefinancementResponse, LogEntry } from '../../types';

/**
 * Mock client for offline testing
 * Provides fallback responses when the backend is unavailable
 */
export class MockApiClient {
  private mockData = {
    escomptes: [
      
    ] as Escompte[],
    refinancements: [
      
    ] as Refinancement[],
    logs: [
      {
        id: 'log_1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        action: 'CREATE',
        category: 'data',
        severity: 'MEDIUM',
        description: 'Création d\'un nouvel escompte',
        entityType: 'ESCOMPTE',
        entityId: 'escompte_1',
        userId: 'system',
        changes: { montant: 5000, dateRemise: '2024-01-15' },
        metadata: { actionType: 'escomptes/createEscompte', userAgent: 'Mock Client' }
      },
      {
        id: 'log_2',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        action: 'UPDATE',
        category: 'data',
        severity: 'MEDIUM',
        description: 'Modification d\'un escompte existant',
        entityType: 'ESCOMPTE',
        entityId: 'escompte_2',
        userId: 'system',
        changes: { montant: 7500 },
        metadata: { actionType: 'escomptes/updateEscompte', userAgent: 'Mock Client' }
      },
      {
        id: 'log_3',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        action: 'DELETE',
        category: 'data',
        severity: 'HIGH',
        description: 'Suppression d\'un escompte',
        entityType: 'ESCOMPTE',
        entityId: 'escompte_3',
        userId: 'system',
        changes: { deleted: true },
        metadata: { actionType: 'escomptes/deleteEscompte', userAgent: 'Mock Client' }
      },
      {
        id: 'log_4',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        action: 'CREATE',
        category: 'data',
        severity: 'MEDIUM',
        description: 'Création d\'un nouveau refinancement',
        entityType: 'REFINANCEMENT',
        entityId: 'refinancement_1',
        userId: 'system',
        changes: { montantRefinance: 10000, dateRefinancement: '2024-01-15' },
        metadata: { actionType: 'refinancements/createRefinancement', userAgent: 'Mock Client' }
      },
      {
        id: 'log_5',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        action: 'EXPORT',
        category: 'system',
        severity: 'LOW',
        description: 'Export des données d\'escomptes',
        entityType: 'ESCOMPTE',
        userId: 'system',
        metadata: { actionType: 'escomptes/exportEscomptes', format: 'excel', userAgent: 'Mock Client' }
      }
    ] as LogEntry[],
    
    configuration: {
      autorisationBancaire: 0
    } as Configuration,
    
    kpi: {
      cumulTotal: 0,
      encoursRestant: 0,
      autorisationBancaire: 0,
      nombreEscomptes: 0,
      pourcentageUtilisation: 0,
      // Nouveaux champs KPI pour refinancements et global
      cumulRefinancements: 0,
      nombreRefinancements: 0,
      cumulGlobal: 0,
      encoursRestantGlobal: 0,
      pourcentageUtilisationGlobal: 0,
    } as DashboardKPI
  };

  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    await this.delay();
    
    if (url.includes('/api/escomptes')) {
      // Skip export URLs - let them go to the real API
      if (url.includes('/export')) {
        throw new Error('Network error - falling back to real API');
      }
      
      const response: EscompteResponse = {
        escomptes: this.mockData.escomptes,
        total: this.mockData.escomptes.length,
        page: 1,
        limit: 10,
        totalPages: 1
      };
      return response as T;
    }

    if (url.includes('/api/refinancements')) {
      // Skip export URLs - let them go to the real API
      if (url.includes('/export')) {
        throw new Error('Network error - falling back to real API');
      }

      // Simple pagination mock (page & limit support basique)
      let page = 1, limit = 10;
      const qIndex = url.indexOf('?');
      if (qIndex !== -1) {
        const qs = url.substring(qIndex + 1);
        const params = new URLSearchParams(qs);
        const p = params.get('page');
        const l = params.get('limit');
        if (p) page = parseInt(p, 10) || 1;
        if (l) limit = parseInt(l, 10) || 10;
      }
      const total = this.mockData.refinancements.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const start = (page - 1) * limit;
      const refinancements = this.mockData.refinancements.slice(start, start + limit);

      const response: RefinancementResponse = {
        refinancements,
        total,
        page,
        limit,
        totalPages,
      };
      return response as T;
    }
    
    if (url.includes('/api/configuration')) {
      return this.mockData.configuration as T;
    }
    
    if (url.includes('/api/dashboard/kpi')) {
      return this.mockData.kpi as T;
    }
    
    if (url.includes('/api/logs')) {
      // Handle logs API endpoints
      if (url.includes('/stats')) {
        const stats = {
          total: this.mockData.logs.length,
          byCategory: {},
          byAction: {},
          bySeverity: {},
          byEntityType: {},
          last24Hours: 0,
          lastWeek: 0
        };
        return stats as T;
      }
      
      // Parse query parameters for logs
      const urlObj = new URL(url, 'http://localhost');
      const page = parseInt(urlObj.searchParams.get('page') || '1');
      const limit = parseInt(urlObj.searchParams.get('limit') || '50');
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLogs = this.mockData.logs.slice(startIndex, endIndex);
      
      const response = {
        logs: paginatedLogs,
        total: this.mockData.logs.length,
        page,
        limit,
        totalPages: Math.ceil(this.mockData.logs.length / limit)
      };
      return response as T;
    }
    
    throw new Error(`Mock API: Route non supportée: ${url}`);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    await this.delay();
    
    if (url.includes('/api/escomptes')) {
      // Créer un nouvel escompte
      const newEscompte: Escompte = {
        ...data,
        id: `mock-${Date.now()}`,
        ordreSaisie: this.mockData.escomptes.length + 1,
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      };
      
      this.mockData.escomptes.unshift(newEscompte);
      this.updateKPI();
      
      return newEscompte as T;
    }

    if (url.includes('/api/logs')) {
      // Create a new log entry
      const newLog: LogEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        action: data.action,
        category: data.category,
        severity: data.severity || 'MEDIUM',
        description: data.message,
        entityType: data.entityType || undefined,
        entityId: data.entityId || undefined,
        changes: data.changes || undefined,
        metadata: data.metadata || undefined
      };
      
      this.mockData.logs.unshift(newLog);
      
      // Keep only the last 1000 logs
      if (this.mockData.logs.length > 1000) {
        this.mockData.logs = this.mockData.logs.slice(0, 1000);
      }
      
      return newLog as T;
    }

    if (url.includes('/api/refinancements')) {
      if (url.includes('/validate')) {
        return { valid: true } as T;
      }
      if (url.includes('/calculate-impact')) {
        const montantRefinance = data?.montantRefinance ?? 0;
        const cumul = this.mockData.refinancements.reduce((s, r) => s + r.montantRefinance, 0);
        const nouveauCumul = cumul + montantRefinance;
        const autorisation = this.mockData.configuration.autorisationBancaire || 0;
        const nouvelEncours = autorisation - nouveauCumul;
        const depassementAutorisation = nouvelEncours < 0;
        return { nouveauCumul, nouvelEncours, depassementAutorisation } as T;
      }
      if (url.endsWith('/recalculate')) {
        const cumulTotal = this.mockData.refinancements.reduce((s, r) => s + r.montantRefinance, 0);
        const encoursRestant = (this.mockData.configuration.autorisationBancaire || 0) - cumulTotal;
        return { cumulTotal, encoursRestant } as T;
      }

      // Créer un nouveau refinancement
      const newRef: Refinancement = {
        ...data,
        id: `mock-ref-${Date.now()}`,
        ordreSaisie: this.mockData.refinancements.length + 1,
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      };
      
      this.mockData.refinancements.unshift(newRef);
      this.updateKPI();
      return newRef as T;
    }
    
    if (url.includes('/api/configuration')) {
      this.mockData.configuration = { ...this.mockData.configuration, ...data };
      this.updateKPI();
      return this.mockData.configuration as T;
    }
    
    throw new Error(`Mock API: Route POST non supportée: ${url}`);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    await this.delay();
    
    if (url.includes('/api/escomptes/')) {
      const id = url.split('/').pop();
      const index = this.mockData.escomptes.findIndex(e => e.id === id);
      
      if (index !== -1) {
        this.mockData.escomptes[index] = {
          ...this.mockData.escomptes[index],
          ...data,
          dateModification: new Date().toISOString()
        };
        this.updateKPI();
        return this.mockData.escomptes[index] as T;
      }
      
      throw new Error('Escompte non trouvé');
    }

    if (url.includes('/api/refinancements/')) {
      const id = url.split('/').pop();
      const index = this.mockData.refinancements.findIndex(r => r.id === id);
      if (index !== -1) {
        this.mockData.refinancements[index] = {
          ...this.mockData.refinancements[index],
          ...data,
          dateModification: new Date().toISOString()
        };
        this.updateKPI();
        return this.mockData.refinancements[index] as T;
      }
      throw new Error('Refinancement non trouvé');
    }
    
    if (url.includes('/api/configuration')) {
      this.mockData.configuration = { ...this.mockData.configuration, ...data };
      this.updateKPI();
      return this.mockData.configuration as T;
    }
    
    throw new Error(`Mock API: Route PUT non supportée: ${url}`);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.put(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    await this.delay();
    
    if (url.includes('/api/escomptes/')) {
      const id = url.split('/').pop();
      const index = this.mockData.escomptes.findIndex(e => e.id === id);
      
      if (index !== -1) {
        this.mockData.escomptes.splice(index, 1);
        this.updateKPI();
        return { success: true } as T;
      }
      throw new Error('Escompte non trouvé');
    }
    
    if (url.includes('/api/logs')) {
      if (url.includes('/api/logs/')) {
        // Delete specific log by ID
        const id = url.split('/').pop();
        const index = this.mockData.logs.findIndex(log => log.id === id);
        if (index !== -1) {
          this.mockData.logs.splice(index, 1);
          return { success: true } as T;
        }
        throw new Error('Log non trouvé');
      } else {
        // Clear all logs (DELETE /api/logs)
        const deletedCount = this.mockData.logs.length;
        this.mockData.logs = [];
        return { success: true, message: `${deletedCount} logs supprimés` } as T;
      }
    }
    
    if (url.includes('/api/refinancements/')) {
      const id = url.split('/').pop();
      const index = this.mockData.refinancements.findIndex(r => r.id === id);
      if (index !== -1) {
        this.mockData.refinancements.splice(index, 1);
        this.updateKPI();
        return { success: true } as T;
      }
      throw new Error('Refinancement non trouvé');
    }
    
    throw new Error(`Mock API: Route DELETE non supportée: ${url}`);
  }

  async downloadFile(url: string, filename: string): Promise<void> {
    // Skip export URLs - let them go to the real API
    if (url.includes('/export')) {
      // Silently reject to force fallback to real API without showing error
      const error = new Error('Export redirect');
      (error as any).code = 'EXPORT_REDIRECT';
      (error as any).silent = true;
      throw error;
    }
    
    await this.delay();
    
    // Simuler un téléchargement
    const content = 'Mock file content for: ' + filename;
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const downloadUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }

  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    await this.delay(1000);
    
    // Simuler la progression
    if (onProgress) {
      for (let i = 0; i <= 100; i += 20) {
        setTimeout(() => onProgress(i), i * 10);
      }
    }
    
    throw new Error(`Mock API: Upload non supporté pour: ${url}`);
  }

  private updateKPI(): void {
    const totalEscomptes = this.mockData.escomptes.reduce((sum, e) => sum + e.montant, 0);
    const totalRefinancements = this.mockData.refinancements.reduce((sum, r) => sum + r.montantRefinance, 0);
    const autorisation = this.mockData.configuration.autorisationBancaire || 0;
    const encoursRestant = autorisation - totalEscomptes;
    const pct = autorisation > 0 ? Math.round((totalEscomptes / autorisation) * 100) : 0;

    this.mockData.kpi = {
      ...this.mockData.kpi,
      autorisationBancaire: autorisation,
      cumulTotal: totalEscomptes,
      encoursRestant: encoursRestant,
      nombreEscomptes: this.mockData.escomptes.length,
      pourcentageUtilisation: pct,
      cumulRefinancements: totalRefinancements,
      nombreRefinancements: this.mockData.refinancements.length,
      cumulGlobal: totalEscomptes + totalRefinancements,
      encoursRestantGlobal: autorisation - (totalEscomptes + totalRefinancements),
      pourcentageUtilisationGlobal: autorisation > 0 ? Math.round(((totalEscomptes + totalRefinancements) / autorisation) * 100) : 0
    };
  }
}

export const mockApiClient = new MockApiClient();