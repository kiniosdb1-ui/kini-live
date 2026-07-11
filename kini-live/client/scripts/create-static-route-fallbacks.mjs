import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const distDirectory = path.resolve("dist");
const indexFile = path.join(distDirectory, "index.html");
const routes = ["admin", "services", "about", "contact", "faqs"];

await Promise.all(
  routes.map(async (route) => {
    const routeDirectory = path.join(distDirectory, route);
    await mkdir(routeDirectory, { recursive: true });
    await copyFile(indexFile, path.join(routeDirectory, "index.html"));
  }),
);

console.info(`Created static route fallbacks for ${routes.map((route) => `/${route}`).join(", ")}`);
