import type { MetadataRoute } from "next";
import { flatNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/login", "/register", ...flatNavigation.map((n) => n.href)];
  return routes.map((route) => ({
    url: `${siteConfig.url}${route === "/" ? "" : route}`,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : route === "/dashboard" ? 0.9 : 0.6,
  }));
}
