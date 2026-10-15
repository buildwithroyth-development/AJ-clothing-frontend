import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemLabel = 'items',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  if (totalItems === 0) return null

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems)
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <nav className="pagination-wrap" aria-label="Pagination Navigation">
      <div className="pagination-info">
        <span>
          Showing <strong>{startItem}–{endItem}</strong> of <strong>{totalItems}</strong> {itemLabel}
        </span>
        {onPageSizeChange && (
          <div className="pagination-size-select">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value))
                onPageChange(1)
              }}
              aria-label={`Rows per page for ${itemLabel}`}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First page"
          aria-label="First page"
        >
          <ChevronsLeft size={15} />
        </button>

        <button
          type="button"
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {getPageNumbers().map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="pagination-ellipsis" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>

        <button
          type="button"
          className="pagination-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Last page"
          aria-label="Last page"
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </nav>
  )
}
