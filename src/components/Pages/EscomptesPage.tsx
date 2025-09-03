import React from 'react';
import { useAppDispatch } from '../../store';
import { openModal } from '../../store/slices/uiSlice';
import EscomptesDashboard from '../Dashboard/EscomptesDashboard';
import EscomptesTable from '../Escomptes/EscomptesTable';

const EscomptesPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleNewEscompte = () => {
    dispatch(openModal({ isOpen: true, type: 'escompte', mode: 'create' }));
  };

  const handleExport = () => {
    dispatch(openModal({ isOpen: true, type: 'export' }));
  };



  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Escomptes</h1>
            <p className="text-gray-600 mt-1">Gérez vos escomptes commerciaux et suivez votre autorisation bancaire</p>
          </div>
          <div className="flex space-x-3">

            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Exporter
            </button>
            <button
              onClick={handleNewEscompte}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nouvel Escompte
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="mb-6">
        <EscomptesDashboard />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <EscomptesTable />
      </div>
    </div>
  );
};

export default EscomptesPage;