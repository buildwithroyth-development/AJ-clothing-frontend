export const DEFAULT_SETTINGS = {
  storeName: 'AJ Clothing Store',
  address: 'Commercial Street, Bangalore',
  phone: '+91 98765 43210',
  email: 'contact@ajclothing.com',
  note: 'Thank you for shopping with us.',
}

const STORAGE_KEY = 'aj-pos-settings'

export const getSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS
}

export const saveSettings = (settings) => {
  try {
    const merged = { ...DEFAULT_SETTINGS, ...settings }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    window.dispatchEvent(new CustomEvent('aj_settings_updated', { detail: merged }))
    return merged
  } catch (err) {
    console.error('Failed to save settings:', err)
    return settings
  }
}
