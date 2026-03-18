import baseConfig from "@canton-mvp/eslint-config/base.js";

export default [
  { ignores: [".vitepress/dist/**", "node_modules/**", ".vitepress/cache/**"] },
  ...baseConfig,
];
