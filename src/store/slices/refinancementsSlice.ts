import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Refinancement, RefinancementResponse, RefinancementFilters, RefinancementSortOptions, PaginationOptions, LoadingState } from '../../types';
import * as refinancementsApi from '../../services/api/refinancementsApi';
import { addNotification } from './uiSlice';

interface RefinancementsState extends LoadingState {
  refinancements: Refinancement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: RefinancementFilters;
  sort: RefinancementSortOptions;
  selectedRefinancement: Refinancement | null;
}

const initialState: RefinancementsState = {
  refinancements: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  filters: {},
  sort: { field: 'dateRefinancement', direction: 'desc' },
  selectedRefinancement: null,
  isLoading: false,
  error: null,
};

// Actions asynchrones
export const fetchRefinancements = createAsyncThunk(
  'refinancements/fetchRefinancements',
  async (params: { pagination: PaginationOptions; filters?: RefinancementFilters; sort?: RefinancementSortOptions }, { dispatch }) => {
    try {
      const response = await refinancementsApi.getRefinancements(params.pagination, params.filters, params.sort);
      return response;
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de chargement',
        message: error.message || 'Impossible de charger les refinancements',
        autoClose: true,
        duration: 8000
      }));
      throw error;
    }
  }
);

export const createRefinancement = createAsyncThunk(
  'refinancements/createRefinancement',
  async (refinancement: Omit<Refinancement, 'id' | 'ordreSaisie' | 'dateCreation' | 'dateModification'>, { dispatch }) => {
    try {
      const response = await refinancementsApi.createRefinancement(refinancement);
      dispatch(addNotification({
        type: 'success',
        title: 'Refinancement créé',
        message: `Le refinancement "${response.libelle}" a été créé avec succès`,
        autoClose: true,
        duration: 5000
      }));
      return response;
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de création',
        message: error.message || 'Impossible de créer le refinancement',
        autoClose: true,
        duration: 8000
      }));
      throw error;
    }
  }
);

export const updateRefinancement = createAsyncThunk(
  'refinancements/updateRefinancement',
  async ({ id, refinancement }: { id: string; refinancement: Partial<Refinancement> }, { dispatch }) => {
    try {
      const response = await refinancementsApi.updateRefinancement(id, refinancement);
      dispatch(addNotification({
        type: 'success',
        title: 'Refinancement modifié',
        message: `Le refinancement "${response.libelle}" a été modifié avec succès`,
        autoClose: true,
        duration: 5000
      }));
      return response;
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de modification',
        message: error.message || 'Impossible de modifier le refinancement',
        autoClose: true,
        duration: 8000
      }));
      throw error;
    }
  }
);

export const deleteRefinancement = createAsyncThunk(
  'refinancements/deleteRefinancement',
  async (id: string, { dispatch }) => {
    try {
      await refinancementsApi.deleteRefinancement(id);
      dispatch(addNotification({
        type: 'success',
        title: 'Refinancement supprimé',
        message: 'Le refinancement a été supprimé avec succès',
        autoClose: true,
        duration: 5000
      }));
      return id;
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de suppression',
        message: error.message || 'Impossible de supprimer le refinancement',
        autoClose: true,
        duration: 8000
      }));
      throw error;
    }
  }
);

export const exportRefinancements = createAsyncThunk(
  'refinancements/exportRefinancements',
  async (options: { format: 'csv' | 'excel' | 'pdf'; filters?: RefinancementFilters }, { dispatch }) => {
    try {
      // Pour l'instant, on ne supporte que csv et excel
      if (options.format === 'pdf') {
        throw new Error('L\'export PDF n\'est pas encore supporté');
      }
      
      await refinancementsApi.exportRefinancements(options.format, options.filters);
      dispatch(addNotification({
        type: 'success',
        title: 'Export réussi',
        message: `Le fichier ${options.format.toUpperCase()} a été téléchargé avec succès`,
        autoClose: true,
        duration: 5000
      }));
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur d\'export',
        message: error.message || 'Impossible d\'exporter les refinancements',
        autoClose: true,
        duration: 8000
      }));
      throw error;
    }
  }
);



