// movement.js
import { worldLoot } from "./map.js";
import { getTileKey } from "../utils/colors.js";
import { LOOT_CHANCE, LOOT_ITEMS, WOUND_CHANCE } from "../utils/constants.js";
import { getBiome, getHeight } from "../utils/random.js";
import { getRegion } from "../utils/map_utils.js";

export function getTileInfo(x, y) {
    return {
        x,
        y,
        height: getHeight(x, y),
        biome: getBiome(x, y),
    };
}

export function movePlayer(player, direction, ws) {
    const mov = 1
    const dirs = {
        up: [0, -mov],
        down: [0, mov],
        left: [-mov, 0],
        right: [mov, 0]
    };

    if (!dirs[direction]) return;

    const [dx, dy] = dirs[direction];
    player.move(dx, dy);

    const tile = getTileInfo(player.x, player.y);
    
    player.biome = tile.biome;
    player.height = tile.height;
    player.currentRegion = getRegion(player.x, player.y);

    console.log(player.currentRegion);
    

    const key = getTileKey(player.x, player.y);
    const eventChance = Math.random();
    let event = null;

    // 🎒 loot
    if (eventChance < LOOT_CHANCE) { // 0.05

        const itemName = LOOT_ITEMS[Math.floor(Math.random() * LOOT_ITEMS.length)];

        if (!worldLoot[key]) {
            worldLoot[key] = [];
        }

        worldLoot[key].push({ name: itemName });


        ws.send(JSON.stringify({
            type: "event",
            message: `You found a ${itemName}! Type "loot" to inspect this tile.`
        }));
    }

    // 💥 ferita
    else if (eventChance < WOUND_CHANCE) {
        player.damage(5);
        event = "You slipped and hurt yourself!";
        ws.send(JSON.stringify({ type: "event", message: event }));
    }

    // invio aggiornamento al client
    ws.send(JSON.stringify({
        type: "update",
        player: player,
        tile: '',
        event
    }));

    return
}
