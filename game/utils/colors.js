const terrainColors = {
  plain: "\x1b[37m",   // bianco
  forest: "\x1b[32m",  // verde
  mountain: "\x1b[90m",// grigio scuro
  ruins: "\x1b[33m",   // giallo
  ocean: "\x1b[34m", // blu scruro
  lake: "\x1b[32m",    // blu
  swamp: "\x1b[36m",   // ciano
  desert: "\x1b[93m",  // giallo chiaro
  hills: "\x1b[35m"    // magenta
};

const resetColor = "\x1b[0m";

const playerSymbol = "☒";


export function getTileKey(x, y) {
  return `${x},${y}`;
}


export {
    terrainColors, 
    resetColor,
    playerSymbol
}