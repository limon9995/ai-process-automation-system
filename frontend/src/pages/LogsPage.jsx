import { useMemo, useState } from 'react';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { formatDateTime } from '../utils/format';

const stepOptions = ['all', 'received', 'classified', 'extracted', 'validated', 'assigned', 'replied', 'retried', 'error'];

export function LogsPage({ logs }) {
  const [stepFilter, setStepFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => stepFilter === 'all' || log.step === stepFilter);
  }, [logs, stepFilter]);

  return (
    <SectionCard
      title="Automation Logs"
      subtitle="Histórico detalhado para troubleshooting, suporte operacional e auditoria do workflow."
      actions={
        <select value={stepFilter} onChange={(e) => setStepFilter(e.target.value)}>
          {stepOptions.map((item) => (
            <option key={item} value={item}>
              Step: {item}
            </option>
          ))}
        </select>
      }
    >
      <div className="log-list">
        {filteredLogs.map((log) => (
          <div key={log.id} className="log-item card nested-card">
            <div className="row gap-sm wrap align-center">
              <strong>Message #{log.message_id ?? 'N/A'}</strong>
              <StatusBadge status={log.step} />
              <StatusBadge status={log.status} />
              <span className="muted">{formatDateTime(log.created_at)}</span>
            </div>
            <p>{log.detail}</p>
            {log.metadata ? <pre>{log.metadata}</pre> : null}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}