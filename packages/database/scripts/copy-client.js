const fs = require('fs');
const path = require('path');

// Copy src/client to dist/client
const srcDir = path.join(__dirname, '../src/client');
const destDir = path.join(__dirname, '../dist/client');

if (fs.existsSync(srcDir)) {
  if (!fs.existsSync(path.dirname(destDir))) {
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
  }
  
  // Simple copy function
  const copyRecursive = (src, dest) => {
    if (fs.existsSync(src)) {
      if (fs.lstatSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(child => 
          copyRecursive(path.join(src, child), path.join(dest, child))
        );
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  };
  
  copyRecursive(srcDir, destDir);
  console.log('✅ Client files copied to dist/client');
} else {
  console.log('⚠️ src/client directory not found');
}
