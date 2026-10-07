// Monta "Estruturação site GHR/dados/tabela-produtos.json", a fonte única de valores do site e do Estúdio.
// As linhas vêm das tabelas CRED CAR B77 (pasta Tabelas/). Para atualizar valores, edite o JSON
// diretamente e rode "node scripts/conferir-tabela-produtos.mjs" para conferir o site e o Estúdio.
// Este script só foi usado para criar o arquivo a partir das tabelas que já estavam nas páginas.
import fs from "node:fs";

const [entrada, saida] = process.argv.slice(2);
const t = JSON.parse(fs.readFileSync(entrada, "utf8"));

const seg = (qtd, coluna, rotulo) => ({ qtd, coluna, rotulo });
const planos80 = {
  A: { nome: "80x · 1 parcela alta + 79x", tabela: "veiculos80", segmentos: [seg(1, 1, "1ª parcela"), seg(79, 5, "2ª a 80ª parcela")] },
  B: { nome: "80x · 2 parcelas altas + 78x", tabela: "veiculos80", segmentos: [seg(2, 2, "1ª e 2ª parcela"), seg(78, 5, "3ª a 80ª parcela")] },
  C: { nome: "80x · 3 parcelas altas + 77x", tabela: "veiculos80", segmentos: [seg(3, 3, "1ª a 3ª parcela"), seg(77, 5, "4ª a 80ª parcela")] },
  D: { nome: "80x · 4 parcelas altas + 76x", tabela: "veiculos80", segmentos: [seg(4, 4, "1ª a 4ª parcela"), seg(76, 5, "5ª a 80ª parcela")] }
};

const dados = {
  versao: "CRED CAR B77 · tabela de 20/02/2026",
  aviso: "Valores conforme tabela vigente, sujeitos a análise e aprovação.",
  colunas: {
    veiculos80: ["crédito", "1ª parcela (plano A)", "1ª e 2ª (plano B)", "1ª a 3ª (plano C)", "1ª a 4ª (plano D)", "demais parcelas"],
    carroMix120: ["crédito", "1ª a 12ª parcela", "13ª a 120ª parcela"],
    imovelConvencional240: ["crédito", "1ª a 12ª parcela", "parcela convencional", "meia parcela"],
    imovelFlex240: ["crédito", "1ª a 12ª parcela", "parcela convencional", "meia parcela"],
    imovelB77: ["crédito", "1ª parcela", "2ª a 240ª parcela"],
    pesadosConvencional120: ["crédito", "1ª parcela", "2ª a 120ª parcela"],
    pesadosFlex120: ["crédito", "1ª a 12ª parcela", "13ª a 120ª parcela"]
  },
  tabelas: t,
  planos: {
    moto: planos80,
    carro: {
      MIX: { nome: "MIX FLEX 120x · 1ª a 12ª menor + 13ª a 120ª maior (R$ 100 a 200 mil)", tabela: "carroMix120", segmentos: [seg(12, 1, "1ª a 12ª parcela"), seg(108, 2, "13ª a 120ª parcela")] },
      ...Object.fromEntries(Object.entries(planos80).map(([k, p]) => [k, { ...p, nome: `${p.nome} (R$ 20 a 100 mil)` }]))
    },
    imovel: {
      B77: { nome: "B77 · 1ª alta + 239x", tabela: "imovelB77", segmentos: [seg(1, 1, "1ª parcela"), seg(239, 2, "2ª a 240ª parcela")] },
      CONV: { nome: "Convencional 240x", tabela: "imovelConvencional240", segmentos: [seg(12, 1, "1ª a 12ª parcela"), seg(228, 2, "13ª a 240ª parcela")] },
      FLEX: { nome: "Flex 240x (1ª a 12ª maior)", tabela: "imovelFlex240", segmentos: [seg(12, 1, "1ª a 12ª parcela"), seg(228, 2, "13ª a 240ª parcela")] }
    },
    pesados: {
      CONV: { nome: "Convencional 120x · 1ª alta + 119x", tabela: "pesadosConvencional120", segmentos: [seg(1, 1, "1ª parcela"), seg(119, 2, "2ª a 120ª parcela")] },
      FLEX: { nome: "Flex 120x · 1ª a 12ª menor + 13ª a 120ª maior", tabela: "pesadosFlex120", segmentos: [seg(12, 1, "1ª a 12ª parcela"), seg(108, 2, "13ª a 120ª parcela")] }
    }
  },
  // exemplos vigentes de cada produto (confirmados pelo Gustavo em 07/10/2026)
  vitrine: {
    moto: { plano: "A", credito: 25000 },
    carro: { plano: "MIX", credito: 120000 },
    imovel: { plano: "B77", credito: 220000 },
    pesados: { plano: "CONV", credito: 300000 }
  },
  // números de regra do produto (CLAUDE.md) que podem aparecer em destaque
  fatos: [
    { numero: "120", texto: "participantes por grupo" },
    { numero: "2", texto: "entregas garantidas por mês no grupo" },
    { numero: "50%", texto: "a partir do 3º mês, crédito liberado sem concorrência" },
    { numero: "0", texto: "sorteios: a data de entrega fica no contrato" }
  ]
};

fs.writeFileSync(saida, JSON.stringify(dados, null, 2) + "\n");
console.log("ok:", saida);
