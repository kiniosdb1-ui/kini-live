import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const distDirectory = path.resolve("dist");
const indexFile = path.join(distDirectory, "index.html");
const routes = ["admin", "services", "about", "contact", "faqs"];
const indexHtml = await readFile(indexFile, "utf8");

function htmlForRoute(route) {
  if (route !== "admin") return indexHtml;

  // SEO: ensure the generated static /admin fallback is noindexed before React boots.
  return indexHtml
    .replace(/<title>.*?<\/title>/, "<title>Secure Admin | KINi Outsourcing Services</title>")
    .replace(
      /<meta name="robots" content="[^"]*" \/>/,
      '<meta name="robots" content="noindex, nofollow, noarchive" />',
    )
    .replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      '<link rel="canonical" href="https://kinios.in/admin" />',
    );
}

await Promise.all(
  routes.map(async (route) => {
    const routeDirectory = path.join(distDirectory, route);
    await mkdir(routeDirectory, { recursive: true });
    if (route === "admin") await writeFile(path.join(routeDirectory, "index.html"), htmlForRoute(route));
    else await copyFile(indexFile, path.join(routeDirectory, "index.html"));
  }),
);

console.info(`Created static route fallbacks for ${routes.map((route) => `/${route}`).join(", ")}`);
