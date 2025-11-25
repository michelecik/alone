// movement.js
import { generateTile, worldLoot } from "./map.js";
import { getTileKey } from "../utils/colors.js";
import { LOOT_CHANCE, LOOT_ITEMS, WOUND_CHANCE } from "../utils/constants.js";

export function movePlayer(player, direction, ws) {
    const dirs = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0]
    };

    if (!dirs[direction]) return;

    const [dx, dy] = dirs[direction];
    player.move(dx, dy);

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
        tile: generateTile(player.x, player.y),
        event
    }));

    return
}
