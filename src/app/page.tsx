export default function Home() {
  return (
    <main className="container flex-center" style={{ flexDirection: 'column', textAlign: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', width: '100%' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          Your <span className="gradient-text">Personal IP</span> Knowledge Hub
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
          Publish your expertise and relationships to the semantic web. We format your IP so that it is instantly indexable and highly readable by LLMs and search agents.
        </p>
        <div className="flex-center gap-4">
          <a href="/login" className="btn-primary">Start Publishing</a>
          <a href="/analytics" className="btn-glass">View Agent Analytics</a>
        </div>
      </div>
      
      <div className="flex-center gap-8 animate-fade-in stagger-1" style={{ marginTop: '4rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: '1 1 300px', textAlign: 'left' }}>
          <h3 className="gradient-text" style={{ marginBottom: '1rem' }}>Frictionless Publishing</h3>
          <p>Instantly publish your thoughts, vendor relationships, and IT expertise without the hassle of traditional CMS systems.</p>
        </div>
        <div className="glass-panel" style={{ flex: '1 1 300px', textAlign: 'left' }}>
          <h3 className="gradient-text" style={{ marginBottom: '1rem' }}>Machine Readable</h3>
          <p>Every entity you create is injected with rich JSON-LD schema, guaranteeing perfect ingestion by Claude, ChatGPT, and Google bots.</p>
        </div>
        <div className="glass-panel" style={{ flex: '1 1 300px', textAlign: 'left' }}>
          <h3 className="gradient-text" style={{ marginBottom: '1rem' }}>Proof of Ingestion</h3>
          <p>Our reporting engine tracks every time an AI agent accesses your data. Prove your influence directly on the dashboard.</p>
        </div>
      </div>
    </main>
  );
}
