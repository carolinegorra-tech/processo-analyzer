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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        system: system || "",
        messages: [{
          role: "user",
          content: "ARQUIVO: " + (fileName || "processo.pdf") + "\n\nAnalise este texto extraído de um PDF de processo trabalhista e retorne APENAS JSON válido com as seguintes 34 chaves:\n" + JSON.stringify(fieldKeys) + "\n\nSiga TODAS as instruções do system prompt para cada campo. Use alto esforço.\n\n" + text
        }],
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
