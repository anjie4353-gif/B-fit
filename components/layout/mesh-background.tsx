export function MeshBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="mesh-bg relative min-h-dvh overflow-hidden">
      <div className="mesh-orb mesh-orb-accent -right-16 -top-16 h-72 w-72" />
      <div className="mesh-orb mesh-orb-muted -left-20 bottom-32 h-56 w-56" />
      <div className="mesh-orb mesh-orb-soft right-8 top-1/3 h-40 w-40" />
      <div className="mesh-orb mesh-orb-gold left-1/3 -top-8 h-48 w-48" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}