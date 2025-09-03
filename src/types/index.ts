import { z } from 'zod';

// Schémas de validation Zod
export const EscompteSchema = z.object({
  id: z.string().uuid().optional(),
  dateRemise: z.string().min(1, 'La date de remise est obligatoire'),
  libelle: z.string().min(1, 'Le libellé est obligatoire').max(255, 'Le libellé ne peut pas dépasser 255 caractères'),
  montant: z.number().positive('Le montant doit être positif').multipleOf(0.01, 'Le montant doit avoir au maximum 2 décimales'),
  ordreSaisie: z.number().int().positive().optional(),
  dateCreation: z.string().optional(),
  dateModification: z.string().optional(),
});

export const ConfigurationSchema = z.object({
  autorisationBancaire: z.number().positive('L\'autorisation bancaire doit être positive').multipleOf(0.01, 'L\'autorisation bancaire doit avoir au maximum 2 décimales'),
});

export const RefinancementSchema = z.object({
  id: z.string().uuid().optional(),
  dateRefinancement: z.string().min(1, 'La date de refinancement est obligatoire'),
  libelle: z.string().min(1, 'Le libellé est obligatoire').max(255, 'Le libellé ne peut pas dépasser 255 caractères'),
  montantRefinance: z.number().positive('Le montant refinancé doit être positif').multipleOf(0.01, 'Le montant doit avoir au maximum 2 décimales'),
  tauxInteret: z.number().min(0, 'Le taux ne peut pas être négatif').max(100, 'Le taux ne peut pas dépasser 100%').multipleOf(0.01, 'Le taux doit avoir au maximum 2 décimales'),
  dureeEnMois: z.number().int().positive('La durée doit être positive').max(360, 'La durée ne peut pas dépasser 360 mois'),
  encoursRefinance: z.number().min(0, 'L\'encours refinancé ne peut pas être négatif').multipleOf(0.01),
  fraisDossier: z.number().min(0, 'Les frais de dossier ne peuvent pas être négatifs').multipleOf(0.01).optional().default(0),
  conditions: z.string().max(500, 'Les conditions ne peuvent pas dépasser 500 caractères').optional(),
  statut: z.enum(['ACTIF', 'TERMINE', 'SUSPENDU']).default('ACTIF'),
  ordreSaisie: z.number().int().positive().optional(),
  dateCreation: z.string().optional(),
  dateModification: z.string().optional(),
});

export const AuditSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  entityType: z.enum(['ESCOMPTE', 'REFINANCEMENT', 'CONFIGURATION']),
  entityId: z.string(),
  anciennesValeurs: z.record(z.any()).optional(),
  nouvellesValeurs: z.record(z.any()).optional(),
  utilisateur: z.string(),
  dateAction: z.string(),
});

// Schémas pour les logs
export const LogEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'SAVE_STATE']),
  category: z.enum(['data', 'ui', 'system', 'configuration', 'error']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  entityType: z.enum(['ESCOMPTE', 'REFINANCEMENT', 'CONFIGURATION', 'USER', 'SYSTEM']).optional(),
  entityId: z.string().optional(),
  description: z.string(),
  changes: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  userId: z.string().optional(),
});

// Types TypeScript dérivés des schémas Zod
export type Escompte = z.infer<typeof EscompteSchema>;
export type Refinancement = z.infer<typeof RefinancementSchema>;
export type Configuration = z.infer<typeof ConfigurationSchema>;
export type Audit = z.infer<typeof AuditSchema>;
export type LogEntry = z.infer<typeof LogEntrySchema>;

// Types pour les logs
export type LogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'SAVE_STATE';
export type LogCategory = 'data' | 'ui' | 'system' | 'configuration' | 'error';
export type LogSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type LogEntityType = 'ESCOMPTE' | 'REFINANCEMENT' | 'CONFIGURATION' | 'USER' | 'SYSTEM';

export interface LogFilters {
  search?: string;
  category?: LogCategory;
  action?: LogAction;
  severity?: LogSeverity;
  entityType?: LogEntityType;
  dateStart?: string;
  dateEnd?: string;
}

