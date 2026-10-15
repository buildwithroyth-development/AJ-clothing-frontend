import { useState } from 'react'
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '../utils/settings'
import { formatINR } from '../utils/format'

export default function SettingsPage() {
  const [form, setForm] = useState(getSettings)
  const [notice, setNotice] = useState('')

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    saveSettings(form)
    setNotice('Store details saved.')
    setTimeout(() => setNotice(''), 3000)
  }

  const handleReset = () => {
    if (window.confirm('Reset store details to default?')) {
      setForm(DEFAULT_SETTINGS)
      saveSettings(DEFAULT_SETTINGS)
      setNotice('Store details reset to default.')
      setTimeout(() => setNotice(''), 3000)
    }
  }

  return (
    <div>
      {/* Title */}
      <div className="head">
        <div>
          <span className="eyebrow">STORE DETAILS</span>
          <h1>Settings.</h1>
          <p>Details used when printing your bill.</p>
        </div>
        <button type="button" className="btn" onClick={handleReset}>
          Reset demo data
        </button>
      </div>

      {notice && <div className="notice">{notice}</div>}

      <div className="columns">
        {/* Form Panel */}
        <form className="panel" onSubmit={handleSave}>
          <span className="eyebrow">BUSINESS INFORMATION</span>
          <h3>Store profile</h3>

          <label>
            Store name
            <input
              required
              name="name"
              value={form.storeName || ''}
              onChange={(e) => handleChange('storeName', e.target.value)}
              placeholder="e.g. AJ Clothing Store"
            />
          </label>

          <label>
            Address
            <textarea
              name="address"
              rows={3}
              value={form.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Store address"
            />
          </label>

          <div className="form-grid">
            <div>
              <label>
                Phone
                <input
                  name="phone"
                  value={form.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Phone number"
                />
              </label>
            </div>
            <div>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Email address"
                />
              </label>
            </div>
          </div>

          <label>
            Bill footer message
            <input
              name="note"
              value={form.note || ''}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="Thank you for shopping with us."
            />
          </label>

          <button type="submit" className="btn primary" style={{ marginTop: 18 }}>
            Save settings
          </button>
        </form>

        {/* Bill Preview Panel */}
        <section className="panel">
          <span className="eyebrow">BILL PREVIEW</span>
          <div
            className="receipt"
            style={{
              background: 'var(--bg)',
              border: '1px dashed var(--line)',
              marginTop: 16,
            }}
          >
            <h2>{form.storeName || 'AJ Clothing Store'}</h2>
            <p>{form.address || 'Your store address'}</p>
            <p>
              {[form.phone, form.email].filter(Boolean).join(' ')}
            </p>

            <hr />

            <div style={{ textAlign: 'center' }}>
              <small className="bill-num-text" style={{ letterSpacing: '0.06em', fontWeight: 600 }}>
                SAMPLE BILL · AJ-000001
              </small>
            </div>

            <hr />

            <table style={{ width: '100%', minWidth: 0, borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ border: 0, padding: '4px 0' }}>Everyday Tee · M</td>
                  <td style={{ textAlign: 'right', border: 0, padding: '4px 0' }} className="bill-num-text">
                    {formatINR(799)}
                  </td>
                </tr>
              </tbody>
            </table>

            <hr />

            <div className="sum">
              Total <span className="bill-num-text">{formatINR(799)}</span>
            </div>

            <p style={{ marginTop: 12 }}>{form.note || 'Thank you for shopping with us.'}</p>
          </div>

          <p className="muted" style={{ fontSize: 11, marginTop: 14 }}>
            Preview uses a sample item. Saved bills use their actual products and amounts.
          </p>
        </section>
      </div>
    </div>
  )
}
