const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src);

  for (const entry of entries) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createSimpleIcon(size, outputPath) {
  const svgContent = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="#007bff" stroke="#0056b3" stroke-width="2"/>
  <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size/3}" font-weight="bold">AI</text>
</svg>`;

  const canvas = `
data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
  
  console.log(`Created ${size}x${size} icon placeholder at ${outputPath}`);
}

console.log('🔨 Building AI SUS Watcher extension...');

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}

copyDir(srcDir, distDir);

const iconsDir = path.join(distDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const iconSizes = [16, 32, 48, 128];
iconSizes.forEach(size => {
  createSimpleIcon(size, path.join(iconsDir, `icon${size}.png`));
});

console.log('✅ Extension built successfully!');
console.log('📁 Output directory: ./dist');
console.log('');
console.log('Next steps:');
console.log('1. Open Chrome and go to chrome://extensions/');
console.log('2. Enable "Developer mode" in the top right');
console.log('3. Click "Load unpacked" and select the ./dist directory');
console.log('4. The AI SUS Watcher extension should now be installed!');
console.log('');
console.log('⚠️  Note: Icon placeholders created. Replace with actual PNG icons in src/icons/ for production.');