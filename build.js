const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

function copyStaticFiles(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src);

  for (const entry of entries) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);

    if (fs.statSync(srcPath).isDirectory()) {
      copyStaticFiles(srcPath, destPath);
    } else {
      // Only copy non-TypeScript files
      if (!entry.endsWith('.ts')) {
        fs.copyFileSync(srcPath, destPath);
      }
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

// Compile TypeScript first
console.log('📦 Compiling TypeScript...');
try {
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful!');
} catch (error) {
  console.error('❌ TypeScript compilation failed:', error.message);
  process.exit(1);
}

// Copy non-TypeScript files (HTML, CSS, JSON, etc.)
console.log('📁 Copying static files...');
if (fs.existsSync(distDir)) {
  // Don't remove dist directory, just copy static files
  copyStaticFiles(srcDir, distDir);
} else {
  fs.mkdirSync(distDir, { recursive: true });
  copyStaticFiles(srcDir, distDir);
}

// Copy diff library
const diffSourcePath = path.join(__dirname, 'node_modules', 'diff', 'lib', 'index.es6.js');
const diffDestPath = path.join(distDir, 'lib', 'diff.js');
if (!fs.existsSync(path.dirname(diffDestPath))) {
  fs.mkdirSync(path.dirname(diffDestPath), { recursive: true });
}
fs.copyFileSync(diffSourcePath, diffDestPath);

const iconsDir = path.join(distDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Copy the favicon.png to use as extension icons
const faviconPath = path.join(__dirname, 'favicon.png');
if (fs.existsSync(faviconPath)) {
  const iconSizes = [16, 32, 48, 128];
  iconSizes.forEach(size => {
    const iconPath = path.join(iconsDir, `icon${size}.png`);
    fs.copyFileSync(faviconPath, iconPath);
    console.log(`Copied favicon.png to ${iconPath}`);
  });
} else {
  // Fallback to generated icons if favicon.png doesn't exist
  const iconSizes = [16, 32, 48, 128];
  iconSizes.forEach(size => {
    createSimpleIcon(size, path.join(iconsDir, `icon${size}.png`));
  });
}

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