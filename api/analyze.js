module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });
  try {
    var system = req.body.system || "";
    var fileName = req.body.fileName || "processo.pdf";
    var text = req.body.text;
    if (!text) return res.status(400).json({ error: "Missing text data" });
    var fieldKeys = [
      "numero_processo","status_processo","data_arquivamento",
      "nome_reclamante","patrono_reclamante","reclamadas",
      "comarca","vara","nome_juiz","turma_trt","turma_tst",
      "valor_causa","pedidos_inicial","data_admissao","data_demissao",
      "data_audiencia","tipo_audiencia","testemunhas_reclamada","testemunhas_reclamante",
      "fase_atual","sentenca","sentenca_enquadramento","sentenca_jornada_externa",
      "resumo_trt","acordao_trt_enquadramento","acordao_trt_jornada_externa","sustentacao_oral",
      "acordao_tst","acordao_tst_enquadramento","acordao_tst_jornada_externa",
      "data_ultimo_andamento","resumo_ultimo_andamento",
      "numero_execucao_provisoria","valor_homologado_execucao"
    ];
    var userMsg = "ARQUIVO: " + fileName +
      "\n\nTIPO DE DOCUMENTO: Este pode ser uma PETIÇÃO INICIAL (sem número de processo, vara ou juiz atribuídos ainda — isso é normal e esperado)." +
      "\n\nATENÇÃO ESPECIAL — campos obrigatórios mesmo em petições iniciais:" +
      "\n1. valor_causa: Procure por 'dá-se à causa o valor', 'valor da causa' ou valor total ao final dos pedidos. OBRIGATÓRIO. Formato: R$ XXXXX,XX." +
      "\n2. data_admissao: Procure na seção 'Do Contrato de Trabalho' ou 'Dos Fatos'. Formato DD/MM/AAAA." +
      "\n3. data_demissao: Idem. Se houver conflito entre petição e sentença, use SEMPRE a da sentença. Demissão é POSTERIOR à admissão." +
      "\n4. pedidos_inicial: Extraia da seção 'Dos Pedidos' ou 'Requerimentos'. Liste os termos nucleares separados por ';'. Ignore justiça gratuita, notificações e honorários." +
      "\n5. nome_reclamante: Nome completo do autor/reclamante." +
      "\n6. reclamadas: Nome completo da empresa ré em MAIÚSCULAS." +
      "\n7. comarca: Cidade do juízo. Ex: Curitiba." +
      "\n8. patrono_reclamante: Nome(s) do(s) advogado(s) do reclamante. Separar por ';' se múltiplos." +
      "\n9. fase_atual: Para petições iniciais sem andamento posterior, use 'Conhecimento'." +
      "\n10. data_ultimo_andamento: Use a data de protocolo ou autuação se disponível. Formato DD/MM/AAAA." +
      "\n11. resumo_ultimo_andamento: Breve descrição do último andamento ou 'Petição inicial protocolada' se for o primeiro ato." +
      "\n\nREGRA GERAL: Se o campo genuinamente não existe no documento (ex: número do processo numa petição inicial ainda não distribuída), retorne null. NÃO invente dados." +
      "\n\nRetorne APENAS JSON válido com as 34 chaves:\n" + JSON.stringify(fieldKeys) +
      "\n\nSiga TODAS as instruções do system prompt.\n\n" + text;
    var response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        system: system,
        messages: [{ role: "user", content: userMsg }]
      })
    });
    var data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
