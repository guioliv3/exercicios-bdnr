const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { createApp } = require('../src/marketplace');

async function main() {
  const repl = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(repl.getUri('marketplace'));
  const server = createApp().listen(Number(process.env.PORT || 3000), () => {
    console.log(`Marketplace com MongoDB temporário em http://localhost:${server.address().port}`);
    console.log('Os dados desta sessão são descartados ao encerrar o processo.');
  });
  const close = async () => { server.close(); await mongoose.disconnect(); await repl.stop(); process.exit(0); };
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
