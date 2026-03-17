import { useEffect, useMemo, useState } from 'react';
import { api } from './services/api';
import { SubmitMessagePage } from './pages/SubmitMessagePage';
import { MessagesPage } from './pages/MessagesPage';
import { OrdersPage } from './pages/OrdersPage';
import { SupportTicketsPage } from './pages/SupportTicketsPage';
import { QueryCasesPage } from './pages/QueryCasesPage';
import { LogsPage } from './pages/LogsPage';
import { StatCard } from './components/StatCard';

const navItems = [
  { id: 'submit', label: 'Enviar Mensagem' },
  { id: 'messages', label: 'Mensagens' },
  { id: 'orders', label: 'Leads Comerciais' },
  { id: 'support', label: 'Suporte' },
  { id: 'queries', label: 'Consultas / Casos' },
  { id: 'logs', label: 'Logs' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('submit');
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalOrders: 0,
    totalTickets: 0,
    totalQueryCases: 0,
    failedWorkflows: 0,
    openOrders: 0,
    openSupport: 0,
    openQueryCases: 0,
    gmailMessages: 0,
    failedReplies: 0,
    processedToday: 0
  });

  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [queryCases, setQueryCases] = useState([]);
  const [logs, setLogs] = useState([]);
  const [gmailStatus, setGmailStatus] = useState({ enabled: false, intervalMs: 60000, configured: false });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [queryFilter, setQueryFilter] = useState('all');
  const [error, setError] = useState('');

  const refresh = async (selectedOrderFilter = orderFilter, selectedQueryFilter = queryFilter) => {
    setLoading(true);
    setError('');

    try {
      const [statsData, messagesData, ordersData, ticketsData, queryData, logsData, gmailData] = await Promise.all([
        api.getStats(),
        api.getMessages(),
        api.getOrders(selectedOrderFilter),
        api.getSupportTickets(),
        api.getQueryCases(selectedQueryFilter),
        api.getLogs(),
        api.getGmailStatus()
      ]);

      setStats(statsData);
      setMessages(messagesData);
      setOrders(ordersData);
      setTickets(ticketsData);
      setQueryCases(queryData);
      setLogs(logsData);
      setGmailStatus(gmailData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh(orderFilter, queryFilter);
  }, [orderFilter, queryFilter]);

  const metrics = useMemo(() => ([
    { label: 'Total de Mensagens', value: stats.totalMessages, hint: 'Entradas processadas pelo sistema' },
    { label: 'Leads Comerciais', value: stats.totalOrders, hint: 'Fluxo comercial / parceria' },
    { label: 'Tickets de Suporte', value: stats.totalTickets, hint: 'Problemas operacionais e atendimento' },
    { label: 'Consultas / Casos', value: stats.totalQueryCases, hint: 'Perguntas e solicitações informativas' },
    { label: 'Falhas', value: stats.failedWorkflows, hint: 'Itens que precisam de retry' },
    { label: 'Processados Hoje', value: stats.processedToday, hint: 'Volume diário' },
    { label: 'Mensagens Gmail', value: stats.gmailMessages, hint: 'Capturadas da caixa de entrada' },
    { label: 'Replies com Falha', value: stats.failedReplies, hint: 'Email reply pendente de novo envio' }
  ]), [stats]);

  const handleSubmit = async (text) => {
    setSubmitting(true);
    setError('');

    try {
      await api.submitMessage(text, 'manual');
      setActiveTab('messages');
      await refresh(orderFilter, queryFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = async (id) => {
    setLoadingAction(`retry-${id}`);
    try {
      await api.retryMessage(id);
      await refresh(orderFilter, queryFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAction('');
    }
  };

  const handleRetryReply = async (id) => {
    setLoadingAction(`retry-reply-${id}`);
    try {
      await api.retryReply(id);
      await refresh(orderFilter, queryFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAction('');
    }
  };

  const handleManualRerun = async (id, payload) => {
    setLoadingAction(`override-${id}`);
    try {
      await api.updateExtractedData(id, payload);
      await refresh(orderFilter, queryFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAction('');
    }
  };

  const handleFetchGmailNow = async () => {
    setLoadingAction('gmail-fetch');
    try {
      await api.fetchGmailNow();
      setActiveTab('messages');
      await refresh(orderFilter, queryFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAction('');
    }
  };

  const handleOrderStatusChange = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      await refresh(orderFilter, queryFilter);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSupportStatusChange = async (id, status) => {
    try {
      await api.updateSupportStatus(id, status);
      await refresh(orderFilter, queryFilter);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQueryStatusChange = async (id, status) => {
    try {
      await api.updateQueryStatus(id, status);
      await refresh(orderFilter, queryFilter);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="app-brand">AI Process Automation System</div>
          <p className="sidebar-subtitle">Demo local para operação, automação e suporte</p>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Painel de Automação Operacional</h1>
            <p>
              Classificação com IA, ingestão por Gmail, extração estruturada, roteamento, retry,
              override manual e logs de suporte.
            </p>
            <p className="muted">
              Gmail polling: {gmailStatus.enabled ? 'ativo' : 'desativado'} · Configurado: {gmailStatus.configured ? 'sim' : 'não'} · Intervalo: {Math.round(gmailStatus.intervalMs / 1000)}s
            </p>
          </div>

          <div className="row gap-sm wrap">
            <button className="button secondary" onClick={() => refresh(orderFilter, queryFilter)} disabled={loading}>
              Atualizar
            </button>
            <button className="button primary" onClick={handleFetchGmailNow} disabled={loadingAction === 'gmail-fetch'}>
              {loadingAction === 'gmail-fetch' ? 'Buscando...' : 'Buscar Gmail Agora'}
            </button>
          </div>
        </header>

        <section className="stats-grid">
          {metrics.map((metric) => (
            <StatCard key={metric.label} {...metric} />
          ))}
        </section>

        {error ? <div className="alert error">{error}</div> : null}
        {loading ? <div className="alert info">Carregando dados do painel...</div> : null}

        {!loading && activeTab === 'submit' && (
          <SubmitMessagePage
            onSubmit={handleSubmit}
            submitting={submitting}
            gmailStatus={gmailStatus}
          />
        )}

        {!loading && activeTab === 'messages' && (
          <MessagesPage
            messages={messages}
            onRetry={handleRetry}
            onRetryReply={handleRetryReply}
            onManualRerun={handleManualRerun}
            loadingAction={loadingAction}
          />
        )}

        {!loading && activeTab === 'orders' && (
          <OrdersPage
            orders={orders}
            filter={orderFilter}
            onFilterChange={setOrderFilter}
            onStatusChange={handleOrderStatusChange}
          />
        )}

        {!loading && activeTab === 'support' && (
          <SupportTicketsPage
            tickets={tickets}
            onStatusChange={handleSupportStatusChange}
          />
        )}

        {!loading && activeTab === 'queries' && (
          <QueryCasesPage
            items={queryCases}
            filter={queryFilter}
            onFilterChange={setQueryFilter}
            onStatusChange={handleQueryStatusChange}
          />
        )}

        {!loading && activeTab === 'logs' && <LogsPage logs={logs} />}
      </main>
    </div>
  );
}