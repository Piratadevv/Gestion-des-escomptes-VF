import React from 'react';
import { useAppDispatch } from '../../store';
import { openModal } from '../../store/slices/uiSlice';
import RefinancementsDashboard from '../Dashboard/RefinancementsDashboard';
import RefinancementsTable from '../Refinancements/RefinancementsTable';

const RefinancementsPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleNewRefinancement = () => {
    dispatch(openModal({ isOpen: true, type: 'refinancement', mode: 'create' }));
  };

  const handleExport = () => {
    dispatch(openModal({ isOpen: true, type: 'refinancements-export' }));
  };

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight">Gestion des Refinancements</h1>
            <p className="text-gray-600 mt-1">Gérez vos refinancements et optimisez votre trésorerie</p>
          </div>
          <div className="flex space-x-3">
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
              onClick={handleNewRefinancement}
              className="touch-target w-full sm:w-auto min-w-[120px] px-6 py-4 text-base font-medium text-white bg-banking-900 border border-transparent rounded-banking hover:bg-banking-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-banking-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Nouveau Refinancement</span>
              <span className="sm:hidden">Nouveau</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="mb-6">
        <RefinancementsDashboard />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <RefinancementsTable />
      </div>
    </div>
  );
};

export default RefinancementsPage;