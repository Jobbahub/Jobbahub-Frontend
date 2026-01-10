// Pagination.tsx
import React from "react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
}) => {
  const handlePageClick = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages && pageNumber !== currentPage) {
      onPageChange(pageNumber);
    }
  };

  // Generate the page numbers to display with priority classes
  const getPageNumbers = (): { value: number | "ellipsis"; priority: string }[] => {
    const pages: { value: number | "ellipsis"; priority: string }[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        const priority = i === 1 ? "first" : i === totalPages ? "last" : "middle";
        pages.push({ value: i, priority });
      }
      return pages;
    }

    // Always include page 1 (highest priority)
    pages.push({ value: 1, priority: "first" });

    // Calculate window around current page
    const windowStart = Math.max(2, currentPage - 1);
    const windowEnd = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis after 1 if needed
    if (windowStart > 2) {
      pages.push({ value: "ellipsis", priority: "ellipsis-start" });
    }

    // Add pages in the window with appropriate priorities
    for (let i = windowStart; i <= windowEnd; i++) {
      if (i !== 1 && i !== totalPages) {
        let priority = "neighbor"; // Adjacent pages
        if (i === currentPage) {
          priority = "current"; // Current page - medium priority
        }
        pages.push({ value: i, priority });
      }
    }

    // Add ellipsis before last if needed
    if (windowEnd < totalPages - 1) {
      pages.push({ value: "ellipsis", priority: "ellipsis-end" });
    }

    // Always include last page (highest priority)
    if (totalPages > 1) {
      pages.push({ value: totalPages, priority: "last" });
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="pagination-nav" aria-label="Paginering">
      <ul className="pagination-list">
        {/* Previous button */}
        <li className="pagination-item pagination-item-arrow">
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className={`pagination-btn pagination-arrow ${currentPage === 1 ? "disabled" : ""}`}
            aria-label="Vorige pagina"
          >
            ‹
          </button>
        </li>

        {/* Page numbers */}
        {pageNumbers.map((item, index) => (
          <li 
            key={`${item.value}-${index}`} 
            className={`pagination-item pagination-item-${item.priority}`}
          >
            {item.value === "ellipsis" ? (
              <span className={`pagination-ellipsis pagination-ellipsis-${item.priority}`}>…</span>
            ) : (
              <button
                onClick={() => handlePageClick(item.value as number)}
                className={`pagination-btn pagination-btn-${item.priority} ${item.value === currentPage ? "active" : ""}`}
                aria-current={item.value === currentPage ? "page" : undefined}
              >
                {item.value}
              </button>
            )}
          </li>
        ))}

        {/* Next button */}
        <li className="pagination-item pagination-item-arrow">
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`pagination-btn pagination-arrow ${currentPage === totalPages ? "disabled" : ""}`}
            aria-label="Volgende pagina"
          >
            ›
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;