import { assert, test } from "vite-plus/test";
import { BadRequestException } from "@huuma/route/http/exception/bad-request-exception";
import type { RequestContext } from "@huuma/route/http/request";
import { enums } from "./enum.ts";
import { validateBody, validateSearch } from "./middleware.ts";
import { object } from "./object.ts";

test("Validation middleware: an invalid enum object in the body produces a bad request error", () => {
  const schema = object({ role: enums(["admin", "user"]) });
  const ctx = {
    body: { role: { toString: 0 } },
  } as unknown as RequestContext;
  let nextCalled = false;

  assert.throws(
    () =>
      validateBody(schema)(ctx, () => {
        nextCalled = true;
        return Promise.resolve(new Response("Unexpected handler call"));
      }),
    BadRequestException,
  );
  assert.deepEqual(nextCalled, false);
});

test("Validation middleware: an invalid enum object in search parameters produces a bad request error", () => {
  const schema = object({ role: enums(["admin", "user"]) });
  const ctx = {
    search: { role: { toString: 0 } },
  } as unknown as RequestContext;
  let nextCalled = false;

  assert.throws(
    () =>
      validateSearch(schema)(ctx, () => {
        nextCalled = true;
        return Promise.resolve(new Response("Unexpected handler call"));
      }),
    BadRequestException,
  );
  assert.deepEqual(nextCalled, false);
});
