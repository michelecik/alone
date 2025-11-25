import WebSocket from "ws";
import readline from "readline";
import { getTileKey } from "./game/utils/colors.js";

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
    console.log("\n📜 MAP CLIENT");
});

ws.on("message", msg => {
    const data = JSON.parse(msg);

    console.log(data);
    
    if (data.type === "map") {
        console.clear();
        console.log("\n📜 Map view:");
        console.log(data.map);
    }
});