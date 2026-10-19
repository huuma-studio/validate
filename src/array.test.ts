import { assert, test } from "vite-plus/test";
import { StringSchema } from "./string.ts";
import { ArraySchema } from "./array.ts";

const requiredMessage = { message: `"array" is required` };

const notArrayMessage = { message: `"array" not type "array"` };

test("Array Schema Validation: 'toString'", () => {
  const isArray = new ArraySchema(new StringSchema());
  assert.deepEqual(isArray.toString(), "array");
});

test("Array Schema Validation: 'isArray'", () => {
  const isArray = new ArraySchema(new StringSchema());

  assert.includeDeepMembers(isArray.validate(undefined).errors!, [
    requiredMessage,
  ]);
  assert.includeDeepMembers(isArray.validate(null).errors!, [notArrayMessage]);

  assert.includeDeepMembers(isArray.validate("").errors!, [notArrayMessage]);
  assert.includeDeepMembers(isArray.validate("Huuma").errors!, [
    notArrayMessage,
  ]);

  assert.includeDeepMembers(isArray.validate(-1).errors!, [notArrayMessage]);
  assert.includeDeepMembers(isArray.validate(0).errors!, [notArrayMessage]);
  assert.includeDeepMembers(isArray.validate(1).errors!, [notArrayMessage]);

  assert.includeDeepMembers(isArray.validate(NaN).errors!, [notArrayMessage]);
  assert.includeDeepMembers(isArray.validate(Infinity).errors!, [
    notArrayMessage,
  ]);
  assert.includeDeepMembers(isArray.validate(-Infinity).errors!, [
    notArrayMessage,
  ]);

  assert.includeDeepMembers(isArray.validate(true).errors!, [notArrayMessage]);
  assert.includeDeepMembers(isArray.validate(false).errors!, [notArrayMessage]);

  assert.includeDeepMembers(isArray.validate({}).errors!, [notArrayMessage]);
  assert.deepEqual(isArray.validate([]).errors, undefined);
  assert.includeDeepMembers(isArray.validate(() => {}).errors!, [
    notArrayMessage,
  ]);
});

test("Array Schema Validation: 'required'", () => {
  const required = new ArraySchema(new StringSchema()).optional().required();

  assert.includeDeepMembers(required.validate(undefined).errors!, [
    requiredMessage,
  ]);
  assert.includeDeepMembers(required.validate(null).errors!, [notArrayMessage]);

  assert.includeDeepMembers(required.validate("").errors!, [notArrayMessage]);
  assert.includeDeepMembers(required.validate("Huuma").errors!, [
    notArrayMessage,
  ]);

  assert.includeDeepMembers(required.validate(-1).errors!, [notArrayMessage]);
  assert.includeDeepMembers(required.validate(0).errors!, [notArrayMessage]);
  assert.includeDeepMembers(required.validate(1).errors!, [notArrayMessage]);

  assert.includeDeepMembers(required.validate(NaN).errors!, [notArrayMessage]);
  assert.includeDeepMembers(required.validate(Infinity).errors!, [
    notArrayMessage,
  ]);
  assert.includeDeepMembers(required.validate(-Infinity).errors!, [
    notArrayMessage,
  ]);

  assert.includeDeepMembers(required.validate(true).errors!, [notArrayMessage]);
  assert.includeDeepMembers(required.validate(false).errors!, [
    notArrayMessage,
  ]);

  assert.includeDeepMembers(required.validate({}).errors!, [notArrayMessage]);
  assert.deepEqual(required.validate([]).errors, undefined);
  assert.includeDeepMembers(required.validate(() => {}).errors!, [
    notArrayMessage,
  ]);
});

test("Array Schema Validation: 'optional'", () => {
  const optional = new ArraySchema(new StringSchema()).optional();

  assert.deepEqual(optional.validate(undefined).errors, undefined);
  assert.includeDeepMembers(optional.validate(null).errors!, [notArrayMessage]);

  assert.includeDeepMembers(optional.validate("").errors!, [notArrayMessage]);
  assert.includeDeepMembers(optional.validate("Huuma").errors!, [
    notArrayMessage,
  ]);

  assert.includeDeepMembers(optional.validate(-1).errors!, [notArrayMessage]);
  assert.includeDeepMembers(optional.validate(0).errors!, [notArrayMessage]);
  assert.includeDeepMembers(optional.validate(1).errors!, [notArrayMessage]);

  assert.includeDeepMembers(optional.validate(NaN).errors!, [notArrayMessage]);
  assert.includeDeepMembers(optional.validate(Infinity).errors!, [
    notArrayMessage,
  ]);
  assert.includeDeepMembers(optional.validate(-Infinity).errors!, [
    notArrayMessage,
  ]);

  assert.includeDeepMembers(optional.validate(true).errors!, [notArrayMessage]);
  assert.includeDeepMembers(optional.validate(false).errors!, [
    notArrayMessage,
  ]);

  assert.includeDeepMembers(optional.validate({}).errors!, [notArrayMessage]);
  assert.deepEqual(optional.validate([]).errors, undefined);
  assert.includeDeepMembers(optional.validate(() => {}).errors!, [
    notArrayMessage,
  ]);
});

test("Array Schema Validation: optional parse returns undefined for missing input", () => {
  const optional = new ArraySchema(new StringSchema()).optional();

  assert.deepEqual(optional.parse(undefined), undefined);
});

test("Array Schema Validation: a global item regex validates every matching item", () => {
  const schema = new ArraySchema(new StringSchema().regex(/^[a-z]+$/g));
  const input = ["abc", "abc", "def"];

  assert.deepEqual(schema.validate(input), { value: input, errors: undefined });
  assert.deepEqual(schema.parse(input), input);
});

test("Array Schema Validation: a sticky item regex validates every matching item", () => {
  const schema = new ArraySchema(new StringSchema().regex(/^[a-z]+$/y));
  const input = ["abc", "abc", "def"];

  assert.deepEqual(schema.validate(input), { value: input, errors: undefined });
  assert.deepEqual(schema.parse(input), input);
});
