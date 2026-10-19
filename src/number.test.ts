import { assert, test } from "vite-plus/test";
import { NumberSchema } from "./number.ts";
const requiredMessage = {
  message: '"number" is required',
};
const notNumberMessage = {
  message: '"number" is not type "number"',
};
const notFiniteNumberMessage = {
  message: '"number" is not a finite number',
};
const isNotPositiveMessage = {
  message: '"number" is not positive',
};
const isNotNegativeMessage = {
  message: '"number" is not negative',
};
const isNotMinimumMessage = {
  message: '"number" is smaller than 10',
};
const isNotMaximumMessage = {
  message: '"number" is bigger than 10',
};

test("Number Schema Validation: 'toString'", () => {
  const isNumber = new NumberSchema();
  assert.deepEqual(isNumber.toString(), "number");
});

test("Number Schema Validation: 'isNumber'", () => {
  const isNumber = new NumberSchema();

  assert.includeDeepMembers(isNumber.validate(undefined).errors!, [
    requiredMessage,
  ]);
  assert.includeDeepMembers(isNumber.validate(null).errors!, [
    notNumberMessage,
  ]);

  assert.includeDeepMembers(isNumber.validate("").errors!, [notNumberMessage]);
  assert.includeDeepMembers(isNumber.validate("Cargo").errors!, [
    notNumberMessage,
  ]);

  assert.deepEqual(isNumber.validate(-1).errors, undefined);
  assert.deepEqual(isNumber.validate(0).errors, undefined);
  assert.deepEqual(isNumber.validate(1).errors, undefined);

  assert.includeDeepMembers(isNumber.validate(NaN).errors!, [
    notFiniteNumberMessage,
  ]);
  assert.includeDeepMembers(isNumber.validate(Infinity).errors!, [
    notFiniteNumberMessage,
  ]);
  assert.includeDeepMembers(isNumber.validate(-Infinity).errors!, [
    notFiniteNumberMessage,
  ]);

  assert.includeDeepMembers(isNumber.validate(true).errors!, [
    notNumberMessage,
  ]);
  assert.includeDeepMembers(isNumber.validate(false).errors!, [
    notNumberMessage,
  ]);

  assert.includeDeepMembers(isNumber.validate({}).errors!, [notNumberMessage]);
  assert.includeDeepMembers(isNumber.validate([]).errors!, [notNumberMessage]);
  assert.includeDeepMembers(isNumber.validate(() => {}).errors!, [
    notNumberMessage,
  ]);
});

test("Number Schema Validation: 'required'", () => {
  const required = new NumberSchema().optional().required();

  assert.includeDeepMembers(required.validate(undefined).errors!, [
    requiredMessage,
  ]);
  assert.includeDeepMembers(required.validate(null).errors!, [
    notNumberMessage,
  ]);

  assert.includeDeepMembers(required.validate("").errors!, [notNumberMessage]);
  assert.includeDeepMembers(required.validate("Cargo").errors!, [
    notNumberMessage,
  ]);

  assert.deepEqual(required.validate(-1).errors, undefined);
  assert.deepEqual(required.validate(0).errors, undefined);
  assert.deepEqual(required.validate(1).errors, undefined);

  assert.includeDeepMembers(required.validate(NaN).errors!, [
    notFiniteNumberMessage,
  ]);
  assert.includeDeepMembers(required.validate(Infinity).errors!, [
    notFiniteNumberMessage,
  ]);
  assert.includeDeepMembers(required.validate(-Infinity).errors!, [
    notFiniteNumberMessage,
  ]);

  assert.includeDeepMembers(required.validate(true).errors!, [
    notNumberMessage,
  ]);
  assert.includeDeepMembers(required.validate(false).errors!, [
    notNumberMessage,
  ]);

  assert.includeDeepMembers(required.validate({}).errors!, [notNumberMessage]);
  assert.includeDeepMembers(required.validate([]).errors!, [notNumberMessage]);
  assert.includeDeepMembers(required.validate(() => {}).errors!, [
    notNumberMessage,
  ]);
});

