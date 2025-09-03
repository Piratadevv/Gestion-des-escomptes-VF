import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from '../../types';
import { mockApiClient } from './mockClient';

// Configuration de base pour Axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
// Normaliser l'URL de base pour éviter les doublons de préfixe "/api"
// - Supprimer les slashs de fin
// - Si l'URL se termine par "/api", la retirer (les services ajoutent déjà "/api/..." aux chemins)
const NORMALIZED_API_BASE_URL = (() => {
  let url = API_BASE_URL.replace(/\/+$/, '');
  if (url.toLowerCase().endsWith('/api')) {
    url = url.slice(0, -4);
  }
  return url;
})();

class ApiClient {
  private client: AxiosInstance;
  private useMockClient = false;

  constructor() {
    this.client = axios.create({
      baseURL: NORMALIZED_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Intercepteur de requête
    this.client.interceptors.request.use(
      (config) => {
        // Ajouter un token d'authentification si disponible
        const token = localStorage.getItem('authToken');
        if (token) {
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
        
        // Ajouter un timestamp pour éviter le cache
        config.params = {
          ...(config.params || {}),
          _t: Date.now(),
        } as any;
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        const apiError: ApiError = {
          message: 'Une erreur est survenue',
          code: 'UNKNOWN_ERROR',
        };

        if (error.response) {
          // Erreur de réponse du serveur
          apiError.message = error.response.data?.message || `Erreur du serveur (HTTP ${error.response.status})`;
          apiError.code = error.response.data?.code || `HTTP_${error.response.status}`;
          apiError.details = error.response.data?.details;
        } else if (error.request) {
          // Erreur de réseau
          apiError.message = 'Impossible de contacter le serveur. Vérifiez votre connexion ou démarrez le backend.';
          apiError.code = 'NETWORK_ERROR';
        } else {
          // Erreur de configuration
          apiError.message = error.message;
          apiError.code = 'CONFIG_ERROR';
        }

        return Promise.reject(apiError);
      }
    );
  }

  // Méthodes HTTP
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return (response as any).data;
    } catch (err: any) {
      if (err.code === 'NETWORK_ERROR') {
        this.useMockClient = true;
        return mockApiClient.get<T>(url, config);
      }
      throw err;
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return (response as any).data;
    } catch (err: any) {
      if (err.code === 'NETWORK_ERROR') {
        this.useMockClient = true;
        return mockApiClient.post<T>(url, data, config);
      }
      throw err;
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return (response as any).data;
    } catch (err: any) {
      if (err.code === 'NETWORK_ERROR') {
        this.useMockClient = true;
        return mockApiClient.put<T>(url, data, config);
      }
      throw err;
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return (response as any).data;
    } catch (err: any) {
      if (err.code === 'NETWORK_ERROR') {
        this.useMockClient = true;
        return mockApiClient.patch<T>(url, data, config);
      }
      throw err;
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return (response as any).data;
    } catch (err: any) {
      if (err.code === 'NETWORK_ERROR') {
        this.useMockClient = true;
        return mockApiClient.delete<T>(url, config);
      }
      throw err;
    }
  }

  // Méthode pour télécharger des fichiers
  async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await this.client.get(url, {
        responseType: 'blob',
        timeout: 30000,
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      // Only fallback to mock when it's really a network error (no server response)
      const isNetworkError = err?.code === 'NETWORK_ERROR' || err?.message?.includes('Network Error') || (err?.isAxiosError && !err?.response);
      if (isNetworkError) {
        this.useMockClient = true;
        try {
          return await mockApiClient.downloadFile(url, filename);
        } catch (mockErr: any) {
          // If mock client redirects silently, don't show error
          if (mockErr?.code === 'EXPORT_REDIRECT' && mockErr?.silent) {
            // Try the real API directly one more time
            const response = await this.client.get(url, {
              responseType: 'blob',
              timeout: 30000,
            });
            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            return;
          }
          throw mockErr;
        }
      }
      throw err;
    }
  }

  // Méthode pour uploader des fichiers
  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      (config as any).onUploadProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      };
    }

    try {
      const response = await this.client.post<T>(url, formData, config);
      return (response as any).data;
    } catch (err: any) {
      if (err.code === 'NETWORK_ERROR') {
        this.useMockClient = true;
        return mockApiClient.uploadFile<T>(url, file, onProgress);
      }
      throw err;
    }
  }
}

// Instance singleton du client API
export const apiClient = new ApiClient();
export default apiClient;