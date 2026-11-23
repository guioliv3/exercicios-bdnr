const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createApp } = require('../parte1');

async function main() {
  const server = createApp().listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (method, route, body) => {
    const response = await fetch(base + route, { method, headers: { 'content-type': 'application/json' }, body: body && JSON.stringify(body) });
    return { method, route, request: body || null, status: response.status, response: await response.json() };
  };
  try {
    const results = [];
    results.push(await request('POST', '/usuarios', { nome: 'Loja Tech', tipo: 'vendedor' }));
    results.push(await request('POST', '/usuarios', { nome: 'João Silva', tipo: 'comprador' }));
    results.push(await request('POST', '/produtos', { vendedorId: results[0].response.id, nome: 'Teclado Mecânico', preco: 250, estoque: 5 }));
    results.push(await request('GET', '/produtos'));
    results.push(await request('POST', '/pedidos', { compradorId: results[1].response.id, produtoId: results[2].response.id, quantidade: 2 }));
    const after = await request('GET', '/produtos');
    assert.ok(results.slice(0, 3).every(result => result.status === 201));
    assert.equal(results[3].response[0].estoque, 5);
    assert.equal(results[4].status, 201);
    assert.equal(results[4].response.valorTotal, 500);
    assert.equal(after.response[0].estoque, 3);
    const output = path.resolve(__dirname, '../docs/Parte-2-resultado.json');
    await fs.writeFile(output, JSON.stringify({ results, estoqueAposCompra: after.response[0].estoque }, null, 2) + '\n');
    console.log(output);
  } finally { server.close(); }
}

if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { main };
