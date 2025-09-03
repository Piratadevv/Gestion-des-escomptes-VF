import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Escompte, EscompteResponse, EscompteFilters, SortOptions, PaginationOptions, LoadingState } from '../../types';
import * as escomptesApi from '../../services/api/escomptesApi';
import { addNotification } from './uiSlice';

interface EscomptesState extends LoadingState {
  escomptes: Escompte[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: EscompteFilters;
  sort: SortOptions;
  selectedEscompte: Escompte | null;
}

const initialState: EscomptesState = {
  escomptes: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  filters: {},
  sort: { field: 'dateRemise', direction: 'desc' },
  selectedEscompte: null,
  isLoading: false,
  error: null,
};

// Actions asynchrones
export const fetchEscomptes = createAsyncThunk(
  'escomptes/fetchEscomptes',
  async (params: { pagination: PaginationOptions; filters?: EscompteFilters; sort?: SortOptions }, { dispatch }) => {
    try {
      const response = await escomptesApi.getEscomptes(params.pagination, params.filters, params.sort);
      return response;
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de chargement',
        message: error.message || 'Impossible de charger les escomptes',
        autoClose: true,
        duration: 8000
      }));
      throw error;
    }
  }
);

export const createEscompte = createAsyncThunk(
  'escomptes/createEscompte',
  async (escompte: Omit<Escompte, 'id' | 'ordreSaisie' | 'dateCreation' | 'dateModification'>, { dispatch }) => {
    try {
      const response = await escomptesApi.createEscompte(escompte);
      dispatch(addNotification({
        type: 'success',
        title: 'Escompte créé',
        message: `L'escompte "${response.libelle}" a été créé avec succès`,
        autoClose: true,
        duration: 5000
      }));
      return response;
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de création',
        message: error.message || 'Impossible de créer l\'escompte',
        autoClose: true,
        duration: 8000
      }));
      throw error;
    }
  }
);

export const updateEscompte = createAsyncThunk(
  'escomptes/updateEscompte',
  async ({ id, escompte }: { id: string; escompte: Partial<Escompte> }, { dispatch }) => {
    try {
      const response = await escomptesApi.updateEscompte(id, escompte);
      dispatch(addNotification({
        type: 'success',
        title: 'Escompte modifié',
        message: `L'escompte "${response.libelle}" a été modifié avec succès`,
        autoClose: true,
        duration: 5000
      }));
      return response;
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de modification',
        message: error.message || 'Impossible de modifier l\'escompte',
        autoClose: true,
        duration: 8000
      }));
      throw error;
    }
  }
);

export const deleteEscompte = createAsyncThunk(
  'escomptes/deleteEscompte',
  async (id: string, { dispatch }) => {
    try {
      await escomptesApi.deleteEscompte(id);
      dispatch(addNotification({
        type: 'success',
        title: 'Escompte supprimé',
        message: 'L\'escompte a été supprimé avec succès',
        autoClose: true,
        duration: 5000
      }));
      return id;
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de suppression',
        message: error.message || 'Impossible de supprimer l\'escompte',
        autoClose: true,
        duration: 8000
      }));
      throw error;
    }
  }
);

export const exportEscomptes = createAsyncThunk(
  'escomptes/exportEscomptes',
  async (options: { format: 'csv' | 'excel' | 'pdf'; filters?: EscompteFilters }, { dispatch }) => {
    try {
      // Pour l'instant, on ne supporte que csv et excel
      if (options.format === 'pdf') {
        throw new Error('L\'export PDF n\'est pas encore supporté');
      }
      
      await escomptesApi.exportEscomptes(options.format, options.filters);
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
        message: error.message || 'Impossible d\'exporter les escomptes',
        autoClose: true,
        duration: 8000
      }));
      throw error;
    }
  }
);



const escomptesSlice = createSlice({
  name: 'escomptes',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<EscompteFilters>) => {
      state.filters = action.payload;
      state.page = 1; // Reset à la première page lors du filtrage
    },
    setSort: (state, action: PayloadAction<SortOptions>) => {
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
    setSelectedEscompte: (state, action: PayloadAction<Escompte | null>) => {
      state.selectedEscompte = action.payload;
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
      // Fetch escomptes
      .addCase(fetchEscomptes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEscomptes.fulfilled, (state, action: PayloadAction<EscompteResponse>) => {
        state.isLoading = false;
        // Créer un nouveau tableau pour éviter l'erreur "object is not extensible"
        state.escomptes = [...action.payload.escomptes];
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchEscomptes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors du chargement des escomptes';
      })
      
      // Create escompte
      .addCase(createEscompte.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEscompte.fulfilled, (state, action: PayloadAction<Escompte>) => {
        state.isLoading = false;
        // Créer un nouveau tableau pour éviter l'erreur "object is not extensible"
        state.escomptes = [action.payload, ...state.escomptes];
        state.total += 1;
      })
      .addCase(createEscompte.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors de la création de l\'escompte';
      })
      
      // Update escompte
      .addCase(updateEscompte.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEscompte.fulfilled, (state, action: PayloadAction<Escompte>) => {
        state.isLoading = false;
        // Remplacer via une nouvelle instance de tableau pour éviter les mutations directes
        state.escomptes = state.escomptes.map(e => e.id === action.payload.id ? action.payload : e);
        if (state.selectedEscompte?.id === action.payload.id) {
          state.selectedEscompte = action.payload;
        }
      })
      .addCase(updateEscompte.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors de la modification de l\'escompte';
      })
      
      // Delete escompte
      .addCase(deleteEscompte.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEscompte.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.escomptes = state.escomptes.filter(e => e.id !== action.payload);
        state.total -= 1;
        if (state.selectedEscompte?.id === action.payload) {
          state.selectedEscompte = null;
        }
      })
      .addCase(deleteEscompte.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors de la suppression de l\'escompte';
      })
      
      // Export escomptes
      .addCase(exportEscomptes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportEscomptes.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(exportEscomptes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors de l\'export des escomptes';
      })

  },
});

export const {
  setFilters,
  setSort,
  setPage,
  setLimit,
  setSelectedEscompte,
  clearError,
  resetFilters,
} = escomptesSlice.actions;

export default escomptesSlice.reducer;

// Sélecteurs
export const selectEscomptes = (state: { escomptes: EscomptesState }) => state.escomptes.escomptes;
export const selectEscomptesLoading = (state: { escomptes: EscomptesState }) => state.escomptes.isLoading;
export const selectEscomptesError = (state: { escomptes: EscomptesState }) => state.escomptes.error;
export const selectEscomptesPagination = (state: { escomptes: EscomptesState }) => ({
  page: state.escomptes.page,
  limit: state.escomptes.limit,
  total: state.escomptes.total,
  totalPages: state.escomptes.totalPages,
});
export const selectEscomptesFilters = (state: { escomptes: EscomptesState }) => state.escomptes.filters;
export const selectEscomptesSort = (state: { escomptes: EscomptesState }) => state.escomptes.sort;
export const selectSelectedEscompte = (state: { escomptes: EscomptesState }) => state.escomptes.selectedEscompte;