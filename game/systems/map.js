import { playerSymbol, resetColor, terrainColors, getTileKey } from "../utils/colors.js";
import { MAP_SIZE, TILE_SIZE } from "../utils/constants.js";
import { getRegion } from "../utils/map_utils.js";
import { getBiome, getHeight } from "../utils/random.js";


const worldLoot = {};
const mapTiles = {}; // key = "x,y", value = tipo terreno


export function showMap(player, wss) {

    const mapSize = MAP_SIZE; // mappa 20x20 intorno al player
    const half = Math.floor(mapSize / 2);

    const tiles = []; // questa volta inviamo OGGETTI, non testo

    for (let y = player.y - half; y <= player.y + half; y++) {
        const row = [];

        for (let x = player.x - half; x <= player.x + half; x++) {

            const biome = getBiome(x, y);
            const height = getHeight(x, y);
            const region = getRegion(x,y)

            row.push({
                x,
                y,
                biome,
                height,
                region,
                isPlayer: (x === player.x && y === player.y),
                isClaimed: Boolean(region.name)
            });
        }

        tiles.push(row);
    }

    // Trasmettiamo la mappa strutturata
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(
                JSON.stringify({
                    type: "map",
                    tiles,
                    center: { x: player.x, y: player.y },
                    tileSize: TILE_SIZE,      // px lato cella (frontend lo può ignorare)
                    regionSize: 6       // utile per evidenziare regioni
                })
            );
        }
    });
}



export {
    mapTiles,
    worldLoot
}