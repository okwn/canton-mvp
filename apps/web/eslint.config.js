import reactConfig from "@canton-mvp/eslint-config/react";

export default [
  ...reactConfig,
  {
    files: ["next-env.d.ts"],
    rules: { "@typescript-eslint/triple-slash-reference": "off" },
  },
];
