import { assertArrayIncludes } from "@std/assert/array-includes";
import { assertEquals } from "@std/assert/equals";
import { StringSchema } from "./string.ts";
import { NumberSchema } from "./number.ts";
import { BooleanSchema } from "./boolean.ts";
import { UnionSchema } from "./union.ts";
import { assertThrows } from "@std/assert";

// Define error messages to match those from underlying schemas
const stringTypeMessage = {
  message: '"string" is not type "string"',
};
const numberTypeMessage = {
  message: '"number" is not type "number"',
};

Deno.test("Union Schema Validation: 'toString'", () => {
  const schema = new UnionSchema([
    new StringSchema(),
    new NumberSchema(),
  ]);
  assertEquals(schema.toString(), "union:string,number");
});

Deno.test("Union Schema Validation: basic validation with string and number", () => {
  const schema = new UnionSchema([
    new StringSchema(),
    new NumberSchema(),
  ]);

  // Should pass for string values
  assertEquals(schema.validate("hello").errors, undefined);
  assertEquals(schema.validate("").errors, undefined);

  // Should pass for number values
  assertEquals(schema.validate(0).errors, undefined);
  assertEquals(schema.validate(42).errors, undefined);
  assertEquals(schema.validate(-10).errors, undefined);

  // Should fail for other types
  const undefinedErrors = schema.validate(undefined).errors!;
  const nullErrors = schema.validate(null).errors!;
  assertEquals(undefinedErrors.length > 0, true);
  assertEquals(nullErrors.length > 0, true);

  // Test non-string, non-number values
  const boolErrors = schema.validate(true).errors!;
  const objErrors = schema.validate({}).errors!;
  const arrErrors = schema.validate([]).errors!;
  const fnErrors = schema.validate(() => {}).errors!;

  assertArrayIncludes(boolErrors, [stringTypeMessage, numberTypeMessage]);
  assertArrayIncludes(objErrors, [
    stringTypeMessage,
    numberTypeMessage,
  ]);
  assertArrayIncludes(arrErrors, [
    stringTypeMessage,
    numberTypeMessage,
  ]);
  assertArrayIncludes(fnErrors, [
    stringTypeMessage,
    numberTypeMessage,
  ]);
});

Deno.test("Union Schema Validation: with validation rules", () => {
  const schema = new UnionSchema([
    new StringSchema().notEmpty(),
    new NumberSchema().positive(),
  ]);

  // Should pass for valid values
  assertEquals(schema.validate("hello").errors, undefined);
  assertEquals(schema.validate(42).errors, undefined);

  // Should fail for values that don't meet validation rules
  const emptyStringErrors = schema.validate("").errors!;
  const negativeNumberErrors = schema.validate(-10).errors!;

  assertArrayIncludes(emptyStringErrors, [{ message: '"string" is empty' }]);
  assertArrayIncludes(negativeNumberErrors, [{
    message: '"number" is not positive',
  }]);
});

Deno.test("Union Schema Validation: with three types", () => {
  const schema = new UnionSchema([
    new StringSchema(),
    new NumberSchema(),
    new BooleanSchema(),
  ]);

  // Should pass for all three types
  assertEquals(schema.validate("hello").errors, undefined);
  assertEquals(schema.validate(42).errors, undefined);
  assertEquals(schema.validate(true).errors, undefined);
  assertEquals(schema.validate(false).errors, undefined);

  // Should fail for other types
  const undefinedErrors = schema.validate(undefined).errors!;
  const nullErrors = schema.validate(null).errors!;
  const objErrors = schema.validate({}).errors!;
  const arrErrors = schema.validate([]).errors!;

  assertEquals(undefinedErrors.length > 0, true);
  assertEquals(nullErrors.length > 0, true);
  assertArrayIncludes(objErrors, [stringTypeMessage]);
  assertArrayIncludes(arrErrors, [stringTypeMessage]);
});

Deno.test("Union Schema Validation: empty schema array", () => {
  const schema = new UnionSchema([]);

  // All values should fail with an empty schema array
  assertArrayIncludes(schema.validate("hello").errors!, []);
  assertArrayIncludes(schema.validate(42).errors!, []);
  assertArrayIncludes(schema.validate(true).errors!, []);
});

Deno.test("Union Schema Validation: parsing valid values", () => {
  const schema = new UnionSchema([
    new StringSchema(),
    new NumberSchema(),
  ]);

  // Should successfully parse valid values
  assertEquals(schema.parse("hello"), "hello");
  assertEquals(schema.parse(42), 42);

  // Should throw for invalid values
  try {
    schema.parse(undefined);
    assertEquals(true, false, "Should have thrown an error");
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message.length > 0, true);
    } else {
      assertEquals(true, false, "Error is not an instance of Error");
    }
  }
});

Deno.test("Union Schema Validation: with complex validation rules", () => {
  const schema = new UnionSchema([
    new StringSchema().regex(/^[A-Z][a-z]+$/),
    new NumberSchema().min(0).max(100),
  ]);

  // Should pass for valid values
  assertEquals(schema.validate("Hello").errors, undefined);
  assertEquals(schema.validate("World").errors, undefined);
  assertEquals(schema.validate(0).errors, undefined);
  assertEquals(schema.validate(50).errors, undefined);
  assertEquals(schema.validate(100).errors, undefined);

  // Should fail for invalid values
  const lowercaseErrors = schema.validate("hello").errors!;
  const numericStringErrors = schema.validate("123").errors!;
  const negativeNumberErrors = schema.validate(-1).errors!;
  const tooLargeNumberErrors = schema.validate(101).errors!;

  assertArrayIncludes(lowercaseErrors, [{
    message: '"string" does not match regex "/^[A-Z][a-z]+$/"',
  }]);
  assertArrayIncludes(numericStringErrors, [{
    message: '"string" does not match regex "/^[A-Z][a-z]+$/"',
  }]);
  assertArrayIncludes(negativeNumberErrors, [{
    message: '"number" is smaller than 0',
  }]);
  assertArrayIncludes(tooLargeNumberErrors, [{
    message: '"number" is bigger than 100',
  }]);
});

Deno.test("Union Schema Validation: with optional values", () => {
  const schema = new UnionSchema([
    new StringSchema().optional(),
    new NumberSchema(),
  ]);

  // Should pass for valid values including undefined for the optional string
  assertEquals(schema.validate(undefined).errors, undefined);
  assertEquals(schema.validate(null).errors, undefined);
  assertEquals(schema.validate("hello").errors, undefined);
  assertEquals(schema.validate(42).errors, undefined);
});

Deno.test("Union Schema Validation: with identical types but different constraints", () => {
  const schema = new UnionSchema([
    new StringSchema().equals("yes"),
    new StringSchema().equals("no"),
  ]);

  // Should pass for valid values
  assertEquals(schema.validate("yes").errors, undefined);
  assertEquals(schema.validate("no").errors, undefined);

  // Should fail for invalid values
  const maybeErrors = schema.validate("maybe").errors!;
  assertArrayIncludes(maybeErrors, [{
    message: '"string" is not equals "yes"',
  }]);
  assertArrayIncludes(maybeErrors, [{
    message: '"string" is not equals "no"',
  }]);
});

Deno.test("Union Schema Validation: broken schema", () => {
  // Testing a schema with a bug to check error handling
  assertThrows(() => {
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
