// client.js
import WebSocket from "ws";
import readline from "readline";
import { getTileKey } from "./game/utils/colors.js";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
    console.log("Connected to game server.");
    prompt();
});

ws.on("message", msg => {
    const data = JSON.parse(msg);

    if (data.type === "welcome") {
        console.log("Benvenuto " + data.player.name + "!");
        console.log("Posizione iniziale:", getTileKey(data.player.x, data.player.y));
        console.log("Terreno:", data.tile);
    }

    if (data.type === "update") {
        console.log("\n📍 Nuova posizione:", getTileKey(data.player.x, data.player.y));
        console.log("Terreno:", data.tile);
    }

    if (data.type === "scan") {
        console.log("\n🔍 Terreni attorno:");
        console.table(data.around);
    }

 /*    if (data.type === "map") {
        console.log("\n📜 Map view:");
        console.log(data.map);
    } */

    if (data.type === "legend") {
        console.log("🗺 Legend:");
        console.log(data.legend);
    }

    if (data.type === "status") {
        console.log("\n📊 Stato giocatore:", data.player);
    }

    if(data.type === 'event') {
        console.log("\n📊 Event:", data.message);
    }

    if(data.type === 'loot') {
        console.log('Loot');
        console.log("Message: ", data.message)
    }

    if (data.type === "inventory") {
        console.log("\n🎒 Inventory:");
        if (data.inventory.length === 0) console.log("Empty");
        else data.inventory.forEach(i => console.log(`${i.name} x${i.qty}`));
    }


    prompt();
});

function prompt() {
    rl.question("> ", (command) => {
        ws.send(command);
    });
}
