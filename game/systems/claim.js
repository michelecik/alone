import { broadcast } from "../utils/broadcast.js";
import { getTileKey } from "../utils/colors.js"
import { getRegion } from "../utils/map_utils.js";

export const regions = {}


export function claimRegion(player) {
    const key = getRegion(player.x, player.y)

    regions[key] = { name: "test", player: player.id };

    broadcast({
        type: "event",
        message: "You claimed this region"
    });
    return
}