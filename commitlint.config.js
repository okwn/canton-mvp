/** @type {import("commitlint").UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 100],
    "scope-enum": [
      2,
      "always",
      [
        "web",
        "api",
        "admin",
        "docs",
        "canton-client",
        "validator-client",
        "scan-client",
        "wallet-adapter",
        "token-standard",
        "swap-engine",
        "shared-types",
        "observability",
        "test-utils",
        "party-identity",
        "daml-models",
        "deps",
        "ci",
      ],
    ],
  },
};
