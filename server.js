// server.js
import { WebSocketServer } from "ws";
import { playerSymbol, resetColor, terrainColors, getTileKey } from "./game/utils/colors.js";
import Player from "./game/systems/Entities/Player.js";
import { showMap, worldLoot } from "./game/systems/map.js";
import { getTileInfo, movePlayer } from "./game/systems/movement.js";
import { loot, pickup } from "./game/systems/loot.js";
import { claimRegion } from "./game/systems/claim.js";

export const wss = new WebSocketServer({ port: 8080 });

console.log("Game server running on ws://localhost:8080");

const players = {};


wss.on("connection", ws => {
    const id = Date.now().toString();
    const player = new Player(id, 'Cepes', 'CepesLand');
    players[id] = player;

    const tile = getTileInfo(player.x, player.y);
    player.biome = tile.biome;

    ws.send(JSON.stringify({
        type: "welcome",
        playerId: id,
        player: player,
        tile: ''
    }));

    showMap(player, wss)

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


        if(data === 'claim') {
            console.log('claim');
            claimRegion(player)
            showMap(player, wss)
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
