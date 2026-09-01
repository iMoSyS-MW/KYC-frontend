import React from 'react';
import { colors } from '../theme';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Optional "Showing X to Y of Z results" summary shown on the left. */
  rangeStart?: number;
  rangeEnd?: number;
  total?: number;
  unit?: string;
}

/**
 * Circular numbered pagination matching the ui.svg design: a results summary on the
 * left, then prev / numbered page circles (active filled green) / next on the right.
 * Collapses long ranges with an ellipsis.
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  rangeStart,
  rangeEnd,
  total,
  unit = 'results',
}) => {
  if (totalPages <= 1 && total === undefined) return null;

  const pages = getPageList(currentPage, totalPages);
  const showSummary = rangeStart !== undefined && rangeEnd !== undefined && total !== undefined;

  return (
    <div style={{
      display: 'flex',
      justifyContent: showSummary ? 'space-between' : 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '18px'
    }}>
      {showSummary && (
        <div style={{ fontSize: '13px', color: colors.textMuted }}>
          Showing <strong style={{ color: colors.textPrimary }}>{rangeStart}</strong> to{' '}
          <strong style={{ color: colors.textPrimary }}>{rangeEnd}</strong> of{' '}
          <strong style={{ color: colors.textPrimary }}>{total}</strong> {unit}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CircleButton
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          ariaLabel="Previous page"
        >
          ‹
        </CircleButton>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} style={{ color: colors.textMuted, padding: '0 2px' }}>…</span>
          ) : (
            <CircleButton
              key={p}
              active={p === currentPage}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </CircleButton>
          )
        )}

        <CircleButton
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          ariaLabel="Next page"
        >
          ›
        </CircleButton>
      </div>
    </div>
  );
};

interface CircleButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}

const CircleButton: React.FC<CircleButtonProps> = ({ children, onClick, active, disabled, ariaLabel }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    aria-current={active ? 'page' : undefined}
    style={{
      width: '34px',
      height: '34px',
      borderRadius: '50%',
      border: active ? 'none' : `1px solid ${colors.border}`,
      backgroundColor: active ? colors.green : '#ffffff',
      color: active ? '#ffffff' : (disabled ? '#c9c9c9' : colors.textPrimary),
      fontSize: '14px',
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      lineHeight: 1
    }}
  >
    {children}
  </button>
);

/** Returns page numbers with '...' gaps: e.g. [1,2,3,4,5,'...',10]. */
function getPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('...');
  pages.push(total);

  return pages;
}

export default Pagination;
