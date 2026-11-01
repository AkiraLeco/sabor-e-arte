// Cria ou redefine o administrador.
// Uso:  npm run admin -- email@exemplo.com "NovaSenha123"
// Com o banco local, pare a API antes de rodar.
// (ou defina ADMIN_EMAIL / ADMIN_PASSWORD no .env e rode sem argumentos)
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import User from '../models/User.js';

const email = (process.argv[2] || env.adminEmail).toLowerCase().trim();
const senha = process.argv[3] || env.adminPassword;

try {
  if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
    throw new Error('A senha deve ter ao menos 8 caracteres, com letras e números.');
  }
  await connectDB();
  const user = (await User.findOne({ email }).select('+senha')) || (await User.findOne().select('+senha'));
  if (user) {
    user.email = email;
    user.senha = senha;
    await user.save();
    console.log(`✅ Administrador atualizado: ${email}`);
  } else {
    await User.create({ nome: 'Administrador', email, senha });
    console.log(`✅ Administrador criado: ${email}`);
  }
} catch (err) {
  console.error('Falha:', err.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
