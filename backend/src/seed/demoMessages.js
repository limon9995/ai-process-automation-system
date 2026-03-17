// Demo messages covering multiple workflow types, sources, and Brazilian cities.
// Objects with rawText + source simulate real mixed-channel ingestion.
// Plain strings fall back to source: 'manual'.

export const demoMessages = [
  // --- ORDER / LEAD (commercial intent) ---
  {
    rawText: 'Olá, meu nome é Lucas Almeida. Gostaria de conversar sobre uma parceria de conteúdo com foco em 5G e infraestrutura. Empresa: ConectaHub. Cidade: São Paulo. Telefone: +55 11 98888-1111.',
    source: 'manual'
  },
  {
    rawText: 'Oi, sou Mariana Torres do time de marketing da NovaRede. Temos interesse em patrocinar a newsletter e entender os formatos disponíveis para patrocínio. Email: mariana@novarede.com.br. Empresa: NovaRede Telecomunicações. Cidade: Rio de Janeiro.',
    source: 'api',
    emailSender: 'mariana@novarede.com.br',
    emailSubject: 'Interesse em patrocínio da newsletter'
  },
  {
    rawText: 'Bom dia! Falo em nome da FiberWave, de Curitiba. Precisamos de uma proposta comercial para anunciar nos canais de vocês — newsletter, podcast e comunidade. Qual o media kit disponível? Telefone: +55 41 99777-2222.',
    source: 'manual'
  },
  {
    rawText: 'Olá, quero entender como funciona o processo para colaboração editorial e conteúdo patrocinado. Empresa: Signal Labs. Cidade: Rio de Janeiro. Email: comercial@signallabs.com.br.',
    source: 'api',
    emailSender: 'comercial@signallabs.com.br',
    emailSubject: 'Proposta de colaboração editorial'
  },
  {
    rawText: 'Boa tarde! Sou Pedro Nascimento, CEO da InfraTech em Campinas. Temos interesse em apresentar nossa empresa como case de inovação no próximo episódio de vocês. Telefone: +55 19 98555-3333. Email: pedro@infratech.com.br.',
    source: 'gmail',
    emailSender: 'pedro@infratech.com.br',
    emailSubject: 'Participação como case de inovação no podcast'
  },

  // --- SUPPORT (operational issues) ---
  {
    rawText: 'Preciso de ajuda: não estou recebendo a newsletter há duas semanas. Já verifiquei minha caixa de spam e não está lá. Meu nome é Felipe Costa e meu email é felipe.costa@gmail.com.',
    source: 'manual'
  },
  {
    rawText: 'Olá, o link do último episódio do podcast está quebrado. Quando clico no botão de ouvir, dá erro 404. Podem verificar? Estou em Belo Horizonte. Email: ana.lima@hotmail.com.',
    source: 'gmail',
    emailSender: 'ana.lima@hotmail.com',
    emailSubject: 'Link do podcast quebrado - Episódio #47'
  },
  {
    rawText: 'Olá! Tentei me inscrever na comunidade do WhatsApp pelo link do site mas o link expirou. Pode me enviar um novo convite? Sou Gabriela Rocha, de Porto Alegre. Email: gabriela.rocha@gmail.com.',
    source: 'manual'
  },
  {
    rawText: 'Problema urgente: minha conta de assinante foi cancelada automaticamente mas ainda estou no período pago. Por favor verificar. Nome: Roberto Fonseca. Cidade: Recife. Telefone: +55 81 98444-5555.',
    source: 'api',
    emailSender: 'roberto.fonseca@empresa.com',
    emailSubject: 'Cancelamento indevido de assinatura'
  },

  // --- QUERY (information requests) ---
  {
    rawText: 'Bom dia! Quero saber como participar da comunidade no WhatsApp e receber os próximos eventos do setor telecom. Estou em Campinas. Podem me adicionar na lista?',
    source: 'manual'
  },
  {
    rawText: 'Olá, podem me enviar mais detalhes sobre participação como convidado no podcast? Sou Ana Ribeiro, consultora de inovação em telecomunicações, de Recife. Email: ana.ribeiro@consultoria.com.',
    source: 'gmail',
    emailSender: 'ana.ribeiro@consultoria.com',
    emailSubject: 'Interesse em ser convidada no podcast'
  },
  {
    rawText: 'Gostaria de convidar o time para um evento sobre inovação em redes 5G em Brasília no mês que vem. Quais são as condições para participação e cobertura editorial? Organização: TechBrasília. Email: eventos@techbrasilia.org.br.',
    source: 'api',
    emailSender: 'eventos@techbrasilia.org.br',
    emailSubject: 'Convite para cobertura de evento 5G em Brasília'
  },
  {
    rawText: 'Boa tarde! Tenho interesse em receber a newsletter semanal sobre telecom e inovação. Como faço para me inscrever? Meu email é joao.mendes@empresa.com. Estou em Salvador.',
    source: 'manual'
  },

  // --- OTHER (generic / unclear intent) ---
  {
    rawText: 'Testando o formulário de contato. Alguém pode me responder para confirmar que a mensagem chegou?',
    source: 'manual'
  },
  {
    rawText: 'Hi, I came across your platform while researching Brazilian telecom market. Is there an English version of your newsletter or community? Based in London.',
    source: 'api',
    emailSender: 'j.whitmore@globaltech.co.uk',
    emailSubject: 'English version inquiry'
  }
];
