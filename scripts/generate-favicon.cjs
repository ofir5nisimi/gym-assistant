const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Read the SVG file
const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/icon.svg'));

async function generateFavicon() {
  console.log('🎯 Generating favicon.ico...');
  
  try {
    // Create a 32x32 PNG first, then convert to ICO format
    const pngBuffer = await sharp(svgBuffer)
      .resize(32, 32)
      .png({ quality: 100 })
      .toBuffer();
    
    // For now, let's just create a high-quality 32x32 PNG and rename it
    // (Most modern browsers support PNG favicons)
    fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), pngBuffer);
    
    console.log('✅ Created favicon.ico (32x32)');
    console.log('🎉 Favicon generation complete!');
  } catch (error) {
    console.error('❌ Error creating favicon:', error.message);
  }
}

generateFavicon().catch(console.error);
