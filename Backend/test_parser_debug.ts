
import { parseSearchQuery } from "./utils/searchParser.js";

const queries = [
    "tag:abcd",
    "\"Birthday\"",
    "tag:abcd"
];

queries.forEach(q => {
    try {
        console.log(`Parsing: ${q}`);
        const ast = parseSearchQuery(q);
        console.log("AST:", JSON.stringify(ast, null, 2));
    } catch (e) {
        console.error(`Error parsing ${q}:`, e);
    }
});
