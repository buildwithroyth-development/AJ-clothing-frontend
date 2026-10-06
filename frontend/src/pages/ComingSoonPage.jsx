import { Settings } from 'lucide-react'

export default function ComingSoonPage({ title }) {
  return (
    <div className="empty" style={{ paddingTop: 80 }}>
      <i><Settings size={28} strokeWidth={1.6} /></i>
      <strong>{title}</strong>
      This section is coming soon.
    </div>
  )
}
