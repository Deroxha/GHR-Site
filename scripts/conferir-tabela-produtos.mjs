// Confere a fonte única de valores (Estruturação site GHR/dados/tabela-produtos.json):
//  1. cada plano soma o prazo certo e os exemplos da vitrine existem na tabela;
//  2. todo valor em R$ escrito nas páginas do site existe na tabela (crédito ou parcela);
//  3. a cópia usada pelo Estúdio GHR é idêntica à do site.
// Uso: node scripts/conferir-tabela-produtos.mjs   (sai com erro se achar divergência)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(RAIZ, "Estruturação site GHR");
const ARQ = path.join(SITE, "dados", "tabela-produtos.json");
const COPIA_ESTUDIO = path.join(RAIZ, "Estudio GHR", "public", "dados", "tabela-produtos.json");
const PRAZOS = { moto: 80, carro: { MIX: 120 }, imovel: 240, pesados: 120 };

const erros = [];
const d = JSON.parse(fs.readFileSync(ARQ, "utf8"));

// 1. planos e vitrine
for (const [produto, planos] of Object.entries(d.planos)) {
  for (const [id, p] of Object.entries(planos)) {
    const tab = d.tabelas[p.tabela];
    if (!tab) { erros.push(`${produto}/${id}: tabela ${p.tabela} não existe`); continue; }
    const soma = p.segmentos.reduce((a, s) => a + s.qtd, 0);
    const esperado = typeof PRAZOS[produto] === "object" ? (PRAZOS[produto][id] ?? 80) : PRAZOS[produto];
    if (soma !== esperado) erros.push(`${produto}/${id}: soma ${soma} parcelas, esperado ${esperado}`);
    for (const s of p.segmentos) if (tab.some(l => typeof l[s.coluna] !== "number")) erros.push(`${produto}/${id}: coluna ${s.coluna} vazia`);
  }
}
for (const [produto, v] of Object.entries(d.vitrine)) {
  const p = d.planos[produto]?.[v.plano];
  if (!p || !d.tabelas[p.tabela].some(l => l[0] === v.credito)) erros.push(`vitrine ${produto}: ${v.plano} ${v.credito} não está na tabela`);
}

// 2. valores escritos nas páginas
// valores que não são preço de produto (não precisam estar na tabela)
const NAO_SAO_PRECO = { "empresas.html": ["R$ 800 mil"] }; // faixa de comissão dos parceiros B2B
const validos = new Set(Object.values(d.tabelas).flat().flat().map(v => Math.round(v * 100)));
for (const f of fs.readdirSync(SITE).filter(f => f.endsWith(".html"))) {
  const html = fs.readFileSync(path.join(SITE, f), "utf8").replace(/<script[\s\S]*?<\/script>/g, "");
  for (const m of html.matchAll(/R\$\s?([\d.]+(?:,\d{1,2})?)(\s?mil)?/g)) {
    let v = Number(m[1].replace(/\./g, "").replace(",", "."));
    if (m[2]) v *= 1000;
    if ((NAO_SAO_PRECO[f] || []).includes(m[0].trim())) continue;
    if (v && !validos.has(Math.round(v * 100))) erros.push(`${f}: "${m[0].trim()}" não está na tabela`);
  }
}

// 3. cópia do Estúdio
if (fs.existsSync(COPIA_ESTUDIO)) {
  if (fs.readFileSync(COPIA_ESTUDIO, "utf8").replace(/\r\n/g, "\n") !== fs.readFileSync(ARQ, "utf8").replace(/\r\n/g, "\n")) {
    erros.push("A cópia do Estúdio está diferente. Rode: node scripts/conferir-tabela-produtos.mjs --copiar");
  }
}
if (process.argv.includes("--copiar") && fs.existsSync(path.dirname(path.dirname(COPIA_ESTUDIO)))) {
  fs.mkdirSync(path.dirname(COPIA_ESTUDIO), { recursive: true });
  fs.copyFileSync(ARQ, COPIA_ESTUDIO);
  console.log("Cópia do Estúdio atualizada.");
}

if (erros.length) { console.log(`✗ ${erros.length} divergência(s):\n- ${erros.join("\n- ")}`); process.exitCode = 1; }
else console.log("✓ Tabela de produtos conferida: planos, vitrine, valores das páginas e cópia do Estúdio.");