test("Number Schema Validation: 'optional'", () => {
  const optional = new NumberSchema().optional();

  assert.deepEqual(optional.validate(undefined).errors, undefined);
  assert.includeDeepMembers(optional.validate(null).errors!, [
    notNumberMessage,
  ]);

  assert.includeDeepMembers(optional.validate("").errors!, [notNumberMessage]);
  assert.includeDeepMembers(optional.validate("Cargo").errors!, [
    notNumberMessage,
  ]);

  assert.deepEqual(optional.validate(-1).errors, undefined);
  assert.deepEqual(optional.validate(0).errors, undefined);
  assert.deepEqual(optional.validate(1).errors, undefined);

  assert.includeDeepMembers(optional.validate(NaN).errors!, [
    notFiniteNumberMessage,
  ]);
  assert.includeDeepMembers(optional.validate(Infinity).errors!, [
    notFiniteNumberMessage,
  ]);
  assert.includeDeepMembers(optional.validate(-Infinity).errors!, [
    notFiniteNumberMessage,
  ]);

  assert.includeDeepMembers(optional.validate(true).errors!, [
    notNumberMessage,
  ]);
  assert.includeDeepMembers(optional.validate(false).errors!, [
    notNumberMessage,
  ]);

  assert.includeDeepMembers(optional.validate({}).errors!, [notNumberMessage]);
  assert.includeDeepMembers(optional.validate([]).errors!, [notNumberMessage]);
  assert.includeDeepMembers(optional.validate(() => {}).errors!, [
    notNumberMessage,
  ]);
});

test("Number Schema Validation: 'positive'", () => {
  const positive = new NumberSchema().positive();

  assert.includeDeepMembers(positive.validate(undefined).errors!, [
    isNotPositiveMessage,
  ]);
  assert.includeDeepMembers(positive.validate(null).errors!, [
    isNotPositiveMessage,
  ]);

  assert.includeDeepMembers(positive.validate("").errors!, [
    isNotPositiveMessage,
  ]);
  assert.includeDeepMembers(positive.validate("Cargo").errors!, [
    isNotPositiveMessage,
  ]);

  assert.includeDeepMembers(positive.validate(-1).errors!, [
    isNotPositiveMessage,
  ]);
  assert.includeDeepMembers(positive.validate(0).errors!, [
    isNotPositiveMessage,
  ]);
  assert.deepEqual(positive.validate(0.5).errors, undefined); // > 0, not >= 1 — fractions pass
  assert.deepEqual(positive.validate(1).errors, undefined);

  assert.includeDeepMembers(positive.validate(NaN).errors!, [
    isNotPositiveMessage,
  ]);
  assert.includeDeepMembers(positive.validate(Infinity).errors!, [
    isNotPositiveMessage,
  ]);
  assert.includeDeepMembers(positive.validate(-Infinity).errors!, [
    isNotPositiveMessage,
  ]);

  assert.includeDeepMembers(positive.validate(true).errors!, [
    isNotPositiveMessage,
  ]);
  assert.includeDeepMembers(positive.validate(false).errors!, [
    isNotPositiveMessage,
  ]);

  assert.includeDeepMembers(positive.validate({}).errors!, [
    isNotPositiveMessage,
  ]);
  assert.includeDeepMembers(positive.validate([]).errors!, [
    isNotPositiveMessage,
  ]);
  assert.includeDeepMembers(positive.validate(() => {}).errors!, [
    isNotPositiveMessage,
  ]);
});

test("Number Schema Validation: 'negative'", () => {
  const negative = new NumberSchema().negative();

  assert.includeDeepMembers(negative.validate(undefined).errors!, [
    isNotNegativeMessage,
  ]);
  assert.includeDeepMembers(negative.validate(null).errors!, [
    isNotNegativeMessage,
  ]);

  assert.includeDeepMembers(negative.validate("").errors!, [
    isNotNegativeMessage,
  ]);
  assert.includeDeepMembers(negative.validate("Cargo").errors!, [
    isNotNegativeMessage,
  ]);

  assert.deepEqual(negative.validate(-1).errors, undefined);
  assert.includeDeepMembers(negative.validate(0).errors!, [
    isNotNegativeMessage,
  ]);
  assert.includeDeepMembers(negative.validate(1).errors!, [
    isNotNegativeMessage,
  ]);

  assert.includeDeepMembers(negative.validate(NaN).errors!, [
    isNotNegativeMessage,
  ]);
  assert.includeDeepMembers(negative.validate(Infinity).errors!, [
    isNotNegativeMessage,
  ]);
  assert.includeDeepMembers(negative.validate(-Infinity).errors!, [
    isNotNegativeMessage,
  ]);

  assert.includeDeepMembers(negative.validate(true).errors!, [
    isNotNegativeMessage,
  ]);
  assert.includeDeepMembers(negative.validate(false).errors!, [
    isNotNegativeMessage,
  ]);

  assert.includeDeepMembers(negative.validate({}).errors!, [
    isNotNegativeMessage,
  ]);
  assert.includeDeepMembers(negative.validate([]).errors!, [
    isNotNegativeMessage,
  ]);
  assert.includeDeepMembers(negative.validate(() => {}).errors!, [
    isNotNegativeMessage,
  ]);
});

