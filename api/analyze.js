export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  try {
    const { system, fileName, text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text data" });

    const fieldKeys = [
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

    const userMessage = "ARQUIVO: " + (fileName || "processo.pdf") +
      "\n\n⚠️ ATENÇÃO ESPECIAL - LEIA ANTES DE ANALISAR:" +
      "\n1. VALOR DA CAUSA: Procure em TODA a petição inicial por 'valor da causa', 'dá à causa o valor', 'atribui à causa'. Pode aparecer como R$ 700.000,00 ou setecentos mil reais. Está geralmente no FINAL da petição inicial. Este campo é OBRIGATÓRIO - só use N/A se realmente não existir no texto." +
      "\n2. DATA DE DEMISSÃO vs ADMISSÃO: São DUAS datas diferentes. ADMISSÃO = quando começou a trabalhar (data MAIS ANTIGA). DEMISSÃO = quando saiu/foi dispensado (data MAIS RECENTE). REGRA CRÍTICA: Quando houver DUAS ou mais datas de demissão diferentes no processo (ex: uma na petição inicial e outra na sentença), use SEMPRE a data que consta na SENTENÇA, pois é a data reconhecida judicialmente. A sentença tem prioridade sobre qualquer outro documento." +
      "\n3. DATA DE ADMISSÃO: Mesma regra - se houver datas conflitantes, priorize a data da SENTENÇA." +
      "\n\nAgora analise este
