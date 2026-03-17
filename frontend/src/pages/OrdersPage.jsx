import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { formatDateTime } from '../utils/format';

const statuses = ['all', 'new', 'processing', 'assigned', 'completed', 'failed'];

const statusLabels = {
  all: 'Todos',
  new: 'Novo',
  processing: 'Em processamento',
  assigned: 'Atribuído',
  completed: 'Concluído',
  failed: 'Falhou'
};

export function OrdersPage({ orders, filter, onFilterChange, onStatusChange }) {
  return (
    <SectionCard
      title="Leads Comerciais"
      subtitle="Solicitações de parceria, patrocínio, colaboração editorial e outras oportunidades comerciais classificadas pelo workflow."
      actions={
        <select value={filter} onChange={(e) => onFilterChange(e.target.value)}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              Status: {statusLabels[status] || status}
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
              <th>Contato</th>
              <th>Produto / Oportunidade</th>
              <th>Organização</th>
              <th>Cidade</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>
                  <div>{order.customer_name || '—'}</div>
                  {order.phone ? <div className="muted">{order.phone}</div> : null}
                </td>
                <td>{order.product || '—'}</td>
                <td>{order.notes ? order.notes.slice(0, 50) : '—'}</td>
                <td>{order.city || '—'}</td>
                <td>{order.assigned_user_name || '—'}</td>
                <td>
                  <div className="row gap-xs wrap align-center">
                    <StatusBadge status={order.status} />
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
                    >
                      {statuses
                        .filter((item) => item !== 'all')
                        .map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status] || status}
                          </option>
                        ))}
                    </select>
                  </div>
                </td>
                <td>{formatDateTime(order.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
