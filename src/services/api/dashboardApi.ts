import { apiClient } from './client';
import { DashboardKPI } from '../../types';

/**
 * Service API pour le dashboard et les indicateurs
 */
export class DashboardApi {
  private readonly basePath = '/api/dashboard';

  /**
   * Récupère les indicateurs clés de performance (KPI)
   */
  async getDashboardKPI(): Promise<DashboardKPI> {
    return apiClient.get<DashboardKPI>(`${this.basePath}/kpi`);
  }

  /**
   * Récupère les statistiques détaillées
   */
  async getDetailedStats(): Promise<{
    escomptesParMois: Array<{ mois: string; nombre: number; montant: number }>;
    evolutionCumul: Array<{ date: string; cumul: number }>;
    repartitionMontants: Array<{ tranche: string; nombre: number; pourcentage: number }>;
    topLibelles: Array<{ libelle: string; nombre: number; montantTotal: number }>;
  }> {
    return apiClient.get<{
      escomptesParMois: Array<{ mois: string; nombre: number; montant: number }>;
      evolutionCumul: Array<{ date: string; cumul: number }>;
      repartitionMontants: Array<{ tranche: string; nombre: number; pourcentage: number }>;
      topLibelles: Array<{ libelle: string; nombre: number; montantTotal: number }>;
    }>(`${this.basePath}/stats`);
  }

  /**
   * Récupère les alertes et notifications
   */
  async getAlerts(): Promise<Array<{
    id: string;
    type: 'warning' | 'danger' | 'info';
    titre: string;
    message: string;
    dateCreation: string;
    lu: boolean;
  }>> {
    return apiClient.get<Array<{
      id: string;
      type: 'warning' | 'danger' | 'info';
      titre: string;
      message: string;
      dateCreation: string;
      lu: boolean;
    }>>(`${this.basePath}/alerts`);
  }

  /**
   * Marque une alerte comme lue
   */
  async markAlertAsRead(alertId: string): Promise<void> {
    return apiClient.patch<void>(`${this.basePath}/alerts/${alertId}/read`);
  }

  /**
   * Marque toutes les alertes comme lues
   */
  async markAllAlertsAsRead(): Promise<void> {
    return apiClient.patch<void>(`${this.basePath}/alerts/read-all`);
  }

  /**
   * Récupère les données pour les graphiques
   */
  async getChartData(type: 'evolution' | 'repartition' | 'mensuel', periode?: string): Promise<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string;
      fill?: boolean;
    }>;
  }> {
    const params = new URLSearchParams();
    if (periode) {
      params.append('periode', periode);
    }
    
    return apiClient.get<{
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string;
        fill?: boolean;
      }>;
    }>(`${this.basePath}/charts/${type}?${params.toString()}`);
  }

  /**
   * Récupère les prévisions basées sur l'historique
   */
  async getForecasts(): Promise<{
    previsionCumul: Array<{ date: string; montant: number; confiance: number }>;
    previsionUtilisation: Array<{ mois: string; pourcentage: number }>;
    recommandations: Array<{
      type: 'optimization' | 'warning' | 'opportunity';
      titre: string;
      description: string;
      impact: number;
    }>;
  }> {
    return apiClient.get<{
      previsionCumul: Array<{ date: string; montant: number; confiance: number }>;
      previsionUtilisation: Array<{ mois: string; pourcentage: number }>;
      recommandations: Array<{
        type: 'optimization' | 'warning' | 'opportunity';
        titre: string;
        description: string;
        impact: number;
      }>;
    }>(`${this.basePath}/forecasts`);
  }

  /**
   * Exporte un rapport de dashboard
   */
  async exportDashboardReport(
    format: 'pdf' | 'excel',
    options: {
      includeCharts?: boolean;
      includeStats?: boolean;
      includeForecasts?: boolean;
      periode?: string;
    } = {}
  ): Promise<void> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (options.includeCharts) params.append('includeCharts', 'true');
    if (options.includeStats) params.append('includeStats', 'true');
    if (options.includeForecasts) params.append('includeForecasts', 'true');
    if (options.periode) params.append('periode', options.periode);
    
    const filename = `rapport_dashboard_${new Date().toISOString().split('T')[0]}.${format}`;
    return apiClient.downloadFile(`${this.basePath}/export?${params.toString()}`, filename);
  }

  /**
   * Récupère les métriques de performance
   */
  async getPerformanceMetrics(): Promise<{
    tempsReponseAPI: number;
    nombreRequetes24h: number;
    tauxErreur: number;
    utilisateursActifs: number;
    derniereMiseAJour: string;
  }> {
    return apiClient.get<{
      tempsReponseAPI: number;
      nombreRequetes24h: number;
      tauxErreur: number;
      utilisateursActifs: number;
      derniereMiseAJour: string;
    }>(`${this.basePath}/performance`);
  }
}

// Instance singleton de l'API du dashboard
const dashboardApi = new DashboardApi();

// Export de wrappers qui préservent le contexte 'this'
export const getDashboardKPI = (): Promise<DashboardKPI> =>
  dashboardApi.getDashboardKPI();

export const getDetailedStats = (): Promise<{
  escomptesParMois: Array<{ mois: string; nombre: number; montant: number }>;
  evolutionCumul: Array<{ date: string; cumul: number }>;
  repartitionMontants: Array<{ tranche: string; nombre: number; pourcentage: number }>;
  topLibelles: Array<{ libelle: string; nombre: number; montantTotal: number }>;
}> => dashboardApi.getDetailedStats();

export const getAlerts = (): Promise<Array<{
  id: string;
  type: 'warning' | 'danger' | 'info';
  titre: string;
  message: string;
  dateCreation: string;
  lu: boolean;
}>> => dashboardApi.getAlerts();

export const markAlertAsRead = (alertId: string): Promise<void> =>
  dashboardApi.markAlertAsRead(alertId);

export const markAllAlertsAsRead = (): Promise<void> =>
  dashboardApi.markAllAlertsAsRead();

export const getChartData = (type: 'evolution' | 'repartition' | 'mensuel', periode?: string): Promise<{
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }>;
}> => dashboardApi.getChartData(type, periode);

export const getForecasts = (): Promise<{
  previsionCumul: Array<{ date: string; montant: number; confiance: number }>;
  previsionUtilisation: Array<{ mois: string; pourcentage: number }>;
  recommandations: Array<{
    type: 'optimization' | 'warning' | 'opportunity';
    titre: string;
    description: string;
    impact: number;
  }>;
}> => dashboardApi.getForecasts();

export const exportDashboardReport = (
  format: 'pdf' | 'excel',
  options: {
    includeCharts?: boolean;
    includeStats?: boolean;
    includeForecasts?: boolean;
    periode?: string;
  } = {}
): Promise<void> => dashboardApi.exportDashboardReport(format, options);

export const getPerformanceMetrics = (): Promise<{
  tempsReponseAPI: number;
  nombreRequetes24h: number;
  tauxErreur: number;
  utilisateursActifs: number;
  derniereMiseAJour: string;
}> => dashboardApi.getPerformanceMetrics();

export default dashboardApi;