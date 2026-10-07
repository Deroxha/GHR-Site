// Fonte única de valores do site e do Estúdio GHR: dados/tabela-produtos.json (tabelas CRED CAR).
// Os simuladores das páginas esperam este arquivo carregar antes de calcular.
window.tabelaProdutos = fetch("/dados/tabela-produtos.json", { cache: "no-cache" }).then(r => {
  if (!r.ok) throw new Error(`tabela-produtos.json: ${r.status}`);
  return r.json();
});
window.tabelaProdutos.catch(e => console.error("Não foi possível carregar a tabela de produtos.", e));
