import { apiClient } from './client';
import { Configuration } from '../../types';

/**
 * Service API pour la gestion de la configuration
 */
export class ConfigurationApi {
  private readonly basePath = '/api/configuration';
  private readonly storageKey = 'gestionesc_configuration';

  private readFromStorage(): Configuration | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as Configuration) : null;
    } catch {
      return null;
    }
  }

  private writeToStorage(configuration: Configuration): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(configuration));
    } catch {
      // ignore storage errors
    }
  }

  /**
   * Récupère la configuration actuelle
   */
  async getConfiguration(): Promise<Configuration> {
    try {
      return await apiClient.get<Configuration>(this.basePath);
    } catch (error) {
      const cached = this.readFromStorage();
      if (cached) return cached;
      // valeur par défaut minimale si API indisponible
      const fallback: Configuration = { autorisationBancaire: 0 } as Configuration;
      this.writeToStorage(fallback);
      return fallback;
    }
  }

  /**
   * Met à jour la configuration
   */
  async updateConfiguration(configuration: Configuration): Promise<Configuration> {
    try {
      const updated = await apiClient.put<Configuration>(this.basePath, configuration);
      // synchroniser le cache local
      this.writeToStorage(updated);
      return updated;
    } catch (error) {
      // mode hors-ligne: persister localement
      this.writeToStorage(configuration);
      return configuration;
    }
  }

  /**
   * Valide une nouvelle autorisation bancaire
   */
  async validateAutorisation(autorisationBancaire: number): Promise<{
    valid: boolean;
    warnings?: string[];
    errors?: string[];
  }> {
    return apiClient.post<{
      valid: boolean;
      warnings?: string[];
      errors?: string[];
    }>(`${this.basePath}/validate-autorisation`, { autorisationBancaire });
  }

  /**
   * Calcule l'impact d'un changement d'autorisation bancaire
   */
  async calculateAutorisationImpact(nouvelleAutorisation: number): Promise<{
    ancienneAutorisation: number;
    nouvelleAutorisation: number;
    cumulActuel: number;
    nouvelEncours: number;
    impactPourcentage: number;
    depassement: boolean;
  }> {
    return apiClient.post<{
      ancienneAutorisation: number;
      nouvelleAutorisation: number;
      cumulActuel: number;
      nouvelEncours: number;
      impactPourcentage: number;
      depassement: boolean;
    }>(`${this.basePath}/calculate-impact`, { nouvelleAutorisation });
  }

  /**
   * Réinitialise la configuration aux valeurs par défaut
   */
  async resetConfiguration(): Promise<Configuration> {
    return apiClient.post<Configuration>(`${this.basePath}/reset`);
  }

  /**
   * Exporte la configuration
   */
  async exportConfiguration(): Promise<void> {
    const filename = `configuration_${new Date().toISOString().split('T')[0]}.json`;
    return apiClient.downloadFile(`${this.basePath}/export`, filename);
  }

  /**
   * Importe une configuration depuis un fichier
   */
  async importConfiguration(file: File): Promise<Configuration> {
    return apiClient.uploadFile<Configuration>(`${this.basePath}/import`, file);
  }

  /**
   * Récupère l'historique des modifications de configuration
   */
  async getConfigurationHistory(): Promise<Array<{
    id: string;
    ancienneValeur: number;
    nouvelleValeur: number;
    utilisateur: string;
    dateModification: string;
    raison?: string;
  }>> {
    return apiClient.get<Array<{
      id: string;
      ancienneValeur: number;
      nouvelleValeur: number;
      utilisateur: string;
      dateModification: string;
      raison?: string;
    }>>(`${this.basePath}/history`);
  }
}

// Instance singleton de l'API de configuration
const configurationApi = new ConfigurationApi();

// Export de wrappers qui préservent le contexte 'this'
export const getConfiguration = (): Promise<Configuration> =>
  configurationApi.getConfiguration();

export const updateConfiguration = (configuration: Configuration): Promise<Configuration> =>
  configurationApi.updateConfiguration(configuration);

export const validateAutorisation = (autorisationBancaire: number): Promise<{
  valid: boolean;
  warnings?: string[];
  errors?: string[];
}> => configurationApi.validateAutorisation(autorisationBancaire);

export const calculateAutorisationImpact = (nouvelleAutorisation: number): Promise<{
  ancienneAutorisation: number;
  nouvelleAutorisation: number;
  cumulActuel: number;
  nouvelEncours: number;
  impactPourcentage: number;
  depassement: boolean;
}> => configurationApi.calculateAutorisationImpact(nouvelleAutorisation);

export const resetConfiguration = (): Promise<Configuration> =>
  configurationApi.resetConfiguration();

export const exportConfiguration = (): Promise<void> =>
  configurationApi.exportConfiguration();

export const importConfiguration = (file: File): Promise<Configuration> =>
  configurationApi.importConfiguration(file);

export const getConfigurationHistory = (): Promise<Array<{
  id: string;
  ancienneValeur: number;
  nouvelleValeur: number;
  utilisateur: string;
  dateModification: string;
  raison?: string;
}>> => configurationApi.getConfigurationHistory();

export default configurationApi;