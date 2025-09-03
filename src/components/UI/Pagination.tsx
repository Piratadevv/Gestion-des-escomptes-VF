import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
}

/**
 * Composant Pagination - Navigation entre les pages
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
      {/* Informations */}
      {showInfo && (
        <div className="text-sm text-gray-700">
          Affichage de <span className="font-medium">{startItem}</span> à{' '}
          <span className="font-medium">{endItem}</span> sur{' '}
          <span className="font-medium">{totalItems}</span> résultat{totalItems > 1 ? 's' : ''}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex items-center space-x-1" aria-label="Pagination">
        {/* Bouton Précédent */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
            transition-colors duration-200
            ${
              currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
            }
          `}
          aria-label="Page précédente"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="ml-1 hidden sm:inline">Précédent</span>
        </button>

        {/* Numéros de page */}
        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isCurrentPage = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`
                  relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                  transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                  ${
                    isCurrentPage
                      ? 'bg-primary-600 text-white border border-primary-600'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-300'
                  }
                `}
                aria-label={`Page ${pageNumber}`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
            transition-colors duration-200
            ${
              currentPage === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
            }
          `}
          aria-label="Page suivante"
        >
          <span className="mr-1 hidden sm:inline">Suivant</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
};

export default Pagination;