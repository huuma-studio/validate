import { assert, test } from "vite-plus/test";
import * as mod from "./mod.ts";
import { nullish } from "./nullish.ts";
import { NullSchema } from "./null.ts";
import { UndefinedSchema } from "./undefined.ts";

test("Nullish Schema: 'null' validates null", () => {
  const schema = nullish.null();

  assert.instanceOf(schema, NullSchema);
  assert.deepEqual(schema.validate(null), { value: null, errors: undefined });
  assert.deepEqual(schema.validate(undefined, "field").errors, [
    { message: '"field" is not "null"' },
  ]);
  assert.deepEqual(schema.isRequired(), true);
});

test("Nullish Schema: 'undefined' validates undefined", () => {
  const schema = nullish.undefined();

  assert.instanceOf(schema, UndefinedSchema);
  assert.deepEqual(schema.validate(undefined), {
    value: undefined,
    errors: undefined,
  });
  assert.deepEqual(schema.validate(null, "field").errors, [
    { message: '"field" is not "undefined"' },
  ]);
  assert.deepEqual(schema.isRequired(), false);
});

test("Nullish Schema: 'undefined().orNull()' accepts null and undefined", () => {
  const schema = nullish.undefined().orNull();

  assert.deepEqual(schema.validate(null).errors, undefined);
  assert.deepEqual(schema.validate(undefined).errors, undefined);
  assert.deepEqual(schema.validate("", "field").errors, [
    { message: '"field" is not "undefined" or "null"' },
  ]);
});

test("Nullish Schema: each call returns a new schema", () => {
  assert.notStrictEqual(nullish.null(), nullish.null());
  assert.notStrictEqual(nullish.undefined(), nullish.undefined());
});

test("Nullish Schema: the main entrypoint re-exports the same namespace", () => {
  assert.strictEqual(mod.nullish, nullish);
});
