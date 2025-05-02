const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../docs/browser');
const destDir = path.join(__dirname, '../docs');

if (!fs.existsSync(srcDir)) {
  console.error('No existe docs/browser. ¿Has ejecutado el build?');
  process.exit(1);
}

// Copia todos los archivos y carpetas de docs/browser a docs/
fs.readdirSync(srcDir).forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  if (fs.lstatSync(srcPath).isDirectory()) {
    fs.cpSync(srcPath, destPath, { recursive: true });
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
});

console.log('Archivos copiados de docs/browser/ a docs/');
