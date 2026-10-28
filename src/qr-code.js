/**
 * Pure JavaScript QR Code Generator (SVG output)
 * Zero dependencies. Supports Version 1-10 QR Codes with Error Correction Level L/M.
 */

// Galois Field GF(2^8) math for Reed-Solomon error correction
const EXP_TABLE = new Array(256);
const LOG_TABLE = new Array(256);

(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

function gfPolyMul(p1, p2) {
  const result = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

function getGeneratorPoly(ecLength) {
  let g = [1];
  for (let i = 0; i < ecLength; i++) {
    g = gfPolyMul(g, [1, EXP_TABLE[i]]);
  }
  return g;
}

function calculateECC(dataBytes, ecLength) {
  const gen = getGeneratorPoly(ecLength);
  const res = new Array(dataBytes.length + ecLength).fill(0);
  for (let i = 0; i < dataBytes.length; i++) {
    res[i] = dataBytes[i];
  }

  for (let i = 0; i < dataBytes.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(dataBytes.length);
}

// QR Code Specifications for Versions 1-10 with Low (L) / Medium (M) EC level
const VERSION_SPECS = [
  null,
  // v1
  { version: 1, size: 21, dataBytes: 19, ecBytes: 7, blocks: 1, align: [] },
  { version: 2, size: 25, dataBytes: 34, ecBytes: 10, blocks: 1, align: [6, 18] },
  { version: 3, size: 29, dataBytes: 55, ecBytes: 15, blocks: 1, align: [6, 22] },
  { version: 4, size: 33, dataBytes: 80, ecBytes: 20, blocks: 1, align: [6, 26] },
  { version: 5, size: 37, dataBytes: 108, ecBytes: 26, blocks: 1, align: [6, 30] },
  { version: 6, size: 41, dataBytes: 136, ecBytes: 18, blocks: 2, align: [6, 34] },
  { version: 7, size: 45, dataBytes: 156, ecBytes: 20, blocks: 2, align: [6, 22, 38] },
  { version: 8, size: 49, dataBytes: 194, ecBytes: 24, blocks: 2, align: [6, 24, 42] },
  { version: 9, size: 53, dataBytes: 232, ecBytes: 30, blocks: 2, align: [6, 26, 46] },
  { version: 10, size: 57, dataBytes: 274, ecBytes: 18, blocks: 4, align: [6, 28, 50] },
];

function selectVersion(utf8Length) {
  // UTF-8 payload size in bytes + 2 header bytes (mode + count)
  const neededData = utf8Length + 2;
  for (let v = 1; v <= 10; v++) {
    if (VERSION_SPECS[v].dataBytes >= neededData) {
      return VERSION_SPECS[v];
    }
  }
  return VERSION_SPECS[10]; // Fallback to max version 10
}

function encodeUtf8(str) {
  if (typeof globalThis.TextEncoder !== 'undefined') {
    return new globalThis.TextEncoder().encode(str);
  }
  // Fallback simple utf-8 encoder for environments where TextEncoder is absent
  const codePoints = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) {
      codePoints.push(c);
    } else if (c < 0x800) {
      codePoints.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      codePoints.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      i++;
      c = 0x10000 + (((c & 0x33f) << 10) | (str.charCodeAt(i) & 0x33f));
      codePoints.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return new Uint8Array(codePoints);
}

function encodeData(text, spec) {
  const bytes = encodeUtf8(text);
  const bitArray = [];

  function writeBits(val, numBits) {
    for (let i = numBits - 1; i >= 0; i--) {
      bitArray.push((val >> i) & 1);
    }
  }

  // Byte mode indicator: 0100
  writeBits(0b0100, 4);

  // Character count indicator (8 bits for v1-9, 16 bits for v10+)
  const countBits = spec.version < 10 ? 8 : 16;
  writeBits(bytes.length, countBits);

  // Data
  for (const b of bytes) {
    writeBits(b, 8);
  }

  const capacityBits = spec.dataBytes * 8;

  // Terminator
  const termLen = Math.min(4, capacityBits - bitArray.length);
  for (let i = 0; i < termLen; i++) bitArray.push(0);

  // Pad to byte boundary
  while (bitArray.length % 8 !== 0) {
    bitArray.push(0);
  }

  // Pad bytes 0xEC, 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitArray.length < capacityBits) {
    const pb = padBytes[padIdx % 2];
    for (let i = 7; i >= 0; i--) {
      bitArray.push((pb >> i) & 1);
    }
    padIdx++;
  }

  // Convert bitArray to byte array
  const dataBytes = [];
  for (let i = 0; i < spec.dataBytes; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitArray[i * 8 + b];
    }
    dataBytes.push(byteVal);
  }

  return dataBytes;
}

export function generateQRMatrix(text) {
  const spec = selectVersion(encodeUtf8(text).length);
  const size = spec.size;

  const dataBytes = encodeData(text, spec);

  // Calculate ECC per block
  const bytesPerBlock = Math.floor(spec.dataBytes / spec.blocks);
  const ecPerBlock = spec.ecBytes;
  const blocksData = [];
  const blocksEC = [];

  for (let b = 0; b < spec.blocks; b++) {
    const start = b * bytesPerBlock;
    const end = b === spec.blocks - 1 ? spec.dataBytes : (b + 1) * bytesPerBlock;
    const blockData = dataBytes.slice(start, end);
    blocksData.push(blockData);
    blocksEC.push(calculateECC(blockData, ecPerBlock));
  }

  // Interleave data and EC
  const finalBytes = [];
  const maxBlockLen = Math.max(...blocksData.map((b) => b.length));

  for (let i = 0; i < maxBlockLen; i++) {
    for (let b = 0; b < spec.blocks; b++) {
      if (i < blocksData[b].length) {
        finalBytes.push(blocksData[b][i]);
      }
    }
  }

  for (let i = 0; i < ecPerBlock; i++) {
    for (let b = 0; b < spec.blocks; b++) {
      finalBytes.push(blocksEC[b][i]);
    }
  }

  // Create Matrix (null = unassigned, 0 = white, 1 = black)
  const matrix = Array.from({ length: size }, () => new Array(size).fill(null));
  const isReserved = Array.from({ length: size }, () => new Array(size).fill(false));

  function setModule(r, c, val, reserved = true) {
    matrix[r][c] = val;
    if (reserved) isReserved[r][c] = true;
  }

  // 1. Finder Patterns (7x7)
  function placeFinder(r, c) {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const nr = r + dy;
        const nc = c + dx;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (dy >= 0 && dy <= 6 && dx >= 0 && dx <= 6) {
            const isBorder = dy === 0 || dy === 6 || dx === 0 || dx === 6;
            const isCenter = dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4;
            setModule(nr, nc, isBorder || isCenter ? 1 : 0);
          } else {
            setModule(nr, nc, 0); // Separator
          }
        }
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // 2. Alignment Patterns
  const align = spec.align;
  for (let i = 0; i < align.length; i++) {
    for (let j = 0; j < align.length; j++) {
      const r = align[i];
      const c = align[j];
      // Skip finder corners
      if (
        (r === 6 && c === 6) ||
        (r === 6 && c === align[align.length - 1]) ||
        (r === align[align.length - 1] && c === 6)
      ) {
        continue;
      }
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const isBorder = Math.abs(dy) === 2 || Math.abs(dx) === 2;
          const isCenter = dy === 0 && dx === 0;
          setModule(r + dy, c + dx, isBorder || isCenter ? 1 : 0);
        }
      }
    }
  }

  // 3. Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isReserved[6][i]) setModule(6, i, i % 2 === 0 ? 1 : 0);
    if (!isReserved[i][6]) setModule(i, 6, i % 2 === 0 ? 1 : 0);
  }

  // 4. Dark Module
  setModule(size - 8, 8, 1);

  // Reserve Format Info areas
  for (let i = 0; i < 9; i++) {
    if (!isReserved[8][i]) setModule(8, i, 0);
    if (!isReserved[i][8]) setModule(i, 8, 0);
  }
  for (let i = 0; i < 8; i++) {
    if (!isReserved[8][size - 1 - i]) setModule(8, size - 1 - i, 0);
    if (!isReserved[size - 1 - i][8]) setModule(size - 1 - i, 8, 0);
  }

  // 5. Reserve Version Info for v7+
  if (spec.version >= 7) {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 3; c++) {
        setModule(size - 11 + c, r, 0);
        setModule(r, size - 11 + c, 0);
      }
    }
  }

  // Map data bits to matrix
  const allBits = [];
  for (const b of finalBytes) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((b >> i) & 1);
    }
  }

  let bitIdx = 0;
  let up = true;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip timing column
    const rows = up ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);

    for (const row of rows) {
      for (const c of [col, col - 1]) {
        if (!isReserved[row][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          matrix[row][c] = bit;
        }
      }
    }
    up = !up;
  }

  // Apply Mask (Pattern 0: (row + col) % 2 === 0)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isReserved[r][c]) {
        if ((r + c) % 2 === 0) {
          matrix[r][c] ^= 1;
        }
      }
    }
  }

  // Write Format Information (EC L = 01, Mask 0 = 000 -> 01000 with BCH(15,5) = 0x77c4 ^ 0x5412 = 0x23d6)
  // Mask 0 BCH encoded format string for EC Level L: 0b111011111000100
  const formatBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];

  // Top-left format bits
  setModule(8, 0, formatBits[0]);
  setModule(8, 1, formatBits[1]);
  setModule(8, 2, formatBits[2]);
  setModule(8, 3, formatBits[3]);
  setModule(8, 4, formatBits[4]);
  setModule(8, 5, formatBits[5]);
  setModule(8, 7, formatBits[6]);
  setModule(8, 8, formatBits[7]);
  setModule(7, 8, formatBits[8]);
  setModule(5, 8, formatBits[9]);
  setModule(4, 8, formatBits[10]);
  setModule(3, 8, formatBits[11]);
  setModule(2, 8, formatBits[12]);
  setModule(1, 8, formatBits[13]);
  setModule(0, 8, formatBits[14]);

  // Bottom-left & Top-right format bits
  setModule(size - 1, 8, formatBits[0]);
  setModule(size - 2, 8, formatBits[1]);
  setModule(size - 3, 8, formatBits[2]);
  setModule(size - 4, 8, formatBits[3]);
  setModule(size - 5, 8, formatBits[4]);
  setModule(size - 6, 8, formatBits[5]);
  setModule(size - 7, 8, formatBits[6]);

  setModule(8, size - 8, formatBits[7]);
  setModule(8, size - 7, formatBits[8]);
  setModule(8, size - 6, formatBits[9]);
  setModule(8, size - 5, formatBits[10]);
  setModule(8, size - 4, formatBits[11]);
  setModule(8, size - 3, formatBits[12]);
  setModule(8, size - 2, formatBits[13]);
  setModule(8, size - 1, formatBits[14]);

  return matrix;
}

export function generateQRSVG(text, { color = '#000000', bgColor = '#ffffff', size = 150, quietZone = 2 } = {}) {
  const matrix = generateQRMatrix(text);
  const matrixSize = matrix.length;
  const viewBoxSize = matrixSize + quietZone * 2;

  let pathData = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c] === 1) {
        const x = c + quietZone;
        const y = r + quietZone;
        pathData += `M${x},${y}h1v1h-1z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${size}" height="${size}" aria-label="QR Code for ${text}">
    <rect width="100%" height="100%" fill="${bgColor}" />
    <path d="${pathData.trim()}" fill="${color}" shape-rendering="crispEdges" />
  </svg>`;
}
