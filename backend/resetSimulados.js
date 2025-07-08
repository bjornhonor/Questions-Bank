// /backend/resetSimulados.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db');
const Simulado = require('./models/Simulado');

dotenv.config();
connectDB();

const resetSimulados = async () => {
  try {
    console.log('=== RESETANDO SIMULADOS ===\n');
    
    // Contar simulados existentes
    const totalExistentes = await Simulado.countDocuments();
    console.log(`📊 Simulados existentes: ${totalExistentes}`);
    
    if (totalExistentes === 0) {
      console.log('ℹ️  Não há simulados para remover.');
      process.exit();
    }
    
    // Perguntar confirmação (simulação - em produção você pode usar readline)
    console.log('⚠️  ATENÇÃO: Esta operação irá remover TODOS os simulados!');
    console.log('   Para confirmar, execute: npm run reset-simulados -- --confirm');
    
    // Verificar se foi passado o flag de confirmação
    const args = process.argv.slice(2);
    if (!args.includes('--confirm')) {
      console.log('❌ Operação cancelada. Use --confirm para prosseguir.');
      process.exit();
    }
    
    // Remover todos os simulados
    const result = await Simulado.deleteMany({});
    console.log(`✅ ${result.deletedCount} simulados removidos com sucesso!`);
    
    console.log('\n💡 Para gerar novos simulados, execute:');
    console.log('   npm run generate-simulados');
    
    console.log('\n=== RESET CONCLUÍDO ===');
    process.exit();
    
  } catch (error) {
    console.error('❌ ERRO NO RESET:', error);
    process.exit(1);
  }
};

resetSimulados();