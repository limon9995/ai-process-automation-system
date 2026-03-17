export function StatusBadge({ status }) {
  const normalized = String(status || 'unknown').toLowerCase();
  return <span className={`badge badge-${normalized.replace(/[^a-z-]/g, '')}`}>{status || 'unknown'}</span>;
}
