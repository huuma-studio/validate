import { assert, test } from "vite-plus/test";
import { StringSchema } from "./string.ts";
import { NumberSchema } from "./number.ts";
import { BooleanSchema } from "./boolean.ts";
import { UnionSchema } from "./union.ts";
import { UndefinedSchema } from "./undefined.ts";
import { NullSchema } from "./null.ts";
test("Union JSON Schema: overlapping members use anyOf", () => {
  const schema = new UnionSchema([new StringSchema(), new StringSchema()]);

  assert.deepEqual(schema.parse("hello"), "hello");
  assert.deepEqual(schema.jsonSchema(), {
    anyOf: [{ type: "string" }, { type: "string" }],
  });
});

test("Union JSON Schema: disjoint members also use anyOf", () => {
  const schema = new UnionSchema([new StringSchema(), new NumberSchema()]);

  assert.deepEqual(schema.parse("hello"), "hello");
  assert.deepEqual(schema.parse(42), 42);
  assert.deepEqual(schema.jsonSchema(), {
    anyOf: [{ type: "string" }, { type: "number" }],
  });
});

test("Union Schema Validation: an optional first member makes the union optional", () => {
  const schema = new UnionSchema([
    new StringSchema().optional(),
    new NumberSchema(),
  ]);

  assert.deepEqual(schema.parse(undefined), undefined);
  assert.deepEqual(schema.isRequired(), false);
});

test("Union Schema Validation: an optional last member makes the union optional", () => {
  const schema = new UnionSchema([
    new NumberSchema(),
    new StringSchema().optional(),
  ]);

  assert.deepEqual(schema.parse(undefined), undefined);
  assert.deepEqual(schema.isRequired(), false);
});

test("Union Schema Validation: optional metadata does not bypass member validation", () => {
  const member = new NullSchema({ isRequired: false, validators: [] });
  const schema = new UnionSchema([member]);
  const expected = {
    value: undefined,
    errors: [{ message: '"value" is not "null"' }],
  };

  assert.deepEqual(member.isRequired(), false);
  assert.deepEqual(member.validate(undefined), expected);
  assert.deepEqual(schema.parse(null), null);
  assert.deepEqual(schema.validate(undefined), expected);
  assert.throws(() => schema.parse(undefined));
});

test("Union Schema Validation: required members make the union required", () => {
  assert.deepEqual(
    new UnionSchema([new StringSchema(), new NumberSchema()]).isRequired(),
    true,
  );
});

// Define error messages to match those from underlying schemas
const stringTypeMessage = {
  message: '"string" is not type "string"',
};
const numberTypeMessage = {
  message: '"number" is not type "number"',
};

test("Union Schema Validation: 'toString'", () => {
  const schema = new UnionSchema([new StringSchema(), new NumberSchema()]);
  assert.deepEqual(schema.toString(), "union:string,number");
});

test("Union Schema Validation: basic validation with string and number", () => {
  const schema = new UnionSchema([new StringSchema(), new NumberSchema()]);

  // Should pass for string values
  assert.deepEqual(schema.validate("hello").errors, undefined);
  assert.deepEqual(schema.validate("").errors, undefined);

  // Should pass for number values
  assert.deepEqual(schema.validate(0).errors, undefined);
  assert.deepEqual(schema.validate(42).errors, undefined);
  assert.deepEqual(schema.validate(-10).errors, undefined);

  // Should fail for other types
  const undefinedErrors = schema.validate(undefined).errors!;
  const nullErrors = schema.validate(null).errors!;
  assert.deepEqual(undefinedErrors.length > 0, true);
  assert.deepEqual(nullErrors.length > 0, true);

  // Test non-string, non-number values
  const boolErrors = schema.validate(true).errors!;
  const objErrors = schema.validate({}).errors!;
  const arrErrors = schema.validate([]).errors!;
  const fnErrors = schema.validate(() => {}).errors!;

  assert.includeDeepMembers(boolErrors, [stringTypeMessage, numberTypeMessage]);
  assert.includeDeepMembers(objErrors, [stringTypeMessage, numberTypeMessage]);
  assert.includeDeepMembers(arrErrors, [stringTypeMessage, numberTypeMessage]);
  assert.includeDeepMembers(fnErrors, [stringTypeMessage, numberTypeMessage]);
});

test("Union Schema Validation: with validation rules", () => {
  const schema = new UnionSchema([
    new StringSchema().notEmpty(),
    new NumberSchema().positive(),
  ]);

  // Should pass for valid values
  assert.deepEqual(schema.validate("hello").errors, undefined);
  assert.deepEqual(schema.validate(42).errors, undefined);

  // Should fail for values that don't meet validation rules
  const emptyStringErrors = schema.validate("").errors!;
  const negativeNumberErrors = schema.validate(-10).errors!;

  assert.includeDeepMembers(emptyStringErrors, [
    { message: '"string" is empty' },
  ]);
  assert.includeDeepMembers(negativeNumberErrors, [
    {
      message: '"number" is not positive',
    },
  ]);
});

