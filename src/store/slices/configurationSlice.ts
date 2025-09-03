import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Configuration, LoadingState } from '../../types';
import * as configurationApi from '../../services/api/configurationApi';

interface ConfigurationState extends LoadingState {
  configuration: Configuration | null;
}

const initialState: ConfigurationState = {
  configuration: null,
  isLoading: false,
  error: null,
};

// Actions asynchrones
export const fetchConfiguration = createAsyncThunk(
  'configuration/fetchConfiguration',
  async () => {
    const response = await configurationApi.getConfiguration();
    return response;
  }
);

export const updateConfiguration = createAsyncThunk(
  'configuration/updateConfiguration',
  async (configuration: Configuration) => {
    const response = await configurationApi.updateConfiguration(configuration);
    return response;
  }
);

// Validation côté serveur (optionnelle)
export const validateConfiguration = createAsyncThunk(
  'configuration/validateConfiguration',
  async (configuration: Configuration) => {
    // Si le backend expose une route de validation, on l'utiliserait ici.
    // Par défaut, on simule un succès en renvoyant la configuration telle quelle.
    return configuration;
  }
);

const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch configuration
      .addCase(fetchConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConfiguration.fulfilled, (state, action: PayloadAction<Configuration>) => {
        state.isLoading = false;
        state.configuration = action.payload;
      })
      .addCase(fetchConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erreur lors du chargement de la configuration';
      })
      
      // Update configuration
      .addCase(updateConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateConfiguration.fulfilled, (state, action: PayloadAction<Configuration>) => {
        state.isLoading = false;
        state.configuration = action.payload;
      })
      .addCase(updateConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        // Dans notre API client, updateConfiguration retourne quand même une valeur en mode hors-ligne
        // donc ce rejet ne devrait se produire que pour des erreurs inattendues
        state.error = action.error.message || 'Erreur lors de la mise à jour de la configuration';
      })
      // Validate configuration
      .addCase(validateConfiguration.pending, (state) => {
        state.error = null;
      })
      .addCase(validateConfiguration.fulfilled, (state) => {
        // Pas de changement d'état requis
      })
      .addCase(validateConfiguration.rejected, (state, action) => {
        state.error = action.error.message || 'Erreur de validation de la configuration';
      });
  },
});

export const { clearError } = configurationSlice.actions;

export default configurationSlice.reducer;

// Sélecteurs
export const selectConfiguration = (state: { configuration: ConfigurationState }) => state.configuration.configuration;
export const selectConfigurationLoading = (state: { configuration: ConfigurationState }) => state.configuration.isLoading;
export const selectConfigurationError = (state: { configuration: ConfigurationState }) => state.configuration.error;
export const selectAutorisationBancaire = (state: { configuration: ConfigurationState }) => 
  state.configuration.configuration?.autorisationBancaire || 0;