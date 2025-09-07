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
    <div className="w-full min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-start lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight">
              Gestion des Escomptes
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg max-w-2xl">
              Gérez vos escomptes commerciaux et suivez votre autorisation bancaire
            </p>
          </div>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 lg:flex-shrink-0">
            <button
              onClick={handleExport}
              className="touch-target w-full sm:w-auto min-w-[120px] px-6 py-4 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-banking hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="hidden sm:inline">Exporter les données</span>
              <span className="sm:hidden">Exporter</span>
            </button>
            <button
              onClick={handleNewEscompte}
              className="touch-target w-full sm:w-auto min-w-[120px] px-6 py-4 text-base font-medium text-white bg-banking-900 border border-transparent rounded-banking hover:bg-banking-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-banking-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Nouvel Escompte</span>
              <span className="sm:hidden">Nouveau</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <EscomptesDashboard />
      </div>

      {/* Table */}
      <div className="bg-white rounded-banking shadow-banking overflow-hidden">
        <div className="overflow-x-auto">
          <EscomptesTable />
        </div>
      </div>
    </div>
  );
};

export default EscomptesPage;