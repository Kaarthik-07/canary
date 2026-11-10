export function Loading({ label = 'PLEASE WAIT' }: { label?: string }) {
  return <main className="loading-screen"><div className="loading-title">LOADING.....</div><p>{label}</p></main>
}
