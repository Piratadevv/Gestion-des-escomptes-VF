import { apiClient } from './client';
import { Refinancement, RefinancementResponse, RefinancementFilters, RefinancementSortOptions, PaginationOptions, RefinancementFormData } from '../../types';

/**
 * Service API pour la gestion des refinancements
 */
export class RefinancementsApi {
  private readonly basePath = '/api/refinancements';

  /**
   * Récupère la liste des refinancements avec pagination, filtres et tri
   */
  async getRefinancements(
    pagination: PaginationOptions,
    filters?: RefinancementFilters,
    sort?: RefinancementSortOptions
  ): Promise<RefinancementResponse> {
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
      if (filters.recherche) params.append('recherche', filters.recherche);
      if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
      if (filters.dateFin) params.append('dateFin', filters.dateFin);
      if (filters.montantMin !== undefined) params.append('montantMin', filters.montantMin.toString());
      if (filters.montantMax !== undefined) params.append('montantMax', filters.montantMax.toString());
      if (filters.tauxMin !== undefined) params.append('tauxMin', filters.tauxMin.toString());
      if (filters.tauxMax !== undefined) params.append('tauxMax', filters.tauxMax.toString());
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.libelle) params.append('libelle', filters.libelle);
    }

    return apiClient.get<RefinancementResponse>(`${this.basePath}?${params.toString()}`);
  }

  /**
   * Récupère un refinancement par son ID
   */
  async getRefinancementById(id: string): Promise<Refinancement> {
    return apiClient.get<Refinancement>(`${this.basePath}/${id}`);
  }

  /**
   * Crée un nouveau refinancement
   */
  async createRefinancement(data: RefinancementFormData): Promise<Refinancement> {
    return apiClient.post<Refinancement>(this.basePath, data);
  }

  /**
   * Met à jour un refinancement existant
   */
  async updateRefinancement(id: string, data: Partial<Refinancement>): Promise<Refinancement> {
    return apiClient.put<Refinancement>(`${this.basePath}/${id}`, data);
  }

  /**
   * Supprime un refinancement
   */
  async deleteRefinancement(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Supprime plusieurs refinancements
   */
  async deleteMultipleRefinancements(ids: string[]): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/bulk-delete`, { ids });
  }

  /**
   * Exporte les refinancements au format CSV ou Excel
   */
  async exportRefinancements(
    format: 'csv' | 'excel',
    filters?: RefinancementFilters
  ): Promise<void> {
    const params = new URLSearchParams();
    params.append('format', format);

    if (filters) {
      if (filters.recherche) params.append('recherche', filters.recherche);
      if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
      if (filters.dateFin) params.append('dateFin', filters.dateFin);
      if (filters.montantMin !== undefined) params.append('montantMin', filters.montantMin.toString());
      if (filters.montantMax !== undefined) params.append('montantMax', filters.montantMax.toString());
      if (filters.tauxMin !== undefined) params.append('tauxMin', filters.tauxMin.toString());
      if (filters.tauxMax !== undefined) params.append('tauxMax', filters.tauxMax.toString());
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.libelle) params.append('libelle', filters.libelle);
    }

    const filename = `refinancements_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
    return apiClient.downloadFile(`${this.basePath}/export?${params.toString()}`, filename);
  }



  /**
   * Valide un refinancement avant création/modification
   */
  async validateRefinancement(data: RefinancementFormData): Promise<{ valid: boolean; errors?: string[] }> {
    return apiClient.post<{ valid: boolean; errors?: string[] }>(
      `${this.basePath}/validate`,
      data
    );
  }

  /**
   * Calcule l'impact d'un nouveau refinancement sur les totaux
   */
  async calculateImpact(montantRefinance: number): Promise<{
    nouveauCumul: number;
    nouvelEncours: number;
    depassementAutorisation: boolean;
  }> {
    return apiClient.post<{
      nouveauCumul: number;
      nouvelEncours: number;
      depassementAutorisation: boolean;
    }>(`${this.basePath}/calculate-impact`, { montantRefinance });
  }

  /**
   * Recalcule tous les totaux
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

// Instance singleton de l'API des refinancements
const refinancementsApi = new RefinancementsApi();

// Wrappers exportés pour préserver le contexte 'this'
export const getRefinancements = (
  pagination: PaginationOptions,
  filters?: RefinancementFilters,
  sort?: RefinancementSortOptions
): Promise<RefinancementResponse> => refinancementsApi.getRefinancements(pagination, filters, sort);

export const getRefinancementById = (id: string): Promise<Refinancement> =>
  refinancementsApi.getRefinancementById(id);

export const createRefinancement = (data: RefinancementFormData): Promise<Refinancement> =>
  refinancementsApi.createRefinancement(data);

export const updateRefinancement = (id: string, data: Partial<Refinancement>): Promise<Refinancement> =>
  refinancementsApi.updateRefinancement(id, data);

export const deleteRefinancement = (id: string): Promise<void> =>
  refinancementsApi.deleteRefinancement(id);

export const deleteMultipleRefinancements = (ids: string[]): Promise<void> =>
  refinancementsApi.deleteMultipleRefinancements(ids);

export const exportRefinancements = (
  format: 'csv' | 'excel',
  filters?: RefinancementFilters
): Promise<void> => refinancementsApi.exportRefinancements(format, filters);



export const validateRefinancement = (data: RefinancementFormData): Promise<{ valid: boolean; errors?: string[] }> =>
  refinancementsApi.validateRefinancement(data);

export const calculateRefinancementImpact = (montantRefinance: number): Promise<{
  nouveauCumul: number;
  nouvelEncours: number;
  depassementAutorisation: boolean;
}> => refinancementsApi.calculateImpact(montantRefinance);

export const recalculateRefinancementsTotals = (): Promise<{
  cumulTotal: number;
  encoursRestant: number;
}> => refinancementsApi.recalculateTotals();

export default refinancementsApi;