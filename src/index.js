require('dotenv').config();
const mongoose = require('mongoose');
const { createApp } = require('./marketplace');

async function main() {
  if (!process.env.MONGO_URI) throw new Error('Defina MONGO_URI no arquivo .env');
  await mongoose.connect(process.env.MONGO_URI);
  const port = Number(process.env.PORT || 3000);
  createApp().listen(port, () => console.log(`Marketplace MongoDB rodando em http://localhost:${port}`));
}

main().catch(error => { console.error('Falha ao iniciar:', error.message); process.exit(1); });
