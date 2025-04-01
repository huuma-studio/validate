import { assertArrayIncludes } from "@std/assert/array-includes";
import { ObjectSchema } from "./object.ts";
import { StringSchema } from "./string.ts";
import { assertEquals } from "@std/assert/equals";

const requiredMessage = { message: `"object" is required` };

const notObjectMessage = { message: `"object" not type "object"` };

const nameRequiredMessage = {
  message: '"name" is required',
};

const nameNotStringMessage = {
  message: '"name" is not type "string"',
};

Deno.test("Object Schema Validation: 'toString'", () => {
  const isObject = new ObjectSchema({});
  assertEquals(isObject.toString(), "object");
});

Deno.test("Object Schema Validation: 'isObject'", () => {
  const isObject = new ObjectSchema({
    name: new StringSchema(),
  })
    .optional()
    .required();

  assertArrayIncludes(isObject.validate(undefined).errors!, [requiredMessage]);
  assertArrayIncludes(isObject.validate(null).errors!, [requiredMessage]);

  assertArrayIncludes(isObject.validate("").errors!, [notObjectMessage]);
  assertArrayIncludes(isObject.validate("Cargo").errors!, [notObjectMessage]);

  assertArrayIncludes(isObject.validate(-1).errors!, [notObjectMessage]);
  assertArrayIncludes(isObject.validate(0).errors!, [notObjectMessage]);
  assertArrayIncludes(isObject.validate(1).errors!, [notObjectMessage]);

  assertArrayIncludes(isObject.validate(NaN).errors!, [notObjectMessage]);
  assertArrayIncludes(isObject.validate(Infinity).errors!, [notObjectMessage]);
  assertArrayIncludes(isObject.validate(-Infinity).errors!, [notObjectMessage]);

  assertArrayIncludes(isObject.validate(true).errors!, [notObjectMessage]);
  assertArrayIncludes(isObject.validate(false).errors!, [notObjectMessage]);

  assertEquals(isObject.validate({}).errors, [
    nameRequiredMessage,
    nameNotStringMessage,
  ]);

  assertEquals(
    isObject.validate({
      name: "Cargo",
      more: "Cargo",
    }).errors,
    undefined,
  );

  assertEquals(
    isObject.validate({
      name: "Cargo",
      more: "Cargo",
    }).value!,
    {
      name: "Cargo",
    },
  );
  assertEquals(
    isObject.validate({
      name: "",
    }).errors,
    undefined,
  );
  assertArrayIncludes(isObject.validate([]).errors!, [notObjectMessage]);
  assertArrayIncludes(isObject.validate(() => {}).errors!, [notObjectMessage]);
});

Deno.test("Object Schema Validation: 'required'", () => {
  const required = new ObjectSchema({
    name: new StringSchema(),
  });

  assertArrayIncludes(required.validate(undefined).errors!, [requiredMessage]);
  assertArrayIncludes(required.validate(null).errors!, [requiredMessage]);

  assertArrayIncludes(required.validate("").errors!, [notObjectMessage]);
  assertArrayIncludes(required.validate("Cargo").errors!, [notObjectMessage]);

  assertArrayIncludes(required.validate(-1).errors!, [notObjectMessage]);
  assertArrayIncludes(required.validate(0).errors!, [notObjectMessage]);
  assertArrayIncludes(required.validate(1).errors!, [notObjectMessage]);

  assertArrayIncludes(required.validate(NaN).errors!, [notObjectMessage]);
  assertArrayIncludes(required.validate(Infinity).errors!, [notObjectMessage]);
  assertArrayIncludes(required.validate(-Infinity).errors!, [notObjectMessage]);

  assertArrayIncludes(required.validate(true).errors!, [notObjectMessage]);
  assertArrayIncludes(required.validate(false).errors!, [notObjectMessage]);

  assertEquals(required.validate({}).errors, [
    nameRequiredMessage,
    nameNotStringMessage,
  ]);

  assertEquals(
    required.validate({
      name: "Cargo",
    }).errors,
    undefined,
  );
  assertEquals(
    required.validate({
      name: "",
    }).errors,
    undefined,
  );
  assertArrayIncludes(required.validate([]).errors!, [notObjectMessage]);
  assertArrayIncludes(required.validate(() => {}).errors!, [notObjectMessage]);
});

Deno.test("Object Schema Validation: 'optional'", () => {
  const optional = new ObjectSchema({
    name: new StringSchema(),
  }).optional();

  assertEquals(optional.validate(undefined).errors, undefined);
  assertEquals(optional.validate(null).errors, undefined);

  assertArrayIncludes(optional.validate("").errors!, [notObjectMessage]);
  assertArrayIncludes(optional.validate("Cargo").errors!, [notObjectMessage]);

  assertArrayIncludes(optional.validate(-1).errors!, [notObjectMessage]);
  assertArrayIncludes(optional.validate(0).errors!, [notObjectMessage]);
  assertArrayIncludes(optional.validate(1).errors!, [notObjectMessage]);

  assertArrayIncludes(optional.validate(NaN).errors!, [notObjectMessage]);
  assertArrayIncludes(optional.validate(Infinity).errors!, [notObjectMessage]);
  assertArrayIncludes(optional.validate(-Infinity).errors!, [notObjectMessage]);

  assertArrayIncludes(optional.validate(true).errors!, [notObjectMessage]);
  assertArrayIncludes(optional.validate(false).errors!, [notObjectMessage]);

  assertEquals(optional.validate({}).errors, [
    nameRequiredMessage,
    nameNotStringMessage,
  ]);

  assertEquals(
    optional.validate({
      name: "Cargo",
    }).errors,
    undefined,
  );
  assertEquals(
    optional.validate({
      name: "",
    }).errors,
    undefined,
  );
  assertArrayIncludes(optional.validate([]).errors!, [notObjectMessage]);
  assertArrayIncludes(optional.validate(() => {}).errors!, [notObjectMessage]);
});
