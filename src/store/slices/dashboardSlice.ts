import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardKPI, LoadingState } from '../../types';
import * as dashboardApi from '../../services/api/dashboardApi';

interface DashboardState extends LoadingState {
  kpi: DashboardKPI | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  kpi: null,
  lastUpdated: null,
  isLoading: false,
  error: null,
};

// Actions asynchrones
export const fetchDashboardKPI = createAsyncThunk(
  'dashboard/fetchDashboardKPI',
  async () => {
    const response = await dashboardApi.getDashboardKPI();
    return response;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLastRefresh: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard KPI
      .addCase(fetchDashboardKPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardKPI.fulfilled, (state, action: PayloadAction<DashboardKPI>) => {
        state.isLoading = false;
        state.kpi = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardKPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors du chargement des indicateurs';
      });
  },
});

export const { clearError, updateLastRefresh } = dashboardSlice.actions;

export default dashboardSlice.reducer;

// Sélecteurs
export const selectDashboardKPI = (state: { dashboard: DashboardState }) => state.dashboard.kpi;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) => state.dashboard.isLoading;
export const selectDashboardError = (state: { dashboard: DashboardState }) => state.dashboard.error;
export const selectDashboardLastUpdated = (state: { dashboard: DashboardState }) => state.dashboard.lastUpdated;

// Sélecteurs dérivés pour les KPI individuels
export const selectCumulTotal = (state: { dashboard: DashboardState }) => state.dashboard.kpi?.cumulTotal || 0;
export const selectEncoursRestant = (state: { dashboard: DashboardState }) => state.dashboard.kpi?.encoursRestant || 0;
export const selectAutorisationBancaire = (state: { dashboard: DashboardState }) => state.dashboard.kpi?.autorisationBancaire || 0;
export const selectNombreEscomptes = (state: { dashboard: DashboardState }) => state.dashboard.kpi?.nombreEscomptes || 0;
export const selectPourcentageUtilisation = (state: { dashboard: DashboardState }) => state.dashboard.kpi?.pourcentageUtilisation || 0;
// Nouveaux sélecteurs pour refinancements et global
export const selectCumulRefinancements = (state: { dashboard: DashboardState }) => state.dashboard.kpi?.cumulRefinancements || 0;
export const selectNombreRefinancements = (state: { dashboard: DashboardState }) => state.dashboard.kpi?.nombreRefinancements || 0;
export const selectCumulGlobal = (state: { dashboard: DashboardState }) => state.dashboard.kpi?.cumulGlobal || 0;
export const selectEncoursRestantGlobal = (state: { dashboard: DashboardState }) => state.dashboard.kpi?.encoursRestantGlobal || 0;
export const selectPourcentageUtilisationGlobal = (state: { dashboard: DashboardState }) => state.dashboard.kpi?.pourcentageUtilisationGlobal || 0;