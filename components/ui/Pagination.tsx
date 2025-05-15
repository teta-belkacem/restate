"use client";

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxPagesToShow = 5
}: PaginationProps) {
  // Calculate range of pages to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    // Always include first page
    pages.push(1);
    
    // Calculate range around current page
    const leftSide = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
    const rightSide = Math.min(totalPages - 1, leftSide + maxPagesToShow - 1);
    
    // Add ellipsis if needed on left side
    if (leftSide > 2) {
      pages.push('...');
    }
    
    // Add pages in range
    for (let i = leftSide; i <= rightSide; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed on right side
    if (rightSide < totalPages - 1) {
      pages.push('...');
    }
    
    // Always include last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="join" dir="ltr">
      {/* Previous button */}
      <button
        className="join-item btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Page numbers */}
      {pageNumbers.map((page, index) => (
        React.createElement(
          page === '...' ? 'span' : 'button',
          {
            key: `${page}-${index}`,
            className: `join-item btn ${page === currentPage ? 'btn-active' : ''}`,
            onClick: page !== '...' ? () => onPageChange(page as number) : undefined,
            disabled: page === '...'
          },
          page
        )
      ))}
      
      {/* Next button */}
      <button
        className="join-item btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
