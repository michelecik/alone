import { createNoise2D } from 'simplex-noise';
import { MAX_MAP_SIZE } from './constants.js';


export function initPlayerPosition() {
    const x = getRandomInt(-MAX_MAP_SIZE, MAX_MAP_SIZE);
    const y = getRandomInt(-MAX_MAP_SIZE, MAX_MAP_SIZE);

    const biome = getBiome(x, y);

    if (biome == 'deepWaters' || biome == 'lake') {
       return initPlayerPosition()
    } else {
        return [x, y];
    }

}


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


export function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}