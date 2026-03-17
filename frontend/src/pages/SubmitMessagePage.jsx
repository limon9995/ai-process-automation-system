import { useState } from 'react';
import { SectionCard } from '../components/SectionCard';

const samples = [
  'Olá, meu nome é Lucas Almeida. Gostaria de conversar sobre uma parceria de conteúdo com foco em 5G e infraestrutura. Empresa: ConectaHub. Cidade: São Paulo. Telefone: +55 11 98888-1111.',
  'Preciso de ajuda: não estou recebendo a newsletter há duas semanas. Meu nome é Felipe Costa e meu email é felipe.costa@gmail.com.',
  'Bom dia! Quero saber como participar da comunidade no WhatsApp e receber os próximos eventos do setor telecom em Campinas.'
];

export function SubmitMessagePage({ onSubmit, submitting, gmailStatus }) {
  const [text, setText] = useState(samples[0]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(text);
  };

  return (
    <SectionCard
      title="Enviar Mensagem de Teste"
      subtitle="Simule uma entrada manual do formulário ou deixe o Gmail trazer emails reais para o mesmo pipeline."
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Mensagem</span>
          <textarea
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cole aqui uma solicitação comercial, suporte, parceria, evento ou consulta..."
          />
        </label>

        <div className="row gap-sm wrap">
          {samples.map((sample) => (
            <button
              type="button"
              key={sample}
              className="button secondary small"
              onClick={() => setText(sample)}
            >
              Carregar exemplo
            </button>
          ))}
        </div>

        <div className="alert info">
          Gmail polling está <strong>{gmailStatus.enabled ? 'ativo' : 'desativado'}</strong>. Configure as credenciais no backend e defina <code>ENABLE_GMAIL_POLLING=true</code> para buscar emails não lidos a cada 60 segundos.
        </div>

        <div className="row gap-sm">
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? 'Processando...' : 'Enviar e Rodar Workflow'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}