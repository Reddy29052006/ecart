import React from 'react';
import { Button } from './button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        width: '100%',
      }}
    >
      {/* Item info */}
      <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
        {totalItems && pageSize ? (
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
          </span>
        ) : (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>

        {visiblePages.map((page, index) => {
          const isCurrent = page === currentPage;
          const showEllipsisBefore = index > 0 && page - visiblePages[index - 1] > 1;

          return (
            <React.Fragment key={page}>
              {showEllipsisBefore && (
                <span style={{ color: 'var(--color-text-muted)', padding: '0 4px' }}>...</span>
              )}
              <Button
                variant={isCurrent ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(page)}
                style={{
                  minWidth: '36px',
                  padding: '0 8px',
                }}
              >
                {page}
              </Button>
            </React.Fragment>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
