export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: 'white',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
      <h1 style={{ 
        fontSize: '3rem', 
        fontWeight: 700, 
        margin: 0,
        background: 'linear-gradient(90deg, #e94560, #ff6b6b)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        ClawCart
      </h1>
      <p style={{ 
        fontSize: '1.5rem', 
        opacity: 0.9,
        marginTop: '0.5rem',
        textAlign: 'center',
      }}>
        Voice-first multi-retailer cart building & sharing
      </p>
      
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem 2rem',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '1rem',
        backdropFilter: 'blur(10px)',
        maxWidth: '500px',
        textAlign: 'center',
      }}>
        <p style={{ fontStyle: 'italic', fontSize: '1.2rem', margin: 0 }}>
          "Build my kid's 3rd grade supply list under $50"
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginTop: '3rem',
        maxWidth: '800px',
        width: '100%',
      }}>
        {[
          { icon: '🎤', title: 'Voice/Chat-First', desc: 'Describe what you need' },
          { icon: '🏪', title: '200+ Retailers', desc: 'Amazon, Walmart, Target & more' },
          { icon: '💰', title: 'Price Optimization', desc: 'Best prices across stores' },
          { icon: '🔗', title: 'Cart Sharing', desc: 'Share & approve with team' },
        ].map((f, i) => (
          <div key={i} style={{
            padding: '1.5rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '0.75rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem' }}>{f.icon}</div>
            <h3 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.1rem' }}>{f.title}</h3>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '4rem',
        padding: '1rem 2rem',
        background: 'linear-gradient(90deg, #e94560, #ff6b6b)',
        borderRadius: '2rem',
        fontWeight: 600,
        fontSize: '1.1rem',
        cursor: 'pointer',
      }}>
        Coming Soon
      </div>

      <footer style={{
        marginTop: '4rem',
        opacity: 0.5,
        fontSize: '0.875rem',
      }}>
        Powered by OpenClaw
      </footer>
    </main>
  )
}
