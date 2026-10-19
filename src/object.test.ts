import { assert, test } from "vite-plus/test";
import { object } from "./object.ts";
import { string } from "./string.ts";
import { number } from "./number.ts";
import { union } from "./union.ts";
import { undef } from "./undefined.ts";

test("Object JSON Schema: union fields accepting undefined are not required", () => {
  const optionalName = union([string().optional(), number()]);
  const requiredName = union([string(), number()]);
  const schema = object({ name: optionalName, requiredName });

  assert.deepEqual(schema.parse({ requiredName: "present" }), {
    name: undefined,
    requiredName: "present",
  });
  assert.deepEqual(schema.jsonSchema().required, ["requiredName"]);
});

const requiredMessage = { message: `"object" is required` };

const notObjectMessage = { message: `"object" not type "object"` };

const nameRequiredMessage = {
  message: '"name" is required',
};

const nameNotStringMessage = {
  message: '"name" is not type "string"',
};

test("Object Schema Validation: 'toString'", () => {
  const isObject = object({});
  assert.deepEqual(isObject.toString(), "object");
});

test("Object Schema Validation: 'isObject'", () => {
  const isObject = object({
    name: string(),
  })
    .optional()
    .required();

  assert.includeDeepMembers(isObject.validate(undefined).errors!, [
    requiredMessage,
  ]);
  assert.includeDeepMembers(isObject.validate(null).errors!, [
    notObjectMessage,
  ]);

  assert.includeDeepMembers(isObject.validate("").errors!, [notObjectMessage]);
  assert.includeDeepMembers(isObject.validate("Cargo").errors!, [
    notObjectMessage,
  ]);

  assert.includeDeepMembers(isObject.validate(-1).errors!, [notObjectMessage]);
  assert.includeDeepMembers(isObject.validate(0).errors!, [notObjectMessage]);
  assert.includeDeepMembers(isObject.validate(1).errors!, [notObjectMessage]);

  assert.includeDeepMembers(isObject.validate(NaN).errors!, [notObjectMessage]);
  assert.includeDeepMembers(isObject.validate(Infinity).errors!, [
    notObjectMessage,
  ]);
  assert.includeDeepMembers(isObject.validate(-Infinity).errors!, [
    notObjectMessage,
  ]);

  assert.includeDeepMembers(isObject.validate(true).errors!, [
    notObjectMessage,
  ]);
  assert.includeDeepMembers(isObject.validate(false).errors!, [
    notObjectMessage,
  ]);

  assert.deepEqual(isObject.validate({}).errors, [
    nameRequiredMessage,
    nameNotStringMessage,
  ]);

  assert.deepEqual(
    isObject.validate({
      name: "Cargo",
      more: "Cargo",
    }).errors,
    undefined,
  );

  assert.deepEqual(
    isObject.validate({
      name: "Cargo",
      more: "Cargo",
    }).value!,
    {
      name: "Cargo",
    },
  );
  assert.deepEqual(
    isObject.validate({
      name: "",
    }).errors,
    undefined,
  );
  assert.includeDeepMembers(isObject.validate([]).errors!, [notObjectMessage]);
  assert.includeDeepMembers(isObject.validate(() => {}).errors!, [
    notObjectMessage,
  ]);
});

test("Object Schema Validation: 'required'", () => {
  const required = object({
    name: string(),
  });

  assert.includeDeepMembers(required.validate(undefined).errors!, [
    requiredMessage,
  ]);
  assert.includeDeepMembers(required.validate(null).errors!, [
    notObjectMessage,
  ]);

  assert.includeDeepMembers(required.validate("").errors!, [notObjectMessage]);
  assert.includeDeepMembers(required.validate("Cargo").errors!, [
    notObjectMessage,
  ]);

  assert.includeDeepMembers(required.validate(-1).errors!, [notObjectMessage]);
  assert.includeDeepMembers(required.validate(0).errors!, [notObjectMessage]);
  assert.includeDeepMembers(required.validate(1).errors!, [notObjectMessage]);

  assert.includeDeepMembers(required.validate(NaN).errors!, [notObjectMessage]);
  assert.includeDeepMembers(required.validate(Infinity).errors!, [
    notObjectMessage,
  ]);
  assert.includeDeepMembers(required.validate(-Infinity).errors!, [
    notObjectMessage,
  ]);

  assert.includeDeepMembers(required.validate(true).errors!, [
    notObjectMessage,
  ]);
  assert.includeDeepMembers(required.validate(false).errors!, [
    notObjectMessage,
  ]);

  assert.deepEqual(required.validate({}).errors, [
    nameRequiredMessage,
    nameNotStringMessage,
  ]);

  assert.deepEqual(
    required.validate({
      name: "Cargo",
    }).errors,
    undefined,
  );
  assert.deepEqual(
    required.validate({
      name: "",
    }).errors,
    undefined,
  );
  assert.includeDeepMembers(required.validate([]).errors!, [notObjectMessage]);
  assert.includeDeepMembers(required.validate(() => {}).errors!, [
    notObjectMessage,
  ]);
});

test("Object Schema Validation: 'optional'", () => {
  const optional = object({
    name: string(),
  }).optional();

  assert.deepEqual(optional.validate(undefined).errors, undefined);
  assert.includeDeepMembers(optional.validate(null).errors!, [
    notObjectMessage,
  ]);

  assert.includeDeepMembers(optional.validate("").errors!, [notObjectMessage]);
  assert.includeDeepMembers(optional.validate("Cargo").errors!, [
    notObjectMessage,
  ]);

  assert.includeDeepMembers(optional.validate(-1).errors!, [notObjectMessage]);
  assert.includeDeepMembers(optional.validate(0).errors!, [notObjectMessage]);
  assert.includeDeepMembers(optional.validate(1).errors!, [notObjectMessage]);

  assert.includeDeepMembers(optional.validate(NaN).errors!, [notObjectMessage]);
  assert.includeDeepMembers(optional.validate(Infinity).errors!, [
    notObjectMessage,
  ]);
  assert.includeDeepMembers(optional.validate(-Infinity).errors!, [
    notObjectMessage,
  ]);

  assert.includeDeepMembers(optional.validate(true).errors!, [
    notObjectMessage,
  ]);
  assert.includeDeepMembers(optional.validate(false).errors!, [
    notObjectMessage,
  ]);

  assert.deepEqual(optional.validate({}).errors, [
    nameRequiredMessage,
    nameNotStringMessage,
  ]);

  assert.deepEqual(
    optional.validate({
      name: "Cargo",
    }).errors,
    undefined,
  );
  assert.deepEqual(
    optional.validate({
      name: "",
    }).errors,
    undefined,
  );
  assert.includeDeepMembers(optional.validate([]).errors!, [notObjectMessage]);
  assert.includeDeepMembers(optional.validate(() => {}).errors!, [
    notObjectMessage,
  ]);
});

test("Object JSON Schema: union fields with an undefined member are not required", () => {
  const schema = object({ name: union([string(), undef()]) });

  assert.deepEqual(schema.parse({}), { name: undefined });
  assert.deepEqual(schema.jsonSchema().required, []);
});

test("Object Schema Validation: a non-object value does not validate children", () => {
  const schema = object({ name: string(), age: number() }).optional();

  assert.deepEqual(schema.validate(null).errors, [notObjectMessage]);
  assert.deepEqual(schema.validate("Cargo").errors, [notObjectMessage]);
});
