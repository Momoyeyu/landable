import { readFile, writeFile, rename } from "node:fs/promises";
import { refreshContributions } from "../web/contributions.mjs";

const file = new URL("../web/data/contributions.json", import.meta.url);
const seed = JSON.parse(await readFile(file, "utf8"));
const result = await refreshContributions(seed.projects, (url, options) => fetch(url, {
  ...options,
  headers: { ...options.headers, ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) },
}));
if (!result.complete) throw new Error("Could not refresh all contribution data; preserving the deployed snapshot");
const temporary = new URL(`${file.href}.tmp`);
await writeFile(temporary, JSON.stringify({ fetchedAt: new Date().toISOString(), projects: result.projects }, null, 2) + "\n");
await rename(temporary, file);
console.log(`Updated ${result.projects.length} contribution projects`);
