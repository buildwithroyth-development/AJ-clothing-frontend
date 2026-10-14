import logoImg from '../../assets/AJ_logo.png'

// Shared card layout for the sign-in, verify-email and waiting-for-approval screens.
export default function AuthShell({ title, subtitle, children, onSubmit }) {
  const Wrapper = onSubmit ? 'form' : 'div'
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        background: 'var(--bg)',
      }}
    >
      <Wrapper
        onSubmit={onSubmit}
        noValidate={Boolean(onSubmit)}
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#fff',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <img src={logoImg} alt="AJ Clothing" style={{ height: 36 }} />
          <span className="eyebrow">AJ CLOTHING</span>
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: 22 }}>{title}</h1>
        {subtitle && (
          <p style={{ margin: '0 0 18px', color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
        {children}
      </Wrapper>
    </div>
  )
}
