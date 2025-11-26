// Player.js
export default class Player {
    constructor(id, name = "Player") {
        this.id = id;
        this.name = name;

        this.x = 546; // posizione iniziale di default
        this.y = 456;

        this.hp = 100;
        this.stamina = 100;

        this.inventory = [];
        this.currentEnemy = null; // pronto per il combat
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
