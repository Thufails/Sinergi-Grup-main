import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.resolve(projectRoot, "dist");

if (path.dirname(outputDirectory) !== projectRoot || path.basename(outputDirectory) !== "dist") {
    throw new Error("Refusing to write outside the expected dist directory.");
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const rootEntries = await readdir(projectRoot, { withFileTypes: true });
const rootPages = rootEntries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
    .map((entry) => entry.name);

for (const page of rootPages) {
    await cp(path.join(projectRoot, page), path.join(outputDirectory, page));
}

for (const assetDirectory of ["css", "js", "images"]) {
    await cp(path.join(projectRoot, assetDirectory), path.join(outputDirectory, assetDirectory), { recursive: true });
}

await cp(path.join(projectRoot, "admin"), path.join(outputDirectory, "admin"), { recursive: true });

const sourceArticles = path.join(projectRoot, "artikel");
const outputArticles = path.join(outputDirectory, "artikel");
await mkdir(outputArticles, { recursive: true });
const articleEntries = await readdir(sourceArticles, { withFileTypes: true });
const articlePages = articleEntries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"));

for (const article of articlePages) {
    await cp(path.join(sourceArticles, article.name), path.join(outputArticles, article.name));
}

await writeFile(
    path.join(outputDirectory, "_routes.json"),
    JSON.stringify({ version: 1, include: ["/admin", "/admin/*", "/api/auth/*", "/api/admin/*"], exclude: [] }, null, 2) + "\n",
);

console.log(`Packaged ${rootPages.length} site pages, ${articlePages.length} article pages, and a protected admin area for Cloudflare in dist/.`);
