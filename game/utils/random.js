import { createNoise2D } from 'simplex-noise';

const noise = new createNoise2D();

export function getHeight(x, y) {
    const scale = 0.02;
    const n = noise(x * scale, y * scale);
    
    return (n + 1) / 2; // normalize to 0..1
}

export function getBiome(x, y) {
    const h = getHeight(x, y);

    if (h < 0.1) return "deepWaters";
    if (h < 0.2) return "lake";
    if (h < 0.3) return "beach";
    if (h < 0.4) return "plain";
    if (h < 0.75) return "hills";
    if (h < 0.95) return "mountain";
    return "peak";
}
