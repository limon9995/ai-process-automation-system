import { useMemo, useState } from 'react';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { formatDateTime, prettyJson } from '../utils/format';
import { JsonEditorModal } from '../components/JsonEditorModal';

const sourceOptions = ['all', 'manual', 'api', 'gmail'];
const classificationOptions = ['all', 'order', 'support', 'query', 'other'];

export function MessagesPage({
  messages,
  onRetry,
  onRetryReply,
  onManualRerun,
  loadingAction
}) {
  const [editingMessage, setEditingMessage] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const sourceMatch = sourceFilter === 'all' || message.source === sourceFilter;
      const classificationMatch = classificationFilter === 'all' || message.classification === classificationFilter;
      return sourceMatch && classificationMatch;
    });
  }, [messages, sourceFilter, classificationFilter]);

  return (
    <>
      <SectionCard
        title="Mensagens"
        subtitle="Revise entradas manuais, API e Gmail, veja classificação, JSON extraído, status do reply e faça override manual."
        actions={
          <div className="row gap-sm wrap">
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
              {sourceOptions.map((item) => (
                <option key={item} value={item}>
                  Fonte: {item}
                </option>
              ))}
            </select>

            <select value={classificationFilter} onChange={(e) => setClassificationFilter(e.target.value)}>
              {classificationOptions.map((item) => (
                <option key={item} value={item}>
                  Tipo: {item}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fonte</th>
                <th>Mensagem</th>
                <th>Workflow</th>
                <th>Reply</th>
                <th>Responsável</th>
                <th>Último Processamento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => (
                <tr key={message.id}>
                  <td>#{message.id}</td>

                  <td>
                    <StatusBadge status={message.source} />
                    <div className="muted">{message.email_sender || 'manual / dashboard'}</div>
                  </td>

                  <td className="max-text">
                    <strong>{message.email_subject || message.raw_text.slice(0, 80)}</strong>
                    <div className="muted">
                      {message.raw_text.slice(0, 110)}
                      {message.raw_text.length > 110 ? '...' : ''}
                    </div>
                    <div className="muted">Retries workflow: {message.retry_count}</div>
                  </td>

                  <td>
                    <div className="row gap-xs wrap align-center">
                      <StatusBadge status={message.classification} />
                      <StatusBadge status={message.processing_state} />
                    </div>
                  </td>

                  <td>
                    <div className="row gap-xs wrap align-center">
                      <StatusBadge status={message.reply_status} />
                    </div>
                    <div className="muted">{message.reply_error || '—'}</div>
                  </td>

                  <td>{message.assigned_user_name || '—'}</td>

                  <td>{formatDateTime(message.last_processed_at || message.created_at)}</td>

                  <td>
                    <div className="row gap-xs wrap">
                      <button
                        className="button secondary small"
                        onClick={() => setExpandedId(expandedId === message.id ? null : message.id)}
                      >
                        {expandedId === message.id ? 'Ocultar' : 'Ver'}
                      </button>

                      <button
                        className="button warning small"
                        onClick={() => onRetry(message.id)}
                        disabled={loadingAction === `retry-${message.id}`}
                      >
                        {loadingAction === `retry-${message.id}` ? 'Retry...' : 'Retry fluxo'}
                      </button>

                      {message.source === 'gmail' && message.reply_status === 'failed' ? (
                        <button
                          className="button secondary small"
                          onClick={() => onRetryReply(message.id)}
                          disabled={loadingAction === `retry-reply-${message.id}`}
                        >
                          {loadingAction === `retry-reply-${message.id}` ? 'Enviando...' : 'Retry reply'}
                        </button>
                      ) : null}

                      <button
                        className="button primary small"
                        onClick={() => setEditingMessage(message)}
                      >
                        Override
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMessages.map((message) => (
          expandedId === message.id ? (
            <div className="message-detail card nested-card" key={`detail-${message.id}`}>
              <div className="detail-grid">
                <div>
                  <h3>Mensagem Original</h3>
                  <p>{message.raw_text}</p>
                  <p className="muted">Fonte: {message.source}</p>
                  <p className="muted">Sender: {message.email_sender || '—'}</p>
                  <p className="muted">Subject: {message.email_subject || '—'}</p>
                </div>

                <div>
                  <h3>Reply Gerado</h3>
                  <p>{message.generated_reply || '—'}</p>
                  <p className="muted">Reply status: {message.reply_status}</p>
                </div>

                <div>
                  <h3>JSON Extraído</h3>
                  <pre>{prettyJson(message.extractedData)}</pre>
                </div>

                <div>
                  <h3>Logs</h3>
                  <div className="log-list compact">
                    {message.logs.map((log) => (
                      <div key={log.id} className="log-item">
                        <div className="row gap-sm wrap align-center">
                          <StatusBadge status={log.step} />
                          <StatusBadge status={log.status} />
                          <span className="muted">{formatDateTime(log.created_at)}</span>
                        </div>
                        <div>{log.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null
        ))}
      </SectionCard>

      <JsonEditorModal
        open={Boolean(editingMessage)}
        title={editingMessage ? `Override Manual: Mensagem #${editingMessage.id}` : ''}
        initialValue={editingMessage?.extractedData || {}}
        onClose={() => setEditingMessage(null)}
        onSave={async (payload) => {
          await onManualRerun(editingMessage.id, payload);
          setEditingMessage(null);
        }}
      />
    </>
  );
}