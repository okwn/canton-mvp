/**
 * Export OpenAPI spec to JSON file.
 */

import { buildApp } from "../app.js";
import { writeFileSync } from "node:fs";
import { loadEnv } from "../config/env.js";

async function main(): Promise<void> {
  loadEnv();
  const app = await buildApp();
  await app.ready();
  const spec = app.swagger();
  writeFileSync("openapi.json", JSON.stringify(spec, null, 2));
  console.log("OpenAPI spec written to openapi.json");
  await app.close();
}

main().catch(console.error);
