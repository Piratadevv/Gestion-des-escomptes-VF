import { apiClient } from './client';
import { Escompte, EscompteResponse, EscompteFilters, SortOptions, PaginationOptions, EscompteFormData } from '../../types';

/**
 * Service API pour la gestion des escomptes
 */
export class EscomptesApi {
  private readonly basePath = '/api/escomptes';

  /**
   * Récupère la liste des escomptes avec pagination, filtres et tri
   */
  async getEscomptes(
    pagination: PaginationOptions,
    filters?: EscompteFilters,
    sort?: SortOptions
  ): Promise<EscompteResponse> {
    const params = new URLSearchParams();
    
    // Pagination
    params.append('page', pagination.page.toString());
    params.append('limit', pagination.limit.toString());
    
    // Tri
    if (sort) {
      params.append('sortField', sort.field);
      params.append('sortDirection', sort.direction);
    }
    
    // Filtres
    if (filters) {
      if (filters.recherche) {
        params.append('recherche', filters.recherche);
      }
      if (filters.dateDebut) {
        params.append('dateDebut', filters.dateDebut);
      }
      if (filters.dateFin) {
        params.append('dateFin', filters.dateFin);
      }
      if (filters.montantMin !== undefined) {
        params.append('montantMin', filters.montantMin.toString());
      }
      if (filters.montantMax !== undefined) {
        params.append('montantMax', filters.montantMax.toString());
      }
    }
    
    return apiClient.get<EscompteResponse>(`${this.basePath}?${params.toString()}`);
  }

  /**
   * Récupère un escompte par son ID
   */
  async getEscompteById(id: string): Promise<Escompte> {
    return apiClient.get<Escompte>(`${this.basePath}/${id}`);
  }

  /**
   * Crée un nouvel escompte
   */
  async createEscompte(escompte: EscompteFormData): Promise<Escompte> {
    return apiClient.post<Escompte>(this.basePath, escompte);
  }

  /**
   * Met à jour un escompte existant
   */
  async updateEscompte(id: string, escompte: Partial<Escompte>): Promise<Escompte> {
    return apiClient.put<Escompte>(`${this.basePath}/${id}`, escompte);
  }

  /**
   * Supprime un escompte
   */
  async deleteEscompte(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Supprime plusieurs escomptes
   */
  async deleteMultipleEscomptes(ids: string[]): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/bulk-delete`, { ids });
  }

  /**
   * Exporte les escomptes au format CSV ou Excel
   */
  async exportEscomptes(
    format: 'csv' | 'excel',
    filters?: EscompteFilters
  ): Promise<void> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters) {
      if (filters.recherche) {
        params.append('recherche', filters.recherche);
      }
      if (filters.dateDebut) {
        params.append('dateDebut', filters.dateDebut);
      }
      if (filters.dateFin) {
        params.append('dateFin', filters.dateFin);
      }
      if (filters.montantMin !== undefined) {
        params.append('montantMin', filters.montantMin.toString());
      }
      if (filters.montantMax !== undefined) {
        params.append('montantMax', filters.montantMax.toString());
      }
    }
    
    const filename = `escomptes_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
    return apiClient.downloadFile(`${this.basePath}/export?${params.toString()}`, filename);
  }



  /**
   * Valide un escompte avant création/modification
   */
  async validateEscompte(escompte: EscompteFormData): Promise<{ valid: boolean; errors?: string[] }> {
    return apiClient.post<{ valid: boolean; errors?: string[] }>(
      `${this.basePath}/validate`,
      escompte
    );
  }

  /**
   * Calcule l'impact d'un nouvel escompte sur les totaux
   */
  async calculateImpact(montant: number): Promise<{
    nouveauCumul: number;
    nouvelEncours: number;
    depassementAutorisation: boolean;
  }> {
    return apiClient.post<{
      nouveauCumul: number;
      nouvelEncours: number;
      depassementAutorisation: boolean;
    }>(`${this.basePath}/calculate-impact`, { montant });
  }

  /**
   * Recalcule tous les totaux (utile après modification de l'autorisation)
   */
  async recalculateTotals(): Promise<{
    cumulTotal: number;
    encoursRestant: number;
  }> {
    return apiClient.post<{
      cumulTotal: number;
      encoursRestant: number;
    }>(`${this.basePath}/recalculate`);
  }
}

// Instance singleton de l'API des escomptes
const escomptesApi = new EscomptesApi();

// Export de wrappers qui préservent le contexte 'this'
export const getEscomptes = (
  pagination: PaginationOptions,
  filters?: EscompteFilters,
  sort?: SortOptions
): Promise<EscompteResponse> => escomptesApi.getEscomptes(pagination, filters, sort);

export const getEscompteById = (id: string): Promise<Escompte> =>
  escomptesApi.getEscompteById(id);

export const createEscompte = (escompte: EscompteFormData): Promise<Escompte> =>
  escomptesApi.createEscompte(escompte);

export const updateEscompte = (id: string, escompte: Partial<Escompte>): Promise<Escompte> =>
  escomptesApi.updateEscompte(id, escompte);

export const deleteEscompte = (id: string): Promise<void> =>
  escomptesApi.deleteEscompte(id);

export const deleteMultipleEscomptes = (ids: string[]): Promise<void> =>
  escomptesApi.deleteMultipleEscomptes(ids);

export const exportEscomptes = (
  format: 'csv' | 'excel',
  filters?: EscompteFilters
): Promise<void> => escomptesApi.exportEscomptes(format, filters);



export const validateEscompte = (escompte: EscompteFormData): Promise<{ valid: boolean; errors?: string[] }> =>
  escomptesApi.validateEscompte(escompte);

export const calculateImpact = (montant: number): Promise<{
  nouveauCumul: number;
  nouvelEncours: number;
  depassementAutorisation: boolean;
}> => escomptesApi.calculateImpact(montant);

export const recalculateTotals = (): Promise<{
  cumulTotal: number;
  encoursRestant: number;
}> => escomptesApi.recalculateTotals();

export default escomptesApi;