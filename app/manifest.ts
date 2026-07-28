import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rebec's Cookbook",
    short_name: "Rebec's Cookbook",
    description: "A collection of family recipes.",
    start_url: "/",
    display: "standalone",
    background_color: "#7B4B32",
    theme_color: "#7B4B32",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
