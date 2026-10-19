import { assert, test } from "vite-plus/test";
import { BooleanSchema } from "./boolean.ts";

function expectType<T>(value: T): T {
  return value;
}

const requiredMessage = {
  message: '"boolean" is required',
};
const notBooleanMessage = {
  message: '"boolean" is not type "boolean"',
};
const notTrueMessage = {
  message: '"boolean" is not "true"',
};
const notFalseMessage = {
  message: '"boolean" is not "false"',
};

test("Boolean Schema Validation: narrowing an optional schema to true preserves missing values", () => {
  const optionalTrue = new BooleanSchema().optional().true();

  expectType<typeof optionalTrue.infer>(true);
  expectType<typeof optionalTrue.infer>(undefined);
  expectType<ReturnType<typeof optionalTrue.parse>>(undefined);
  // @ts-expect-error An optional true schema must still reject false.
  expectType<typeof optionalTrue.infer>(false);

  assert.deepEqual(optionalTrue.isRequired(), false);
  assert.deepEqual(optionalTrue.parse(undefined), undefined);
  assert.deepEqual(optionalTrue.parse(true), true);
  assert.includeDeepMembers(optionalTrue.validate(false).errors!, [
    notTrueMessage,
  ]);
});

test("Boolean Schema Validation: narrowing an optional schema to false preserves missing values", () => {
  const optionalFalse = new BooleanSchema().optional().false();

  expectType<typeof optionalFalse.infer>(false);
  expectType<typeof optionalFalse.infer>(undefined);
  expectType<ReturnType<typeof optionalFalse.parse>>(undefined);
  // @ts-expect-error An optional false schema must still reject true.
  expectType<typeof optionalFalse.infer>(true);

  assert.deepEqual(optionalFalse.isRequired(), false);
  assert.deepEqual(optionalFalse.parse(undefined), undefined);
  assert.deepEqual(optionalFalse.parse(false), false);
  assert.includeDeepMembers(optionalFalse.validate(true).errors!, [
    notFalseMessage,
  ]);
});

test("Boolean Schema Validation: 'toString'", () => {
  const isBoolean = new BooleanSchema().toString();
  assert.deepEqual(isBoolean.toString(), "boolean");
});

test("Boolean Schema Validation: 'isBoolean'", () => {
  const isBoolean = new BooleanSchema();

  assert.includeDeepMembers(isBoolean.validate(undefined).errors!, [
    requiredMessage,
  ]);
  assert.includeDeepMembers(isBoolean.validate(null).errors!, [
    notBooleanMessage,
  ]);

  assert.includeDeepMembers(isBoolean.validate("").errors!, [
    notBooleanMessage,
  ]);
  assert.includeDeepMembers(isBoolean.validate("Huuma").errors!, [
    notBooleanMessage,
  ]);

  assert.includeDeepMembers(isBoolean.validate(-1).errors!, [
    notBooleanMessage,
  ]);
  assert.includeDeepMembers(isBoolean.validate(0).errors!, [notBooleanMessage]);
  assert.includeDeepMembers(isBoolean.validate(1).errors!, [notBooleanMessage]);

  assert.includeDeepMembers(isBoolean.validate(NaN).errors!, [
    notBooleanMessage,
  ]);
  assert.includeDeepMembers(isBoolean.validate(Infinity).errors!, [
    notBooleanMessage,
  ]);
  assert.includeDeepMembers(isBoolean.validate(-Infinity).errors!, [
    notBooleanMessage,
  ]);

  assert.deepEqual(isBoolean.validate(true).errors, undefined);
  assert.deepEqual(isBoolean.validate(false).errors, undefined);

  assert.includeDeepMembers(isBoolean.validate({}).errors!, [
    notBooleanMessage,
  ]);
  assert.includeDeepMembers(isBoolean.validate([]).errors!, [
    notBooleanMessage,
  ]);
  assert.includeDeepMembers(isBoolean.validate(() => {}).errors!, [
    notBooleanMessage,
  ]);
});

test("Boolean Schema Validation: 'required'", () => {
  const bool = new BooleanSchema().optional().required();

  assert.includeDeepMembers(bool.validate(undefined).errors!, [
    requiredMessage,
  ]);
  assert.includeDeepMembers(bool.validate(null).errors!, [notBooleanMessage]);

  assert.includeDeepMembers(bool.validate("").errors!, [notBooleanMessage]);
  assert.includeDeepMembers(bool.validate("Huuma").errors!, [
    notBooleanMessage,
  ]);

  assert.includeDeepMembers(bool.validate(-1).errors!, [notBooleanMessage]);
  assert.includeDeepMembers(bool.validate(0).errors!, [notBooleanMessage]);
  assert.includeDeepMembers(bool.validate(1).errors!, [notBooleanMessage]);

  assert.includeDeepMembers(bool.validate(NaN).errors!, [notBooleanMessage]);
  assert.includeDeepMembers(bool.validate(Infinity).errors!, [
    notBooleanMessage,
  ]);
  assert.includeDeepMembers(bool.validate(-Infinity).errors!, [
    notBooleanMessage,
  ]);

  assert.deepEqual(bool.validate(true).errors, undefined);
  assert.deepEqual(bool.validate(false).errors, undefined);

  assert.includeDeepMembers(bool.validate({}).errors!, [notBooleanMessage]);
  assert.includeDeepMembers(bool.validate([]).errors!, [notBooleanMessage]);
  assert.includeDeepMembers(bool.validate(() => {}).errors!, [
    notBooleanMessage,
  ]);
});

