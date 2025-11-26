import { playerSymbol, resetColor, terrainColors, getTileKey } from "../utils/colors.js";
import { getBiome, getHeight } from "../utils/random.js";


const worldLoot = {};
const mapTiles = {}; // key = "x,y", value = tipo terreno


export function showMap(player, wss) {

    // Costo in stamina per usare la mappa
    player.stamina = Math.max(player.stamina - 5, 0);

    const mapSize = 6; // mappa 20x20 intorno al player
    const half = Math.floor(mapSize / 2);

    const tiles = []; // questa volta inviamo OGGETTI, non testo

    for (let y = player.y - half; y <= player.y + half; y++) {
        const row = [];

        for (let x = player.x - half; x <= player.x + half; x++) {

            const biome = getBiome(x, y);
            const height = getHeight(x, y);

            player.biome = biome

            row.push({
                x,
                y,
                biome,
                height,
                isPlayer: (x === player.x && y === player.y)
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
                    tileSize: 30,      // px lato cella (frontend lo può ignorare)
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