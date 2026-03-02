import { assertArrayIncludes } from "@std/assert/array-includes";
import { assertEquals } from "@std/assert/equals";

import { nil, NullSchema } from "./null.ts";

const notNullMessage = {
  message: '"value" is not "null"',
};

Deno.test("Null Schema Validation: 'nil'", () => {
  const schema = nil();

  assertEquals(schema.validate(null).value, null);
  assertEquals(schema.validate(null).errors, undefined);

  assertArrayIncludes(schema.validate(undefined).errors!, [notNullMessage]);
  assertArrayIncludes(schema.validate("").errors!, [notNullMessage]);
  assertArrayIncludes(schema.validate("Huuma").errors!, [notNullMessage]);
  assertArrayIncludes(schema.validate(0).errors!, [notNullMessage]);
  assertArrayIncludes(schema.validate(1).errors!, [notNullMessage]);
  assertArrayIncludes(schema.validate(-1).errors!, [notNullMessage]);
  assertArrayIncludes(schema.validate(NaN).errors!, [notNullMessage]);
  assertArrayIncludes(schema.validate(Infinity).errors!, [notNullMessage]);
  assertArrayIncludes(schema.validate(-Infinity).errors!, [notNullMessage]);
  assertArrayIncludes(schema.validate(true).errors!, [notNullMessage]);
  assertArrayIncludes(schema.validate(false).errors!, [notNullMessage]);
  assertArrayIncludes(schema.validate({}).errors!, [notNullMessage]);
  assertArrayIncludes(schema.validate([]).errors!, [notNullMessage]);
  assertArrayIncludes(schema.validate(() => {}).errors!, [notNullMessage]);
});

Deno.test("Null Schema Validation: 'NullSchema constructor'", () => {
  const schema = new NullSchema();

  assertEquals(schema.validate(null).value, null);
  assertEquals(schema.validate(null).errors, undefined);

  assertArrayIncludes(schema.validate(undefined).errors!, [notNullMessage]);
});

Deno.test("Null Schema Validation: 'error message with key'", () => {
  const schema = nil();
  const result = schema.validate("not null", "myField");

  assertArrayIncludes(result.errors!, [
    { message: '"myField" is not "null"' },
  ]);
});

Deno.test("Null Schema Validation: 'value is undefined on error'", () => {
  const schema = nil();
  const result = schema.validate("not null");

  assertEquals(result.value, undefined);
});
