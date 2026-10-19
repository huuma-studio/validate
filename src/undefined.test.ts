import { assert, test } from "vite-plus/test";
import type { Property } from "./schema.ts";
import { UndefinedSchema } from "./undefined.ts";

const notUndefinedMessage = {
  message: '"value" is not "undefined"',
};
const notUndefinedWithKeyMessage = {
  message: '"myKey" is not "undefined"',
};

test("Undefined Schema Validation: 'toString'", () => {
  const isUndefined = new UndefinedSchema().toString();
  assert.deepEqual(isUndefined.toString(), "undefined");
});

test("Undefined Schema Validation: 'isUndefined'", () => {
  const isUndefined = new UndefinedSchema();

  // The schema requires undefined by default (unlike regular schemas that require non-undefined)
  assert.deepEqual(isUndefined.validate(undefined).errors, undefined);

  // All other values should fail as "not undefined"
  assert.includeDeepMembers(isUndefined.validate(null).errors!, [
    notUndefinedMessage,
  ]);
  assert.includeDeepMembers(isUndefined.validate("").errors!, [
    notUndefinedMessage,
  ]);
  assert.includeDeepMembers(isUndefined.validate("test").errors!, [
    notUndefinedMessage,
  ]);
  assert.includeDeepMembers(isUndefined.validate(0).errors!, [
    notUndefinedMessage,
  ]);
  assert.includeDeepMembers(isUndefined.validate(1).errors!, [
    notUndefinedMessage,
  ]);
  assert.includeDeepMembers(isUndefined.validate(NaN).errors!, [
    notUndefinedMessage,
  ]);
  assert.includeDeepMembers(isUndefined.validate(Infinity).errors!, [
    notUndefinedMessage,
  ]);
  assert.includeDeepMembers(isUndefined.validate(true).errors!, [
    notUndefinedMessage,
  ]);
  assert.includeDeepMembers(isUndefined.validate(false).errors!, [
    notUndefinedMessage,
  ]);
  assert.includeDeepMembers(isUndefined.validate({}).errors!, [
    notUndefinedMessage,
  ]);
  assert.includeDeepMembers(isUndefined.validate([]).errors!, [
    notUndefinedMessage,
  ]);
  assert.includeDeepMembers(isUndefined.validate(() => {}).errors!, [
    notUndefinedMessage,
  ]);
});

test("Undefined Schema Validation: 'custom key'", () => {
  const isUndefined = new UndefinedSchema();

  // Test with custom key
  assert.includeDeepMembers(isUndefined.validate(null, "myKey").errors!, [
    notUndefinedWithKeyMessage,
  ]);
  assert.includeDeepMembers(isUndefined.validate("test", "myKey").errors!, [
    notUndefinedWithKeyMessage,
  ]);
});

test("Undefined JSON Schema: undefined has no JSON value", () => {
  assert.deepEqual(new UndefinedSchema().jsonSchema(), { not: {} });
  assert.deepEqual(new UndefinedSchema().orNull().jsonSchema(), {
    type: "null",
  });
});

test("Undefined Schema: 'create' keeps 'orNull'", () => {
  const orNull = new UndefinedSchema().orNull();
  const created = (
    orNull as unknown as { create(property: Property): typeof orNull }
  ).create({ isRequired: false, validators: [] });

  assert.deepEqual(created.validate(null).errors, undefined);
  assert.deepEqual(created.jsonSchema(), { type: "null" });
});
