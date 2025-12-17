// Pagination.tsx
import React from "react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
}

const MAX_PAGE_BUTTONS = 5; // Hoeveel paginanummers er maximaal direct getoond mogen worden

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
}) => {
  // 1. Array van alle mogelijke paginanummers
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // 2. Logica om een beperkt aantal pagina's te tonen (bijv. 5) rondom de huidige pagina
  const getVisiblePageNumbers = () => {
    if (totalPages <= MAX_PAGE_BUTTONS) {
      return pageNumbers;
    }

    let start = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
    let end = Math.min(totalPages, start + MAX_PAGE_BUTTONS - 1);

    if (end === totalPages) {
      start = Math.max(1, totalPages - MAX_PAGE_BUTTONS + 1);
    }

    // Zorgt ervoor dat we alleen de nummers van 'start' tot 'end' nemen
    return pageNumbers.slice(start - 1, end);
  };

  const visiblePages = getVisiblePageNumbers();

  // De handler voor de knoppen
  const handlePageClick = (pageNumber: number) => {
    // Alleen wijzigen als het een geldig nummer is en niet de huidige pagina
    if (pageNumber > 0 && pageNumber <= totalPages && pageNumber !== currentPage) {
      onPageChange(pageNumber);
    }
  };

  return (
    <nav className="pagination-nav flex justify-center items-center mt-6">
      <ul className="flex list-none p-0 m-0">
        {/* Vorige knop */}
        <li>
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
            aria-label="Vorige pagina"
          >
            &laquo;
          </button>
        </li>

        {/* Eerste pagina en ellips (indien nodig) */}
        {visiblePages[0] > 1 && (
            <>
                <li>
                    <button 
                        onClick={() => handlePageClick(1)}
                        className="pagination-button"
                    >1</button>
                </li>
                {visiblePages[0] > 2 && <li className="px-2">...</li>}
            </>
        )}


        {/* Zichtbare Paginanummers */}
        {visiblePages.map((number) => (
          <li key={number}>
            <button
              onClick={() => handlePageClick(number)}
              className={`pagination-button ${number === currentPage ? 'active' : ''}`}
              aria-current={number === currentPage ? 'page' : undefined}
            >
              {number}
            </button>
          </li>
        ))}

        {/* Ellips en laatste pagina (indien nodig) */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
                {visiblePages[visiblePages.length - 1] < totalPages - 1 && <li className="px-2">...</li>}
                <li>
                    <button 
                        onClick={() => handlePageClick(totalPages)}
                        className="pagination-button"
                    >{totalPages}</button>
                </li>
            </>
        )}

        {/* Volgende knop */}
        <li>
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
            aria-label="Volgende pagina"
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;