// Simple PNG generator for Expo icons
const fs = require('fs');

function createPNG(width, height, r, g, b, text) {
  const pixels = Buffer.alloc(width * height * 4);

  // Fill with background color
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    pixels[idx] = r;
    pixels[idx + 1] = g;
    pixels[idx + 2] = b;
    pixels[idx + 3] = 255; // Alpha
  }

  // Simple text rendering (just a basic pattern)
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const size = Math.min(width, height) / 4;

  for (let y = -size; y <= size; y++) {
    for (let x = -size; x <= size; x++) {
      // Draw a circle for the "H" logo
      if (x * x + y * y <= size * size) {
        const px = centerX + x;
        const py = centerY + y;
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const idx = (py * width + px) * 4;
          pixels[idx] = 255;     // R
          pixels[idx + 1] = 255; // G
          pixels[idx + 2] = 255; // B
          pixels[idx + 3] = 255; // A
        }
      }
    }
  }

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);  // bit depth
  ihdrData.writeUInt8(6, 9);  // color type (RGBA)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk (compressed image data)
  const zlib = require('zlib');
  const scanlines = [];
  for (let y = 0; y < height; y++) {
    const scanline = Buffer.alloc(width * 4 + 1);
    scanline[0] = 0; // filter type
    pixels.copy(scanline, 1, y * width * 4, (y + 1) * width * 4);
    scanlines.push(scanline);
  }
  const rawData = Buffer.concat(scanlines);
  const compressed = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// Simple CRC32 implementation
function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate images
console.log('Generating icons...');

// 1024x1024 icon - dark blue (#0f172a = 15, 23, 42)
const icon = createPNG(1024, 1024, 15, 23, 42);
fs.writeFileSync('icon.png', icon);
console.log('✓ icon.png (1024x1024)');

// 1284x2778 splash - dark blue
const splash = createPNG(1284, 2778, 15, 23, 42);
fs.writeFileSync('splash.png', splash);
console.log('✓ splash.png (1284x2778)');

// 1024x1024 adaptive icon - blue (#1e40af = 30, 64, 175)
const adaptive = createPNG(1024, 1024, 30, 64, 175);
fs.writeFileSync('adaptive-icon.png', adaptive);
console.log('✓ adaptive-icon.png (1024x1024)');

// 48x48 favicon - dark blue
const favicon = createPNG(48, 48, 15, 23, 42);
fs.writeFileSync('favicon.png', favicon);
console.log('✓ favicon.png (48x48)');

// 96x96 notification icon - white background for notifications
const notificationIcon = createPNG(96, 96, 255, 255, 255);
fs.writeFileSync('notification-icon.png', notificationIcon);
console.log('✓ notification-icon.png (96x96)');

console.log('\nAll images generated successfully!');
