import type { MetadataRoute } from "next";
import { flatNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/pricing", "/docs", "/changelog", "/login", "/register", ...flatNavigation.map((n) => n.href)];
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${siteConfig.url}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : route === "/dashboard" ? 0.9 : 0.6,
  }));
}
