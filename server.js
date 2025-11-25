// server.js
import { WebSocketServer } from "ws";
import { playerSymbol, resetColor, terrainColors, getTileKey } from "./game/utils/colors.js";
import Player from "./game/systems/Entities/Player.js";
import { generateTile, showMap, worldLoot } from "./game/systems/map.js";
import { movePlayer } from "./game/systems/movement.js";
import { loot, pickup } from "./game/systems/loot.js";

const wss = new WebSocketServer({ port: 8080 });

console.log("Game server running on ws://localhost:8080");

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



const players = {};


wss.on("connection", ws => {
    const id = Date.now().toString();
    const player = new Player(id, 'Cepes');
    players[id] = player;

    ws.send(JSON.stringify({
        type: "welcome",
        playerId: id,
        player: player,
        tile: generateTile(player.x, player.y)
    }));

    ws.on("message", msg => {
        const data = msg.toString().trim();
        const player = players[id];

        if (!player) return;

        if (data.startsWith("move")) {

            const dir = data.split(' ')[1]

            movePlayer(player, dir, ws);
            showMap(player, wss);
            return
        }

        if (data === "loot") {
            loot(player, ws)
            return;
        }


        if (data === "inventory") {
            const inv = player.inventory;
            if (inv.length === 0) {
                ws.send(JSON.stringify({
                    type: "inventory",
                    message: "Inventory empty.",
                    inventory: inv,
                }));
            } else {
                ws.send(JSON.stringify({
                    type: "inventory",
                    inventory: inv,
                    message: inv.map(i => `${i.name} x${i.qty}`).join("\n")
                }));
            }
        }


        if (data.startsWith("pickup ")) {
            pickup(player, data, ws)
        }


        if (data === "pickup all") {
            const key = getTileKey(player.x, player.y);
            const tileLoot = worldLoot[key] || [];


            if (tileLoot.length === 0) {
                ws.send(JSON.stringify({ type: "event", message: "Nothing to pick up here." }));
            } else {
                tileLoot.forEach(item => {
                    player.inventory.push({ name: item.name, qty: 1 });
                });

                delete worldLoot[key];

                ws.send(JSON.stringify({
                    type: "event",
                    message: "You picked up everything on this tile."
                }));
            }
        }



        /*  if (data === "map") {
             showMap(player, ws)
         } */


        if (data === "scan") {
            const around = {};
            const dirs = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
            for (const k in dirs) {
                const [dx, dy] = dirs[k];
                around[k] = generateTile(player.x + dx, player.y + dy);
            }

            ws.send(JSON.stringify({ type: "scan", around }));
        }

        if (data === "status") {
            ws.send(JSON.stringify({
                type: "status",
                player,
            }));
        }
    });

    ws.on("close", () => {
        delete players[id];
    });
});
