import { createNoise2D } from 'simplex-noise';

const noise = new createNoise2D();

export function getHeight(x, y) {
    const scale = 0.05;
    const n = noise(x * scale, y * scale);
    
    return (n + 1) / 2; // normalize to 0..1
}

export function getBiome(x, y) {
    const h = getHeight(x, y);

    if (h < 0.25) return "ocean";
    if (h < 0.35) return "lake";
    if (h < 0.45) return "plain";
    if (h < 0.60) return "hill";
    if (h < 0.80) return "mountain";
    return "peak";
}
