import { Loader2 } from 'lucide-react'

export default function TableSkeleton({
  type = 'products',
  rows = 6,
  caption = 'Loading data…',
}) {
  const rowArray = Array.from({ length: rows })

  return (
    <div className="table-skeleton-container" aria-busy="true" aria-live="polite">
      <div className="loading-indicator-bar">
        <Loader2 size={15} className="spin" />
        <span>{caption}</span>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            {type === 'products' ? (
              <tr>
                <th>PRODUCT</th>
                <th>VARIANT</th>
                <th>PRICE</th>
                <th>AVAILABLE</th>
                <th style={{ textAlign: 'right', paddingRight: 16 }}>ACTIONS</th>
              </tr>
            ) : (
              <tr>
                <th>BILL NUMBER</th>
                <th>DATE & TIME</th>
                <th>CUSTOMER</th>
                <th>MOBILE</th>
                <th>PAYMENT</th>
                <th>TOTAL</th>
                <th style={{ textAlign: 'right', paddingRight: 16 }}>ACTIONS</th>
              </tr>
            )}
          </thead>
          <tbody>
            {rowArray.map((_, idx) => (
              <tr key={idx}>
                {type === 'products' ? (
                  <>
                    <td>
                      <div className="product-cell">
                        <div className="skeleton skeleton-avatar" />
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <div
                            className="skeleton skeleton-title"
                            style={{ width: `${55 + (idx % 3) * 18}%`, marginBottom: 6 }}
                          />
                          <div
                            className="skeleton skeleton-text"
                            style={{ width: `${35 + (idx % 2) * 20}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <div
                          className="skeleton skeleton-text"
                          style={{ width: 44 }}
                        />
                        <div
                          className="skeleton skeleton-badge"
                          style={{ width: 56, height: 20 }}
                        />
                      </div>
                    </td>
                    <td>
                      <div
                        className="skeleton skeleton-title"
                        style={{ width: 64 }}
                      />
                    </td>
                    <td>
                      <div
                        className="skeleton skeleton-badge"
                        style={{ width: 68, height: 22 }}
                      />
                    </td>
                    <td>
                      <div className="product-actions" style={{ justifyContent: 'flex-end' }}>
                        <div
                          className="skeleton skeleton-btn"
                          style={{ width: 64 }}
                        />
                        <div className="skeleton skeleton-icon-btn" />
                        <div className="skeleton skeleton-icon-btn" />
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <div
                        className="skeleton skeleton-badge"
                        style={{ width: 100, height: 24 }}
                      />
                    </td>
                    <td>
                      <div
                        className="skeleton skeleton-text"
                        style={{ width: 105 }}
                      />
                    </td>
                    <td>
                      <div
                        className="skeleton skeleton-title"
                        style={{ width: `${50 + (idx % 3) * 20}%` }}
                      />
                    </td>
                    <td>
                      <div
                        className="skeleton skeleton-text"
                        style={{ width: 90 }}
                      />
                    </td>
                    <td>
                      <div
                        className="skeleton skeleton-badge"
                        style={{ width: 58, height: 22 }}
                      />
                    </td>
                    <td>
                      <div
                        className="skeleton skeleton-title"
                        style={{ width: 72 }}
                      />
                    </td>
                    <td>
                      <div className="product-actions" style={{ justifyContent: 'flex-end' }}>
                        <div
                          className="skeleton skeleton-btn"
                          style={{ width: 62 }}
                        />
                        <div
                          className="skeleton skeleton-btn"
                          style={{ width: 92 }}
                        />
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
