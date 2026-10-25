export function StatBand({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="stat-band" role="list" aria-label="Lodge facts">
      {stats.map((stat) => (
        <div className="stat-band-item" role="listitem" key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
