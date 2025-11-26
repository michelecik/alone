import { wss } from "../../server.js";

export function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(
                JSON.stringify(message)
            );
        }
    });
}