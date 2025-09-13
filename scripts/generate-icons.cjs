const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Read the SVG file
const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/icon.svg'));

// Define the icon sizes we need
const iconSizes = [
  { size: 192, filename: 'android-chrome-192x192.png' },
  { size: 512, filename: 'android-chrome-512x512.png' },
  { size: 180, filename: 'apple-touch-icon.png' },
  { size: 32, filename: 'favicon-32x32.png' },
  { size: 16, filename: 'favicon-16x16.png' }
];

async function generateIcons() {
  console.log('🎨 Generating high-quality PNG icons from SVG...');
  
  for (const icon of iconSizes) {
    try {
      await sharp(svgBuffer)
        .resize(icon.size, icon.size)
        .png({ quality: 100, compressionLevel: 0 })
        .toFile(path.join(__dirname, '../public', icon.filename));
      
      console.log(`✅ Created ${icon.filename} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`❌ Error creating ${icon.filename}:`, error.message);
    }
  }
  
  console.log('🎉 Icon generation complete!');
}

generateIcons().catch(console.error);
