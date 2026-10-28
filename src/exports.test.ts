import { readdirSync, readFileSync } from "node:fs";
import { assert, test } from "vite-plus/test";
import * as mod from "./mod.ts";

test("Exports: 'isNotDefined' remains available as an alias of 'isUndefined'", () => {
  assert.strictEqual(mod.isNotDefined, mod.isUndefined);
});

test("Exports: every schema module has a jsr.json subpath export", () => {
  const { exports } = JSON.parse(
    readFileSync(new URL("../jsr.json", import.meta.url), "utf8"),
  ) as { exports: Record<string, string> };

  const modules = readdirSync(new URL(".", import.meta.url)).filter(
    (file) =>
      file.endsWith(".ts") &&
      !file.endsWith(".test.ts") &&
      !["mod.ts", "schema.ts"].includes(file),
  );

  for (const file of modules) {
    assert.equal(
      exports[`./${file.slice(0, -3)}`],
      `./src/${file}`,
      `missing export for ${file}`,
    );
  }
});
