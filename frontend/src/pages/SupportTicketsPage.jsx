import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { formatDateTime } from '../utils/format';

const statuses = ['open', 'in-progress', 'resolved'];

export function SupportTicketsPage({ tickets, onStatusChange }) {
  return (
    <SectionCard
      title="Tickets de Suporte"
      subtitle="Problemas operacionais, acesso, newsletter, links quebrados e outros casos de atendimento."
    >
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Assunto</th>
              <th>Contato</th>
              <th>Prioridade</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>#{ticket.id}</td>
                <td>{ticket.subject}</td>
                <td>{ticket.customer_name || '—'}</td>
                <td><StatusBadge status={ticket.priority} /></td>
                <td>{ticket.assigned_user_name || '—'}</td>
                <td>
                  <div className="row gap-xs wrap align-center">
                    <StatusBadge status={ticket.status} />
                    <select value={ticket.status} onChange={(e) => onStatusChange(ticket.id, e.target.value)}>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td>{formatDateTime(ticket.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}