import { assert, test } from "vite-plus/test";
import { nil, NullSchema } from "./null.ts";

const notNullMessage = {
  message: '"value" is not "null"',
};

test("Null Schema Validation: 'nil'", () => {
  const schema = nil();

  assert.deepEqual(schema.validate(null).value, null);
  assert.deepEqual(schema.validate(null).errors, undefined);

  assert.includeDeepMembers(schema.validate(undefined).errors!, [
    notNullMessage,
  ]);
  assert.includeDeepMembers(schema.validate("").errors!, [notNullMessage]);
  assert.includeDeepMembers(schema.validate("Huuma").errors!, [notNullMessage]);
  assert.includeDeepMembers(schema.validate(0).errors!, [notNullMessage]);
  assert.includeDeepMembers(schema.validate(1).errors!, [notNullMessage]);
  assert.includeDeepMembers(schema.validate(-1).errors!, [notNullMessage]);
  assert.includeDeepMembers(schema.validate(NaN).errors!, [notNullMessage]);
  assert.includeDeepMembers(schema.validate(Infinity).errors!, [
    notNullMessage,
  ]);
  assert.includeDeepMembers(schema.validate(-Infinity).errors!, [
    notNullMessage,
  ]);
  assert.includeDeepMembers(schema.validate(true).errors!, [notNullMessage]);
  assert.includeDeepMembers(schema.validate(false).errors!, [notNullMessage]);
  assert.includeDeepMembers(schema.validate({}).errors!, [notNullMessage]);
  assert.includeDeepMembers(schema.validate([]).errors!, [notNullMessage]);
  assert.includeDeepMembers(schema.validate(() => {}).errors!, [
    notNullMessage,
  ]);
});

test("Null Schema Validation: 'NullSchema constructor'", () => {
  const schema = new NullSchema();

  assert.deepEqual(schema.validate(null).value, null);
  assert.deepEqual(schema.validate(null).errors, undefined);

  assert.includeDeepMembers(schema.validate(undefined).errors!, [
    notNullMessage,
  ]);
});

test("Null Schema Validation: 'error message with key'", () => {
  const schema = nil();
  const result = schema.validate("not null", "myField");

  assert.includeDeepMembers(result.errors!, [
    { message: '"myField" is not "null"' },
  ]);
});

test("Null Schema Validation: 'value is undefined on error'", () => {
  const schema = nil();
  const result = schema.validate("not null");

  assert.deepEqual(result.value, undefined);
});
