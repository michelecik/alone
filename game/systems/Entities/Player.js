import { MAX_MAP_SIZE } from "../../utils/constants.js";
import { getRegion } from "../../utils/map_utils.js";
import { getBiome, getRandomInt, initPlayerPosition } from "../../utils/random.js";

// Player.js
export default class Player {
    constructor(id, name = "Player", empire = "Player Empire") {
        this.id = id;
        this.name = name;
        this.empire = empire;
        [this.x, this.y] = initPlayerPosition()

        this.hp = 100;
        this.stamina = 100;

        this.inventory = [];
        this.currentEnemy = null; // pronto per il combat
        this.biome = getBiome(this.x, this.y)
        this.region = getRegion(this.x, this.y)
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.stamina = Math.max(this.stamina - 1, 0);
    }

    addItem(item) {
        this.inventory.push(item);
    }

    damage(amount) {
        this.hp = Math.max(this.hp - amount, 0);
    }

}
