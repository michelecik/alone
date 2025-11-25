import { getTileKey } from "../utils/colors.js";
import { worldLoot } from "./map.js";

export function loot(player, ws) {
    const key = getTileKey(player.x, player.y);
    const tileLoot = worldLoot[key] || [];

    console.log(key);

    if (tileLoot.length === 0) {
        ws.send(JSON.stringify({ type: "loot", message: "Nothing here." }));
    } else {
        ws.send(JSON.stringify({
            type: "loot",
            message: `Items on this tile:\n` + tileLoot.map((i, idx) => ` - ${i.name} (id: ${idx})`).join("\n")
        }));
    }
}


export function pickup(player, data, ws) {
    const id = parseInt(data.split(" ")[1]);
    const key = getTileKey(player.x, player.y);
    const tileLoot = worldLoot[key] || [];

    if (!tileLoot[id]) {
        ws.send(JSON.stringify({
            type: "event",
            message: `No item with id ${id} here.`
        }));
    } else {
        const item = tileLoot.splice(id, 1)[0];
        player.inventory.push({ name: item.name, qty: 1 });

        ws.send(JSON.stringify({
            type: "event",
            message: `You picked up ${item.name}.`
        }));

        ws.send(JSON.stringify({
            type: "status",
            player,
        }))

        // Ripulisci tile se vuota
        if (tileLoot.length === 0) delete worldLoot[key];
    }
}