import { playerSymbol, resetColor, terrainColors, getTileKey } from "../utils/colors.js";


const worldLoot = {};

// generatore di mappa procedurale base
// Oggetto globale per memorizzare le tile già generate
const mapTiles = {}; // key = "x,y", value = tipo terreno

const terrainTypes = ["plain", "forest", "mountain", "ruins", "lake", "swamp", "desert", "hills"];
const terrainWeights = {
    plain: 35,
    forest: 20,
    mountain: 15,
    ruins: 10,
    lake: 5,
    swamp: 5,
    desert: 5,
    hills: 5
};

// Generatore di tile con blocchi minimi 2x2
function generateTile(x, y) {
    const key = `${x},${y}`;
    if (mapTiles[key]) return mapTiles[key]; // già generata

    // Controlliamo tile a sinistra e sopra
    const left = mapTiles[`${x - 1},${y}`];
    const top = mapTiles[`${x},${y - 1}`];

    let terrain = null;

    // Probabilità di continuare il terreno precedente (blocchi continui)
    if (left && Math.random() < 0.7) terrain = left;
    else if (top && Math.random() < 0.7) terrain = top;
    else {
        // Scegli in base alle probabilità generali
        let rnd = Math.random() * 100;
        let sum = 0;
        for (const t of terrainTypes) {
            sum += terrainWeights[t];
            if (rnd < sum) { terrain = t; break; }
        }
    }

    mapTiles[key] = terrain;
    return terrain;
}


export function showMap(player, wss) {

   /*  if (player.stamina <= 0) {
        ws.send(
            JSON.stringify({
                type: "event",
                message: "Not enough stamina to use map!"
            }));
        return;
    } */

    // costo della mappa
    player.stamina = Math.max(player.stamina - 5, 0);

    const mapSize = 20; // 5x5 intorno al giocatore
    let output = "";

    for (let y = player.y - Math.floor(mapSize / 2); y <= player.y + Math.floor(mapSize / 2); y++) {
        let row = "";
        for (let x = player.x - Math.floor(mapSize / 2); x <= player.x + Math.floor(mapSize / 2); x++) {
            if (x === player.x && y === player.y) {
                row += playerSymbol + " "; // il giocatore
            } else {
                let terrain = generateTile(x, y);
                let symbol = '◼' // terrain.charAt(0).toUpperCase();
                row += terrainColors[terrain] + symbol + resetColor + " ";
            }
        }
        output += row + "\n";
    }


    
    // invio al client
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(
                JSON.stringify(
                    {
                        type: "map",
                        map: output
                    }
                )
            );
        }
    })

    // invio legenda
    // let legend = Object.entries(terrainColors).map(([t, c]) => `${c}${t.charAt(0).toUpperCase()}${resetColor}=${t}`).join("  ");
    // ws.send(JSON.stringify({ type: "legend", legend }));
}


export {
    generateTile,
    worldLoot
}