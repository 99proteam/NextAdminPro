/**
 * Builds the static GitHub Pages demo into `out/`.
 *
 * `robots.ts`, `sitemap.ts` and `manifest.ts` are server metadata routes that
 * static export can't render alongside Cache Components, so this script sets
 * them aside during the build and writes equivalent static files instead.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const basePath = process.env.PAGES_BASE_PATH ?? "/NextAdminPro";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? `https://99proteam.github.io${basePath}`).replace(/\/$/, "");
const routes = ["manifest.ts", "robots.ts", "sitemap.ts"];
const stash = join(root, ".pages-stash");

mkdirSync(stash, { recursive: true });
const moved = routes.filter((f) => existsSync(join(root, "src/app", f)));
moved.forEach((f) => renameSync(join(root, "src/app", f), join(stash, f)));

try {
  execSync("next build", {
    stdio: "inherit",
    env: { ...process.env, GITHUB_PAGES: "true", PAGES_BASE_PATH: basePath, NEXT_PUBLIC_SITE_URL: siteUrl },
  });
} finally {
  moved.forEach((f) => renameSync(join(stash, f), join(root, "src/app", f)));
}

const out = join(root, "out");

// Every exported top-level page (out/<route>/index.html), excluding record detail pages.
function collect(dir, prefix = "/") {
  const found = existsSync(join(dir, "index.html")) ? [prefix] : [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith("_") || name === "404" || /^(cus|ord|inv)_/.test(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) found.push(...collect(full, `${prefix}${name}/`));
  }
  return found;
}
const urls = collect(out).filter((u) => !u.startsWith("/screenshots") && !u.startsWith("/badges"));
const lastmod = new Date().toISOString().slice(0, 10);

writeFileSync(
  join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${siteUrl}${u}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${u === "/" ? "1.0" : "0.7"}</priority></url>`)
    .join("\n")}\n</urlset>\n`,
);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
writeFileSync(
  join(out, "manifest.webmanifest"),
  JSON.stringify(
    { name: "NextAdminPro", short_name: "NextAdminPro", start_url: `${basePath}/dashboard/`, display: "standalone", background_color: "#f9f9f7", theme_color: "#2a78d6", icons: [{ src: `${basePath}/favicon.ico`, sizes: "any", type: "image/x-icon" }] },
    null,
    2,
  ),
);
// Tell GitHub Pages not to run Jekyll (which would hide the `_next` folder).
writeFileSync(join(out, ".nojekyll"), "");
console.log(`\n✓ Static demo written to out/ (base path ${basePath})`);
