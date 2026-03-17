import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { formatDateTime } from '../utils/format';

const statuses = ['all', 'new', 'reviewing', 'closed'];

export function QueryCasesPage({ items, filter, onFilterChange, onStatusChange }) {
  return (
    <SectionCard
      title="Consultas / Casos"
      subtitle="Solicitações informativas, convites, dúvidas sobre eventos, podcast, comunidade e mídia."
      actions={
        <select value={filter} onChange={(e) => onFilterChange(e.target.value)}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      }
    >
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Assunto</th>
              <th>Contato</th>
              <th>Organização</th>
              <th>Cidade</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>#{item.id}</td>
                <td>{item.subject || '—'}</td>
                <td>{item.requester_name || item.email || item.phone || '—'}</td>
                <td>{item.organization || '—'}</td>
                <td>{item.city || '—'}</td>
                <td>{item.assigned_user_name || '—'}</td>
                <td>
                  <div className="row gap-xs wrap align-center">
                    <StatusBadge status={item.status} />
                    <select value={item.status} onChange={(e) => onStatusChange(item.id, e.target.value)}>
                      {statuses.filter((status) => status !== 'all').map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td>{formatDateTime(item.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}