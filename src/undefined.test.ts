import { assertArrayIncludes } from "@std/assert/array-includes";
import { assertEquals } from "@std/assert/equals";

import { UndefinedSchema } from "./undefined.ts";

const notUndefinedMessage = {
  message: '"value" is not "undefined"',
};
const notUndefinedWithKeyMessage = {
  message: '"myKey" is not "undefined"',
};

Deno.test("Undefined Schema Validation: 'toString'", () => {
  const isUndefined = new UndefinedSchema().toString();
  assertEquals(isUndefined.toString(), "undefined");
});

Deno.test("Undefined Schema Validation: 'isUndefined'", () => {
  const isUndefined = new UndefinedSchema();

  // The schema requires undefined by default (unlike regular schemas that require non-undefined)
  assertEquals(isUndefined.validate(undefined).errors, undefined);

  // All other values should fail as "not undefined"
  assertArrayIncludes(isUndefined.validate(null).errors!, [
    notUndefinedMessage,
  ]);
  assertArrayIncludes(isUndefined.validate("").errors!, [notUndefinedMessage]);
  assertArrayIncludes(isUndefined.validate("test").errors!, [
    notUndefinedMessage,
  ]);
  assertArrayIncludes(isUndefined.validate(0).errors!, [notUndefinedMessage]);
  assertArrayIncludes(isUndefined.validate(1).errors!, [notUndefinedMessage]);
  assertArrayIncludes(isUndefined.validate(NaN).errors!, [notUndefinedMessage]);
  assertArrayIncludes(isUndefined.validate(Infinity).errors!, [
    notUndefinedMessage,
  ]);
  assertArrayIncludes(isUndefined.validate(true).errors!, [
    notUndefinedMessage,
  ]);
  assertArrayIncludes(isUndefined.validate(false).errors!, [
    notUndefinedMessage,
  ]);
  assertArrayIncludes(isUndefined.validate({}).errors!, [notUndefinedMessage]);
  assertArrayIncludes(isUndefined.validate([]).errors!, [notUndefinedMessage]);
  assertArrayIncludes(isUndefined.validate(() => {}).errors!, [
    notUndefinedMessage,
  ]);
});

Deno.test("Undefined Schema Validation: 'custom key'", () => {
  const isUndefined = new UndefinedSchema();

  // Test with custom key
  assertArrayIncludes(isUndefined.validate(null, "myKey").errors!, [
    notUndefinedWithKeyMessage,
  ]);
  assertArrayIncludes(isUndefined.validate("test", "myKey").errors!, [
    notUndefinedWithKeyMessage,
  ]);
});