test("Number Schema Validation: 'min'", () => {
  const min = new NumberSchema().min(10);

  assert.includeDeepMembers(min.validate(undefined).errors!, [
    isNotMinimumMessage,
  ]);
  assert.includeDeepMembers(min.validate(null).errors!, [isNotMinimumMessage]);

  assert.includeDeepMembers(min.validate("").errors!, [isNotMinimumMessage]);
  assert.includeDeepMembers(min.validate("Cargo").errors!, [
    isNotMinimumMessage,
  ]);

  assert.deepEqual(min.validate(11).errors, undefined);
  assert.deepEqual(min.validate(10).errors, undefined);
  assert.includeDeepMembers(min.validate(9).errors!, [isNotMinimumMessage]);

  assert.includeDeepMembers(min.validate(-1).errors!, [isNotMinimumMessage]);
  assert.includeDeepMembers(min.validate(0).errors!, [isNotMinimumMessage]);
  assert.includeDeepMembers(min.validate(1).errors!, [isNotMinimumMessage]);

  assert.includeDeepMembers(min.validate(NaN).errors!, [isNotMinimumMessage]);
  assert.includeDeepMembers(min.validate(Infinity).errors!, [
    isNotMinimumMessage,
  ]);
  assert.includeDeepMembers(min.validate(-Infinity).errors!, [
    isNotMinimumMessage,
  ]);

  assert.includeDeepMembers(min.validate(true).errors!, [isNotMinimumMessage]);
  assert.includeDeepMembers(min.validate(false).errors!, [isNotMinimumMessage]);

  assert.includeDeepMembers(min.validate({}).errors!, [isNotMinimumMessage]);
  assert.includeDeepMembers(min.validate([]).errors!, [isNotMinimumMessage]);
  assert.includeDeepMembers(min.validate(() => {}).errors!, [
    isNotMinimumMessage,
  ]);
});

test("Number Schema Validation: 'max'", () => {
  const max = new NumberSchema().max(10);

  assert.includeDeepMembers(max.validate(undefined).errors!, [
    isNotMaximumMessage,
  ]);
  assert.includeDeepMembers(max.validate(null).errors!, [isNotMaximumMessage]);

  assert.includeDeepMembers(max.validate("").errors!, [isNotMaximumMessage]);
  assert.includeDeepMembers(max.validate("Cargo").errors!, [
    isNotMaximumMessage,
  ]);

  assert.deepEqual(max.validate(9).errors, undefined);
  assert.deepEqual(max.validate(10).errors, undefined);
  assert.includeDeepMembers(max.validate(11).errors!, [isNotMaximumMessage]);

  assert.deepEqual(max.validate(-1).errors, undefined);
  assert.deepEqual(max.validate(0).errors, undefined);
  assert.deepEqual(max.validate(1).errors, undefined);

  assert.includeDeepMembers(max.validate(NaN).errors!, [isNotMaximumMessage]);
  assert.includeDeepMembers(max.validate(Infinity).errors!, [
    isNotMaximumMessage,
  ]);
  assert.includeDeepMembers(max.validate(-Infinity).errors!, [
    isNotMaximumMessage,
  ]);

  assert.includeDeepMembers(max.validate(true).errors!, [isNotMaximumMessage]);
  assert.includeDeepMembers(max.validate(false).errors!, [isNotMaximumMessage]);

  assert.includeDeepMembers(max.validate({}).errors!, [isNotMaximumMessage]);
  assert.includeDeepMembers(max.validate([]).errors!, [isNotMaximumMessage]);
  assert.includeDeepMembers(max.validate(() => {}).errors!, [
    isNotMaximumMessage,
  ]);
});
