import { useEffect, useRef } from "react";

export default function MapCanvas({ map }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!map) return;
        const { tiles, tileSize, regionSize } = map;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = tiles[0].length * tileSize;
        canvas.height = tiles.length * tileSize;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        tiles.forEach((row, y) => {
            row.forEach((cell, x) => {
                const px = x * tileSize;
                const py = y * tileSize;

                // --- Terrain color ---
                ctx.fillStyle = getTerrainColor(cell.biome);
                console.log(cell.biome);
                
                ctx.fillRect(px, py, tileSize, tileSize);

                if (cell.isPlayer) {
                    ctx.fillStyle = "black";
                    ctx.beginPath();
                    ctx.arc(px + tileSize / 2, py + tileSize / 2, tileSize / 4, 0, Math.PI * 2);
                    ctx.fill();
                }

                // --- FUTURE: Outpost icon ---
                /*
                if (cell.outpost) {
                    ctx.fillStyle = "white";
                    ctx.fillRect(px + 6, py + 6, tileSize - 12, tileSize - 12);
                    // oppure un'icona SVG disegnata in piccolo
                }
                */

                // --- FUTURE: Portal icon ---
                /*
                if (cell.portal) {
                    ctx.strokeStyle = "cyan";
                    ctx.beginPath();
                    ctx.arc(px + tileSize/2, py + tileSize/2, 8, 0, Math.PI * 2);
                    ctx.stroke();
                }
                */

                // --- FUTURE: Damage effect ---
                /*
                if (cell.damage > 0) {
                    ctx.fillStyle = `rgba(255,0,0,${cell.damage/100})`;
                    ctx.fillRect(px, py, tileSize, tileSize);
                }
                */

                // --- Region highlight every 6 tiles ---
                ctx.strokeStyle = "rgba(0,255,255,0.7)";
                ctx.lineWidth = 1;

                // verticali
                for (let x = 0; x <= tiles[0].length; x++) {
                    const globalX = tiles[0][x]?.x; // usa la x globale della cella
                    if (globalX % regionSize === 0) {
                        const px = x * tileSize; // posizione pixel della linea sulla canvas
                        ctx.beginPath();
                        ctx.moveTo(px, 0);
                        ctx.lineTo(px, tiles.length * tileSize);
                        ctx.stroke();
                    }
                }

                // orizzontali
                for (let y = 0; y <= tiles.length; y++) {
                    const globalY = tiles[y] ? tiles[y][0].y : 0; // y globale della cella
                    if (globalY % regionSize === 0) {
                        const py = y * tileSize; // posizione pixel della linea sulla canvas
                        ctx.beginPath();
                        ctx.moveTo(0, py);
                        ctx.lineTo(tiles[0].length * tileSize, py);
                        ctx.stroke();
                    }
                }

            });
        });
    }, [map]);

    return (
        <canvas
            ref={canvasRef}
            className="border border-gray-700 rounded-md"
        />
    );
}

// --- Utility: assign colors to biomes ---
function getTerrainColor(type) {

    switch (type) {
        case "plain": return '#b39c4d'
        case "forest": return "#607744";
        case "desert": return "#c8ab59";
        case "lake": return "#372772";
        case "mountain": return "#F4F3EE";
        case "ruins": return "#333333";
        case "swamp": return "#384D48"
        case "hills": return "#474B24"
        default: return "#fafafa";
    }
}