test("Union Schema Validation: with three types", () => {
  const schema = new UnionSchema([
    new StringSchema(),
    new NumberSchema(),
    new BooleanSchema(),
  ]);

  // Should pass for all three types
  assert.deepEqual(schema.validate("hello").errors, undefined);
  assert.deepEqual(schema.validate(42).errors, undefined);
  assert.deepEqual(schema.validate(true).errors, undefined);
  assert.deepEqual(schema.validate(false).errors, undefined);

  // Should fail for other types
  const undefinedErrors = schema.validate(undefined).errors!;
  const nullErrors = schema.validate(null).errors!;
  const objErrors = schema.validate({}).errors!;
  const arrErrors = schema.validate([]).errors!;

  assert.deepEqual(undefinedErrors.length > 0, true);
  assert.deepEqual(nullErrors.length > 0, true);
  assert.includeDeepMembers(objErrors, [stringTypeMessage]);
  assert.includeDeepMembers(arrErrors, [stringTypeMessage]);
});

test("Union Schema Validation: empty schema array", () => {
  const schema = new UnionSchema([]);

  // All values should fail with an empty schema array
  assert.includeDeepMembers(schema.validate("hello").errors!, []);
  assert.includeDeepMembers(schema.validate(42).errors!, []);
  assert.includeDeepMembers(schema.validate(true).errors!, []);
});

test("Union Schema Validation: parsing valid values", () => {
  const schema = new UnionSchema([new StringSchema(), new NumberSchema()]);

  // Should successfully parse valid values
  assert.deepEqual(schema.parse("hello"), "hello");
  assert.deepEqual(schema.parse(42), 42);

  // Should throw for invalid values
  try {
    schema.parse(undefined);
    assert.deepEqual(true, false, "Should have thrown an error");
  } catch (error) {
    if (error instanceof Error) {
      assert.deepEqual(error.message.length > 0, true);
    } else {
      assert.deepEqual(true, false, "Error is not an instance of Error");
    }
  }
});

test("Union Schema Validation: with complex validation rules", () => {
  const schema = new UnionSchema([
    new StringSchema().regex(/^[A-Z][a-z]+$/),
    new NumberSchema().min(0).max(100),
  ]);

  // Should pass for valid values
  assert.deepEqual(schema.validate("Hello").errors, undefined);
  assert.deepEqual(schema.validate("World").errors, undefined);
  assert.deepEqual(schema.validate(0).errors, undefined);
  assert.deepEqual(schema.validate(50).errors, undefined);
  assert.deepEqual(schema.validate(100).errors, undefined);

  // Should fail for invalid values
  const lowercaseErrors = schema.validate("hello").errors!;
  const numericStringErrors = schema.validate("123").errors!;
  const negativeNumberErrors = schema.validate(-1).errors!;
  const tooLargeNumberErrors = schema.validate(101).errors!;

  assert.includeDeepMembers(lowercaseErrors, [
    {
      message: '"string" does not match regex "/^[A-Z][a-z]+$/"',
    },
  ]);
  assert.includeDeepMembers(numericStringErrors, [
    {
      message: '"string" does not match regex "/^[A-Z][a-z]+$/"',
    },
  ]);
  assert.includeDeepMembers(negativeNumberErrors, [
    {
      message: '"number" is smaller than 0',
    },
  ]);
  assert.includeDeepMembers(tooLargeNumberErrors, [
    {
      message: '"number" is bigger than 100',
    },
  ]);
});

test("Union Schema Validation: with optional values", () => {
  const schema = new UnionSchema([
    new StringSchema().optional(),
    new NumberSchema(),
  ]);

  // Should pass for valid values including undefined for the optional string
  assert.deepEqual(schema.validate(undefined).errors, undefined);
  assert.deepEqual(schema.validate("hello").errors, undefined);
  assert.deepEqual(schema.validate(42).errors, undefined);

  // Optional schemas only allow undefined; null must still be validated.
  assert.deepEqual(schema.validate(null).errors, [
    stringTypeMessage,
    numberTypeMessage,
  ]);
});

test("Union Schema Validation: with identical types but different constraints", () => {
  const schema = new UnionSchema([
    new StringSchema().equals("yes"),
    new StringSchema().equals("no"),
  ]);

  // Should pass for valid values
  assert.deepEqual(schema.validate("yes").errors, undefined);
  assert.deepEqual(schema.validate("no").errors, undefined);

  // Should fail for invalid values
  const maybeErrors = schema.validate("maybe").errors!;
  assert.includeDeepMembers(maybeErrors, [
    {
      message: '"string" is not equals "yes"',
    },
  ]);
  assert.includeDeepMembers(maybeErrors, [
    {
      message: '"string" is not equals "no"',
    },
  ]);
});

test("Union Schema Validation: broken schema", () => {
  // Testing a schema with a bug to check error handling
  assert.throws(() => {
    new UnionSchema([
      // @ts-ignore - Intentionally test with a non-schema object
      {
        validate: () => ({
          value: undefined,
          errors: [{ message: "Invalid schema" }],
        }),
      },
    ]);
  });
});

test("Union Schema Validation: member errors use the key passed in", () => {
  const schema = new UnionSchema([new StringSchema(), new NumberSchema()]);

  assert.deepEqual(schema.validate(true, "id").errors, [
    { message: '"id" is not type "string"' },
    { message: '"id" is not type "number"' },
  ]);
});

test("Union Schema Validation: an undefined member makes the union optional", () => {
  const schema = new UnionSchema([new StringSchema(), new UndefinedSchema()]);

  assert.deepEqual(schema.parse(undefined), undefined);
  assert.deepEqual(schema.isRequired(), false);
});
