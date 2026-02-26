# Processo Analyzer

Analisa PDFs trabalhistas e extrai 34 campos com Claude AI.
Link público — qualquer pessoa usa, sem API key.

## Deploy no Vercel (5 min)

### 1. Suba no GitHub
```bash
cd processo-analyzer
git init && git add . && git commit -m "init"
gh repo create processo-analyzer --public --push
```

### 2. Deploy no Vercel
- Vá em vercel.com/new → selecione o repo → Deploy

### 3. Adicione a API key
- Settings → Environment Variables
- Key: `ANTHROPIC_API_KEY`  
- Value: `sk-ant-api03-...`
- Save → Redeploy

### 4. Pronto!
Link: `https://processo-analyzer.vercel.app`

## Custo
- Vercel: grátis
- Claude API: ~$0.03-0.15 por PDF
