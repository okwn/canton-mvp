import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Canton MVP",
  description: "Production-grade Canton Network MVP starter kit",
  srcDir: "docs",
  themeConfig: {
    nav: [{ text: "Guide", link: "/" }],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/" },
          { text: "Dev Setup", link: "/dev-setup" },
          { text: "Repository Map", link: "/repository-map" },
        ],
      },
    ],
  },
});
