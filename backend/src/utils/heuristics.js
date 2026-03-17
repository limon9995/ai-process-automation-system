const containsAny = (text, words) => words.some((word) => text.includes(word));

export const heuristicClassification = (rawText) => {
  const text = rawText.toLowerCase();

  if (
    containsAny(text, [
      'patrocínio',
      'patrocinio',
      'parceria',
      'partnership',
      'colaboração',
      'colaboracao',
      'podcast',
      'evento',
      'media kit',
      'proposta comercial',
      'quero anunciar',
      'sponsor'
    ])
  ) {
    return {
      type: 'order',
      confidence: 0.82,
      reason: 'Detected commercial/partnership intent.'
    };
  }

  if (
    containsAny(text, [
      'suporte',
      'erro',
      'problema',
      'bug',
      'ajuda',
      'newsletter não chegou',
      'newsletter nao chegou',
      'link quebrado',
      'não consigo',
      'nao consigo',
      'acesso',
      'reclamação',
      'reclamacao'
    ])
  ) {
    return {
      type: 'support',
      confidence: 0.8,
      reason: 'Detected support or issue-related intent.'
    };
  }

  if (
    containsAny(text, [
      'informações',
      'informacoes',
      'como funciona',
      'preço',
      'preco',
      'agenda',
      'datas',
      'detalhes',
      'quero saber',
      'disponível',
      'disponivel',
      'community',
      'whatsapp',
      'newsletter',
      'convite'
    ])
  ) {
    return {
      type: 'query',
      confidence: 0.76,
      reason: 'Detected information or inquiry intent.'
    };
  }

  return {
    type: 'other',
    confidence: 0.45,
    reason: 'No strong workflow intent detected.'
  };
};

const detectQuantity = (text) => {
  const match = text.match(/(\d{1,3})\s?(cotas|slots|vagas|episódios|episodios|ingressos|convites|pacotes|unidades)?/i);
  return match ? Number(match[1]) : null;
};

const detectPhone = (text) => {
  const match = text.match(/(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}/);
  return match ? match[0] : null;
};

const detectEmail = (text) => {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : null;
};

const detectCity = (text) => {
  const cities = [
    'são paulo',
    'sao paulo',
    'rio de janeiro',
    'brasília',
    'brasilia',
    'campinas',
    'belo horizonte',
    'curitiba',
    'porto alegre',
    'recife',
    'salvador',
    'florianópolis',
    'florianopolis'
  ];

  const found = cities.find((city) => text.toLowerCase().includes(city));
  if (!found) return null;

  return found
    .replace('sao paulo', 'São Paulo')
    .replace('brasilia', 'Brasília')
    .replace('florianopolis', 'Florianópolis')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const detectTopic = (text) => {
  const topics = [
    'newsletter',
    'parceria',
    'patrocínio',
    'patrocinio',
    'podcast',
    'evento',
    'whatsapp',
    'comunidade',
    'sponsor',
    'mídia',
    'midia',
    '5g',
    'telecom'
  ];

  return topics.find((topic) => text.toLowerCase().includes(topic)) || null;
};

const detectOrganization = (text) => {
  const match = text.match(/(?:empresa|company|organização|organizacao)\s*[:\-]?\s*([^\n,]+)/i);
  return match ? match[1].trim().slice(0, 80) : null;
};

export const heuristicExtraction = (rawText, type) => {
  const quantity = detectQuantity(rawText);
  const phone = detectPhone(rawText);
  const email = detectEmail(rawText);
  const city = detectCity(rawText);
  const topic = detectTopic(rawText);
  const organization = detectOrganization(rawText);
  const pieces = rawText.split(/,|\n/).map((item) => item.trim()).filter(Boolean);
  const customerLine = pieces.find((item) => /nome|meu nome|sou|falo em nome|this is|i am/i.test(item)) || null;

  return {
    customerName: customerLine
      ? customerLine
          .replace(/^(nome|meu nome|sou|this is|i am)\s*[:\-]?\s*/i, '')
          .trim()
          .slice(0, 80)
      : null,
    phone,
    product: type === 'order' ? topic || 'Solicitação comercial' : null,
    quantity,
    address: pieces.find((item) => /endereço|endereco|avenida|rua|bairro|office|address/i.test(item)) || null,
    city,
    notes: rawText.slice(0, 240),
    subject:
      type === 'support'
        ? 'Solicitação de suporte'
        : type === 'query'
          ? 'Consulta comercial / informativa'
          : type === 'order'
            ? 'Lead comercial'
            : null,
    issueSummary:
      type === 'support' || type === 'query'
        ? rawText.slice(0, 180)
        : null,
    priority: /urgente|asap|hoje|imediato|priority/i.test(rawText) ? 'high' : 'medium',
    email,
    organization,
    topic
  };
};

export const heuristicReply = (workflowType, extracted) => {
  if (workflowType === 'order') {
    return `Obrigado pelo contato${extracted.customerName ? `, ${extracted.customerName}` : ''}. Recebemos sua solicitação comercial e um responsável do time vai retornar em breve.`;
  }

  if (workflowType === 'support') {
    return 'Obrigado pela mensagem. Nosso time registrou sua solicitação de suporte e fará o acompanhamento o quanto antes.';
  }

  if (workflowType === 'query') {
    return 'Obrigado pelo contato. Registramos sua consulta e vamos responder com mais detalhes em breve.';
  }

  return 'Obrigado pela mensagem. Seu contato foi registrado no sistema de automação para análise do time.';
};