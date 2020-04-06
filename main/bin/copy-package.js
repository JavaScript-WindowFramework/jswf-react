const fs = require("fs");
const src = require("../package.json");
const dist = { ...src, main: "index.js" };
fs.writeFileSync("dist/package.json", JSON.stringify(dist,null,'  '));