test("Boolean Schema Validation: 'optional'", () => {
  const bool = new BooleanSchema().optional();

  assert.deepEqual(bool.validate(undefined).errors, undefined);
  assert.includeDeepMembers(bool.validate(null).errors!, [notBooleanMessage]);

  assert.includeDeepMembers(bool.validate("").errors!, [notBooleanMessage]);
  assert.includeDeepMembers(bool.validate("Huuma").errors!, [
    notBooleanMessage,
  ]);

  assert.includeDeepMembers(bool.validate(-1).errors!, [notBooleanMessage]);
  assert.includeDeepMembers(bool.validate(0).errors!, [notBooleanMessage]);
  assert.includeDeepMembers(bool.validate(1).errors!, [notBooleanMessage]);

  assert.includeDeepMembers(bool.validate(NaN).errors!, [notBooleanMessage]);
  assert.includeDeepMembers(bool.validate(Infinity).errors!, [
    notBooleanMessage,
  ]);
  assert.includeDeepMembers(bool.validate(-Infinity).errors!, [
    notBooleanMessage,
  ]);

  assert.deepEqual(bool.validate(true).errors, undefined);
  assert.deepEqual(bool.validate(false).errors, undefined);

  assert.includeDeepMembers(bool.validate({}).errors!, [notBooleanMessage]);
  assert.includeDeepMembers(bool.validate([]).errors!, [notBooleanMessage]);
  assert.includeDeepMembers(bool.validate(() => {}).errors!, [
    notBooleanMessage,
  ]);
});

test("Boolean Schema Validation: 'true'", () => {
  const boolTrue = new BooleanSchema().true();

  assert.includeDeepMembers(boolTrue.validate(undefined).errors!, [
    notTrueMessage,
  ]);
  assert.includeDeepMembers(boolTrue.validate(null).errors!, [notTrueMessage]);

  assert.includeDeepMembers(boolTrue.validate("").errors!, [notTrueMessage]);
  assert.includeDeepMembers(boolTrue.validate("Huuma").errors!, [
    notTrueMessage,
  ]);

  assert.includeDeepMembers(boolTrue.validate(-1).errors!, [notTrueMessage]);
  assert.includeDeepMembers(boolTrue.validate(0).errors!, [notTrueMessage]);
  assert.includeDeepMembers(boolTrue.validate(1).errors!, [notTrueMessage]);

  assert.includeDeepMembers(boolTrue.validate(NaN).errors!, [notTrueMessage]);
  assert.includeDeepMembers(boolTrue.validate(Infinity).errors!, [
    notTrueMessage,
  ]);
  assert.includeDeepMembers(boolTrue.validate(-Infinity).errors!, [
    notTrueMessage,
  ]);

  assert.deepEqual(boolTrue.validate(true).errors, undefined);
  assert.includeDeepMembers(boolTrue.validate(false).errors!, [notTrueMessage]);

  assert.includeDeepMembers(boolTrue.validate({}).errors!, [notTrueMessage]);
  assert.includeDeepMembers(boolTrue.validate([]).errors!, [notTrueMessage]);
  assert.includeDeepMembers(boolTrue.validate(() => {}).errors!, [
    notTrueMessage,
  ]);
});

test("Boolean Schema Validation: 'false'", () => {
  const boolFalse = new BooleanSchema().false();

  assert.includeDeepMembers(boolFalse.validate(undefined).errors!, [
    notFalseMessage,
  ]);
  assert.includeDeepMembers(boolFalse.validate(null).errors!, [
    notFalseMessage,
  ]);

  assert.includeDeepMembers(boolFalse.validate("").errors!, [notFalseMessage]);
  assert.includeDeepMembers(boolFalse.validate("Cargo").errors!, [
    notFalseMessage,
  ]);

  assert.includeDeepMembers(boolFalse.validate(-1).errors!, [notFalseMessage]);
  assert.includeDeepMembers(boolFalse.validate(0).errors!, [notFalseMessage]);
  assert.includeDeepMembers(boolFalse.validate(1).errors!, [notFalseMessage]);

  assert.includeDeepMembers(boolFalse.validate(NaN).errors!, [notFalseMessage]);
  assert.includeDeepMembers(boolFalse.validate(Infinity).errors!, [
    notFalseMessage,
  ]);
  assert.includeDeepMembers(boolFalse.validate(-Infinity).errors!, [
    notFalseMessage,
  ]);

  assert.includeDeepMembers(boolFalse.validate(true).errors!, [
    notFalseMessage,
  ]);
  assert.deepEqual(boolFalse.validate(false).errors, undefined);

  assert.includeDeepMembers(boolFalse.validate({}).errors!, [notFalseMessage]);
  assert.includeDeepMembers(boolFalse.validate([]).errors!, [notFalseMessage]);
  assert.includeDeepMembers(boolFalse.validate(() => {}).errors!, [
    notFalseMessage,
  ]);
});