const refinancementsSlice = createSlice({
  name: 'refinancements',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<RefinancementFilters>) => {
      state.filters = action.payload;
      state.page = 1; // Reset à la première page lors du filtrage
    },
    setSort: (state, action: PayloadAction<RefinancementSortOptions>) => {
      state.sort = action.payload;
      state.page = 1; // Reset à la première page lors du tri
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1; // Reset à la première page lors du changement de limite
    },
    setSelectedRefinancement: (state, action: PayloadAction<Refinancement | null>) => {
      state.selectedRefinancement = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.filters = {};
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch refinancements
      .addCase(fetchRefinancements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRefinancements.fulfilled, (state, action: PayloadAction<RefinancementResponse>) => {
        state.isLoading = false;
        // Créer un nouveau tableau pour éviter l'erreur "object is not extensible"
        state.refinancements = [...action.payload.refinancements];
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchRefinancements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors du chargement des refinancements';
      })
      
      // Create refinancement
      .addCase(createRefinancement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRefinancement.fulfilled, (state, action: PayloadAction<Refinancement>) => {
        state.isLoading = false;
        // Ajouter le nouveau refinancement au début du tableau
        state.refinancements.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createRefinancement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors de la création du refinancement';
      })
      
      // Update refinancement
      .addCase(updateRefinancement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRefinancement.fulfilled, (state, action: PayloadAction<Refinancement>) => {
        state.isLoading = false;
        const index = state.refinancements.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.refinancements[index] = action.payload;
        }
      })
      .addCase(updateRefinancement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors de la modification du refinancement';
      })
      
      // Delete refinancement
      .addCase(deleteRefinancement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRefinancement.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.refinancements = state.refinancements.filter(r => r.id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteRefinancement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors de la suppression du refinancement';
      })
      
      // Export refinancements
      .addCase(exportRefinancements.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(exportRefinancements.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(exportRefinancements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors de l\'export des refinancements';
      })

  },
});

export const {
  setFilters,
  setSort,
  setPage,
  setLimit,
  setSelectedRefinancement,
  clearError,
  resetFilters,
} = refinancementsSlice.actions;

export default refinancementsSlice.reducer;

// Sélecteurs
export const selectRefinancements = (state: { refinancements: RefinancementsState }) => state.refinancements.refinancements;
export const selectRefinancementsLoading = (state: { refinancements: RefinancementsState }) => state.refinancements.isLoading;
export const selectRefinancementsError = (state: { refinancements: RefinancementsState }) => state.refinancements.error;
export const selectRefinancementsTotal = (state: { refinancements: RefinancementsState }) => state.refinancements.total;
export const selectRefinancementsPagination = (state: { refinancements: RefinancementsState }) => ({
  page: state.refinancements.page,
  limit: state.refinancements.limit,
  total: state.refinancements.total,
  totalPages: state.refinancements.totalPages,
});
export const selectRefinancementsFilters = (state: { refinancements: RefinancementsState }) => state.refinancements.filters;
export const selectRefinancementsSort = (state: { refinancements: RefinancementsState }) => state.refinancements.sort;
export const selectSelectedRefinancement = (state: { refinancements: RefinancementsState }) => state.refinancements.selectedRefinancement;

// Sélecteurs dérivés
export const selectActiveRefinancements = (state: { refinancements: RefinancementsState }) =>
  state.refinancements.refinancements.filter(r => r.statut === 'ACTIF');

export const selectFinishedRefinancements = (state: { refinancements: RefinancementsState }) =>
  state.refinancements.refinancements.filter(r => r.statut === 'TERMINE');

export const selectSuspendedRefinancements = (state: { refinancements: RefinancementsState }) =>
  state.refinancements.refinancements.filter(r => r.statut === 'SUSPENDU');