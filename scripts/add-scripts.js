const fs = require("fs");

const pkgPath = "./package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

pkg.scripts = {
  ...pkg.scripts,
  build: "tsc",
  start: "node dist/index.js",
  dev: "ts-node src/index.ts",
};

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log("Scripts added.");
