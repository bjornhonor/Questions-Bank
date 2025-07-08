// /backend/utils/checkImages.js
const fs = require('fs');
const path = require('path');
const questions = require('../data');

/**
 * Verifica se todas as imagens referenciadas no data.js existem
 */
function checkImagesExist() {
  console.log('🔍 Verificando imagens referenciadas no data.js...\n');
  
  let totalImages = 0;
  let existingImages = 0;
  let missingImages = [];
  
  questions.forEach((question, questionIndex) => {
    if (question.attachments && question.attachments.length > 0) {
      question.attachments.forEach((attachment, attachmentIndex) => {
        // Verifica se é uma URL de imagem local
        if (attachment.includes('localhost:5000/images/')) {
          totalImages++;
          
          // Extrai o nome do arquivo
          const filename = attachment.split('/images/')[1];
          const imagePath = path.join(__dirname, '../public/images', filename);
          
          if (fs.existsSync(imagePath)) {
            existingImages++;
            console.log(`✅ ${filename} - OK`);
          } else {
            missingImages.push({
              file: filename,
              question: questionIndex + 1,
              attachment: attachmentIndex + 1,
              area: question.area
            });
            console.log(`❌ ${filename} - NÃO ENCONTRADA`);
          }
        }
      });
    }
  });
  
  console.log('\n📊 RESUMO:');
  console.log(`Total de imagens encontradas no data.js: ${totalImages}`);
  console.log(`Imagens existentes: ${existingImages}`);
  console.log(`Imagens faltando: ${missingImages.length}`);
  
  if (missingImages.length > 0) {
    console.log('\n⚠️  IMAGENS FALTANDO:');
    missingImages.forEach(img => {
      console.log(`- ${img.file} (Questão ${img.question}, Anexo ${img.attachment} - ${img.area})`);
    });
    
    console.log('\n💡 PARA CORRIGIR:');
    console.log('1. Adicione as imagens faltando na pasta backend/public/images/');
    console.log('2. Ou atualize as URLs no data.js para apontar para imagens existentes');
  } else {
    console.log('\n🎉 Todas as imagens estão disponíveis!');
  }
  
  return missingImages.length === 0;
}

/**
 * Lista todas as imagens disponíveis na pasta
 */
function listAvailableImages() {
  const imagesDir = path.join(__dirname, '../public/images');
  
  if (!fs.existsSync(imagesDir)) {
    console.log('📂 Pasta de imagens não existe. Criando...');
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('✅ Pasta criada: backend/public/images/');
    return;
  }
  
  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file)
  );
  
  console.log('\n📁 IMAGENS DISPONÍVEIS:');
  if (imageFiles.length === 0) {
    console.log('Nenhuma imagem encontrada na pasta backend/public/images/');
    console.log('\n💡 PARA ADICIONAR IMAGENS:');
    console.log('1. Coloque seus arquivos PNG/JPG na pasta backend/public/images/');
    console.log('2. Use a URL: http://localhost:5000/images/nome-do-arquivo.png');
  } else {
    imageFiles.forEach(file => {
      console.log(`- ${file} → http://localhost:5000/images/${file}`);
    });
  }
}

// Executa as verificações
if (require.main === module) {
  console.log('🖼️  VERIFICADOR DE IMAGENS\n');
  listAvailableImages();
  console.log('\n' + '='.repeat(50));
  checkImagesExist();
}

module.exports = { checkImagesExist, listAvailableImages };