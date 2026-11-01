import fs from 'fs';
import mongoose from 'mongoose';
import { env } from './env.js';

let localServer;

export async function connectDB() {
  mongoose.set('strictQuery', true);
  let uri = env.mongoUri;

  if (env.useLocalDb) {
    // MongoDB embutido com os arquivos salvos em server/data/mongo (persistem entre execuções)
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    fs.mkdirSync(env.localDbPath, { recursive: true });
    localServer = await MongoMemoryServer.create({
      instance: { dbPath: env.localDbPath, storageEngine: 'wiredTiger', dbName: 'restaurante' },
    });
    uri = localServer.getUri('restaurante');
    console.log('💾 Banco local embutido (dados em server/data).');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log(`✅ MongoDB conectado (${mongoose.connection.name})`);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (localServer) await localServer.stop({ doCleanup: false }); // mantém os arquivos
}
