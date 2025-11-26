import { regions } from "../systems/claim.js";
import { getTileKey } from "./colors.js";
import { REGION_SIZE } from "./constants.js";

export function getRegion(x, y) {
    const regionSize = REGION_SIZE;
    
    const sectorX = Math.floor(x / regionSize);
    const sectorY = Math.floor(y/ regionSize)
    
    const key = getTileKey(sectorX, sectorY)
    const region = regions[key] || key

    return region;
}