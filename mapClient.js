import WebSocket from "ws";
import readline from "readline";
import { getTileKey } from "./game/utils/colors.js";

const ws = new WebSocket("ws://localhost:8080");

ws.on("message", msg => {
    const data = JSON.parse(msg);
    
    if (data.type === "map") {
        console.clear();
        console.log("\n📜 Map view:");
        console.log(data.map);
    }
});