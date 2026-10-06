import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function DeleteConfirmModal({ product, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleConfirm = async () => {
    setDeleting(true)
    try {
      await onConfirm(product)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 440 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="delete-dialog-title"
      >
        <div className="modal-head" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: 'var(--pill-low-bg)',
                color: 'var(--pill-low-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={18} strokeWidth={2.2} />
            </div>
            <div>
              <span className="eyebrow" style={{ color: 'var(--pill-low-text)' }}>
                CONFIRM DELETION
              </span>
              <h3 id="delete-dialog-title" style={{ margin: '2px 0 0', font: '600 20px var(--font-serif)' }}>
                Delete product?
              </h3>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)', margin: '0 0 16px' }}>
          Are you sure you want to delete <strong>{product.name}</strong>
          {product.colour || product.size
            ? ` (${[product.colour, product.size && `Size ${product.size}`].filter(Boolean).join(' · ')})`
            : ''}{' '}
          from the catalogue?
        </p>

        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 12,
            color: 'var(--muted)',
            marginBottom: 20,
            lineHeight: 1.4,
          }}
        >
          Saved bills and past sales records associated with this product will remain preserved.
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleConfirm}
            disabled={deleting}
            style={{
              background: '#b43f30',
              borderColor: '#b43f30',
              color: '#ffffff',
              fontWeight: 600,
            }}
          >
            {deleting ? 'Deleting…' : 'Delete product'}
          </button>
        </div>
      </div>
    </div>
  )
}
