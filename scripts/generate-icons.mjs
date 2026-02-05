import sharp from 'sharp'

const sizes = [192, 512]

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#a8e6cf"/>
      <stop offset="50%" style="stop-color:#88d8b0"/>
      <stop offset="100%" style="stop-color:#ffeaa7"/>
    </linearGradient>
    <linearGradient id="sun" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fff9c4"/>
      <stop offset="50%" style="stop-color:#ffee58"/>
      <stop offset="100%" style="stop-color:#ffc107"/>
    </linearGradient>
    <linearGradient id="trunk" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#8d6e63"/>
      <stop offset="100%" style="stop-color:#6d4c41"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4caf50"/>
      <stop offset="100%" style="stop-color:#2e7d32"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="100" fill="url(#bg)"/>

  <!-- Sun -->
  <circle cx="380" cy="120" r="70" fill="url(#sun)"/>

  <!-- Palm trunk -->
  <path d="M 240 480 Q 250 350 280 250 Q 285 230 275 220"
        stroke="url(#trunk)" stroke-width="28" fill="none" stroke-linecap="round"/>

  <!-- Palm leaves -->
  <ellipse cx="275" cy="180" rx="90" ry="30" fill="url(#leaf)" transform="rotate(-30 275 180)"/>
  <ellipse cx="275" cy="180" rx="85" ry="28" fill="url(#leaf)" transform="rotate(15 275 180)"/>
  <ellipse cx="275" cy="180" rx="80" ry="25" fill="url(#leaf)" transform="rotate(-60 275 180)"/>
  <ellipse cx="275" cy="180" rx="75" ry="25" fill="url(#leaf)" transform="rotate(50 275 180)"/>
  <ellipse cx="275" cy="180" rx="70" ry="22" fill="url(#leaf)" transform="rotate(-10 275 180)"/>

  <!-- Coconuts -->
  <circle cx="260" cy="215" r="15" fill="#8d6e63"/>
  <circle cx="285" cy="225" r="14" fill="#6d4c41"/>
  <circle cx="275" cy="205" r="12" fill="#795548"/>

  <!-- Wave decoration at bottom -->
  <path d="M 0 450 Q 80 420 160 450 Q 240 480 320 450 Q 400 420 512 450 L 512 512 L 0 512 Z"
        fill="rgba(255,255,255,0.3)"/>
</svg>
`

async function generateIcons() {
  for (const size of sizes) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(`public/icons/icon-${size}.png`)
    console.log(`Generated icon-${size}.png`)
  }
}

generateIcons().catch(console.error)
