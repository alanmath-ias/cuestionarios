
import { algebraMapNodes } from "../client/src/data/algebra-map-data";

console.log("Successfully imported algebraMapNodes.");
console.log(`Node count: ${algebraMapNodes.length}`);
algebraMapNodes.forEach(n => {
    if (!n.id || !n.label) console.error("Invalid node found:", n);
});
console.log("Validation complete.");