export interface LogsState {
  logs: LogEntry[];
  filters: LogFilters;
  sorting: {
    field: LogSortField;
    order: SortOrder;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}

export type LogSortField = 'timestamp' | 'action' | 'category' | 'severity' | 'entityType' | 'userId';
export type SortOrder = 'asc' | 'desc';

// Types pour les formulaires
export type EscompteFormData = Omit<Escompte, 'id' | 'ordreSaisie' | 'dateCreation' | 'dateModification'>;
export type RefinancementFormData = Omit<Refinancement, 'id' | 'ordreSaisie' | 'dateCreation' | 'dateModification'>;
export type ConfigurationFormData = Configuration;

// Types pour les réponses API
export interface EscompteResponse {
  escomptes: Escompte[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RefinancementResponse {
  refinancements: Refinancement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardKPI {
  // KPI historiques (compatibilité ascendante)
  cumulTotal: number; // cumul des escomptes
  encoursRestant: number; // encours basé sur escomptes
  autorisationBancaire: number;
  nombreEscomptes: number;
  pourcentageUtilisation: number; // basé sur escomptes

  // Nouveaux KPI liés aux refinancements et aux totaux combinés
  cumulRefinancements: number; // cumul des refinancements
  nombreRefinancements: number; // nombre de refinancements
  cumulGlobal: number; // escomptes + refinancements
  encoursRestantGlobal: number; // autorisation - cumulGlobal
  pourcentageUtilisationGlobal: number; // basé sur cumulGlobal
}

// Types pour les filtres et tri
export interface EscompteFilters {
  recherche?: string;
  dateDebut?: string | undefined;
  dateFin?: string | undefined;
  montantMin?: number | undefined;
  montantMax?: number | undefined;
  libelle?: string;
}

export interface RefinancementFilters {
  recherche?: string;
  dateDebut?: string | undefined;
  dateFin?: string | undefined;
  montantMin?: number | undefined;
  montantMax?: number | undefined;
  tauxMin?: number | undefined;
  tauxMax?: number | undefined;
  statut?: 'ACTIF' | 'TERMINE' | 'SUSPENDU' | undefined;
  libelle?: string;
}

export interface SortOptions {
  field: 'dateRemise' | 'libelle' | 'montant' | 'ordreSaisie';
  direction: 'asc' | 'desc';
}

export interface RefinancementSortOptions {
  field: 'dateRefinancement' | 'libelle' | 'montantRefinance' | 'tauxInteret' | 'dureeEnMois' | 'ordreSaisie';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

// Types pour les erreurs
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Types pour les états de chargement
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Types pour les modales
export interface ModalState {
  isOpen: boolean;
  type: 'escompte' | 'refinancement' | 'configuration' | 'confirmation' | 'export' | 'refinancements-export' | null;
  mode?: 'create' | 'edit' | 'delete' | undefined;
  data?: any | undefined;
}

// Types pour l'export
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filters?: EscompteFilters;
  dateDebut?: string;
  dateFin?: string;
  includeHeaders?: boolean;
  customDateStart?: string;
  customDateEnd?: string;
  dateRange?: string;
}

// Types pour les notifications
export interface NotificationAction {
  label: string;
  action: () => void;
  closeOnClick?: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  actions?: NotificationAction[];
  autoClose?: boolean;
  duration?: number;
  timestamp: string;
  lu?: boolean;
}

// Constantes
export const ACTIONS_AUDIT = {
  CREATE: 'CREATE' as const,
  UPDATE: 'UPDATE' as const,
  DELETE: 'DELETE' as const,
};

export const ENTITY_TYPES = {
  ESCOMPTE: 'ESCOMPTE' as const,
  CONFIGURATION: 'CONFIGURATION' as const,
};

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  AUTORISATION_DEPASSEE: 'Le montant total des escomptes dépasserait l\'autorisation bancaire',
  MONTANT_INVALIDE: 'Le montant doit être un nombre positif',
  DATE_INVALIDE: 'La date doit être au format valide',
  LIBELLE_REQUIS: 'Le libellé est obligatoire',
  ERREUR_RESEAU: 'Erreur de connexion au serveur',
  ERREUR_INCONNUE: 'Une erreur inattendue s\'est produite',
} as const;