/**
 * Canvas Image Generation Service
 * Generates vector-style images programmatically using TypeScript
 */

import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CanvasImageResult {
  imagePath: string;
}

// Color palettes for different styles
const PALETTES = {
  sunset: ['#FF6B6B', '#FEC89A', '#FFD93D', '#6BCB77', '#FF8E72'],
  ocean: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#023E8A'],
  purple: ['#7B2CBF', '#9D4EDD', '#C77DFF', '#E0AAFF', '#5A189A'],
  forest: ['#2D6A4F', '#40916C', '#52B788', '#95D5B2', '#1B4332'],
  fire: ['#D00000', '#E85D04', '#FAA307', '#FFBA08', '#9D0208'],
  neon: ['#FF006E', '#8338EC', '#3A86FF', '#06D6A0', '#FB5607'],
};

type PaletteKey = keyof typeof PALETTES;

// Abstract background styles
type BackgroundStyle = 'geometric' | 'waves' | 'blobs' | 'particles' | 'mesh';
const BACKGROUND_STYLES: BackgroundStyle[] = ['geometric', 'waves', 'blobs', 'particles', 'mesh'];

/**
 * Generate a stylized social media image with text
 */
export async function generateCanvasImage(
  message: string,
  style: PaletteKey = 'neon'
): Promise<CanvasImageResult> {
  const width = 1200;
  const height = 1200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const palette = PALETTES[style] || PALETTES.neon;

  // Randomly select background style
  const bgStyle = BACKGROUND_STYLES[Math.floor(Math.random() * BACKGROUND_STYLES.length)];

  // Draw gradient background
  drawGradientBackground(ctx, width, height, palette);

  // Draw abstract background based on random style
  drawAbstractBackground(ctx, width, height, palette, bgStyle);

  // Draw text
  drawStyledText(ctx, message, width, height, palette);

  // Draw border/frame
  drawFrame(ctx, width, height, palette);

  // Save to file
  const tempDir = os.tmpdir();
  const imagePath = path.join(tempDir, `canvas-image-${Date.now()}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(imagePath, buffer);

  return { imagePath };
}

/**
 * Draw gradient background
 */
function drawGradientBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: string[]
): void {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, palette[0]);
  gradient.addColorStop(0.5, palette[1]);
  gradient.addColorStop(1, palette[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw abstract background based on style
 */
function drawAbstractBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: string[],
  style: BackgroundStyle
): void {
  switch (style) {
    case 'geometric':
      drawGeometricBackground(ctx, width, height, palette);
      break;
    case 'waves':
      drawWavesBackground(ctx, width, height, palette);
      break;
    case 'blobs':
      drawBlobsBackground(ctx, width, height, palette);
      break;
    case 'particles':
      drawParticlesBackground(ctx, width, height, palette);
      break;
    case 'mesh':
      drawMeshBackground(ctx, width, height, palette);
      break;
  }
}

/**
 * Style 1: Geometric shapes (triangles, circles, squares)
 */
function drawGeometricBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: string[]
): void {
  ctx.globalAlpha = 0.2;

  // Draw triangles
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 80 + Math.random() * 200;

    ctx.beginPath();
    ctx.moveTo(x, y - size / 2);
    ctx.lineTo(x - size / 2, y + size / 2);
    ctx.lineTo(x + size / 2, y + size / 2);
    ctx.closePath();
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
  }

  // Draw circles
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = 40 + Math.random() * 150;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = palette[(i + 2) % palette.length];
    ctx.fill();
  }

  // Draw squares (rotated)
  for (let i = 0; i < 6; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 60 + Math.random() * 120;
    const rotation = Math.random() * Math.PI / 4;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = palette[(i + 1) % palette.length];
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
}

/**
 * Style 2: Wave patterns
 */
function drawWavesBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: string[]
): void {
  ctx.globalAlpha = 0.25;

  const waveCount = 6;
  const waveHeight = height / waveCount;

  for (let w = 0; w < waveCount; w++) {
    ctx.beginPath();
    ctx.moveTo(0, height);

    const baseY = height - (w * waveHeight);
    const amplitude = 40 + Math.random() * 60;
    const frequency = 0.005 + Math.random() * 0.01;
    const phase = Math.random() * Math.PI * 2;

    for (let x = 0; x <= width; x += 5) {
      const y = baseY + Math.sin(x * frequency + phase) * amplitude;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = palette[w % palette.length];
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

/**
 * Style 3: Organic blob shapes
 */
function drawBlobsBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: string[]
): void {
  ctx.globalAlpha = 0.2;

  for (let b = 0; b < 8; b++) {
    const centerX = Math.random() * width;
    const centerY = Math.random() * height;
    const baseRadius = 100 + Math.random() * 200;
    const points = 8 + Math.floor(Math.random() * 6);

    ctx.beginPath();

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radiusVariation = baseRadius * (0.7 + Math.random() * 0.6);
      const x = centerX + Math.cos(angle) * radiusVariation;
      const y = centerY + Math.sin(angle) * radiusVariation;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevAngle = ((i - 1) / points) * Math.PI * 2;
        const cpRadius = baseRadius * (0.8 + Math.random() * 0.4);
        const cpAngle = (prevAngle + angle) / 2;
        const cpX = centerX + Math.cos(cpAngle) * cpRadius * 1.2;
        const cpY = centerY + Math.sin(cpAngle) * cpRadius * 1.2;
        ctx.quadraticCurveTo(cpX, cpY, x, y);
      }
    }

    ctx.closePath();
    ctx.fillStyle = palette[b % palette.length];
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

/**
 * Style 4: Particle/dot pattern
 */
function drawParticlesBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: string[]
): void {
  // Draw large background circles
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = 150 + Math.random() * 300;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, palette[i % palette.length]);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw particles
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = 2 + Math.random() * 8;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
  }

  // Draw connecting lines between some particles
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 30; i++) {
    points.push({ x: Math.random() * width, y: Math.random() * height });
  }

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dist = Math.hypot(points[j].x - points[i].x, points[j].y - points[i].y);
      if (dist < 200) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
}

/**
 * Style 5: Grid/mesh pattern
 */
function drawMeshBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: string[]
): void {
  const cellSize = 80;
  const cols = Math.ceil(width / cellSize) + 1;
  const rows = Math.ceil(height / cellSize) + 1;

  // Create distorted grid points
  const points: { x: number; y: number }[][] = [];
  for (let row = 0; row < rows; row++) {
    points[row] = [];
    for (let col = 0; col < cols; col++) {
      points[row][col] = {
        x: col * cellSize + (Math.random() - 0.5) * 40,
        y: row * cellSize + (Math.random() - 0.5) * 40,
      };
    }
  }

  // Draw filled cells
  ctx.globalAlpha = 0.15;
  for (let row = 0; row < rows - 1; row++) {
    for (let col = 0; col < cols - 1; col++) {
      if (Math.random() > 0.3) {
        ctx.beginPath();
        ctx.moveTo(points[row][col].x, points[row][col].y);
        ctx.lineTo(points[row][col + 1].x, points[row][col + 1].y);
        ctx.lineTo(points[row + 1][col + 1].x, points[row + 1][col + 1].y);
        ctx.lineTo(points[row + 1][col].x, points[row + 1][col].y);
        ctx.closePath();
        ctx.fillStyle = palette[(row + col) % palette.length];
        ctx.fill();
      }
    }
  }

  // Draw grid lines
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols - 1; col++) {
      ctx.beginPath();
      ctx.moveTo(points[row][col].x, points[row][col].y);
      ctx.lineTo(points[row][col + 1].x, points[row][col + 1].y);
      ctx.stroke();
    }
  }

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows - 1; row++) {
      ctx.beginPath();
      ctx.moveTo(points[row][col].x, points[row][col].y);
      ctx.lineTo(points[row + 1][col].x, points[row + 1][col].y);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
}

/**
 * Draw styled text with shadow and effects
 */
function drawStyledText(
  ctx: CanvasRenderingContext2D,
  message: string,
  width: number,
  height: number,
  palette: string[]
): void {
  // Word wrap the text
  const maxWidth = width - 160;
  const words = message.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  // Calculate font size based on message length
  let fontSize = 72;
  if (message.length > 100) fontSize = 52;
  else if (message.length > 50) fontSize = 60;

  ctx.font = `bold ${fontSize}px Arial, sans-serif`;

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // Calculate total height of text block
  const lineHeight = fontSize * 1.3;
  const totalHeight = lines.length * lineHeight;
  const startY = (height - totalHeight) / 2 + fontSize;

  // Draw text shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  // Draw each line
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';

  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;
    ctx.fillText(lines[i], width / 2, y);
  }

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/**
 * Draw decorative frame/border
 */
function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: string[]
): void {
  const borderWidth = 20;

  // Draw corner accents
  ctx.fillStyle = palette[3] || palette[0];
  ctx.globalAlpha = 0.8;

  // Top-left corner
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(100, 0);
  ctx.lineTo(0, 100);
  ctx.closePath();
  ctx.fill();

  // Top-right corner
  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.lineTo(width - 100, 0);
  ctx.lineTo(width, 100);
  ctx.closePath();
  ctx.fill();

  // Bottom-left corner
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(100, height);
  ctx.lineTo(0, height - 100);
  ctx.closePath();
  ctx.fill();

  // Bottom-right corner
  ctx.beginPath();
  ctx.moveTo(width, height);
  ctx.lineTo(width - 100, height);
  ctx.lineTo(width, height - 100);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;

  // Inner border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, width - 80, height - 80);
}

/**
 * Get available style palettes
 */
export function getAvailableStyles(): string[] {
  return Object.keys(PALETTES);
}
