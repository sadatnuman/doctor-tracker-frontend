import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Doctor Tracker",
    short_name: "Doctor Tracker",
    description: "Book doctor appointments online across Bangladesh.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f8f9",
    theme_color: "#0e7c7b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  }
}
