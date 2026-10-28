import { assert, describe, test } from "vite-plus/test";
import { enums, EnumSchema } from "./enum.ts";
import { ValidationException } from "./schema.ts";

test("Enum Schema Validation: rejects an object with a non-callable toString without throwing", () => {
  const schema = enums(["admin", "user"]);
  const value = { toString: 0 };
  const result = schema.validate(value);

  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
  assert.deepEqual(typeof result.errors[0].message, "string");
  assert.throws(() => schema.parse(value), ValidationException);
});

test("Enum Schema Validation: rejects an object without a prototype without throwing", () => {
  const schema = enums(["admin", "user"]);
  const value = Object.create(null);
  const result = schema.validate(value);

  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
  assert.deepEqual(typeof result.errors[0].message, "string");
  assert.throws(() => schema.parse(value), ValidationException);
});

test("Enum Schema Validation: rejects a symbol without throwing", () => {
  const schema = enums(["admin", "user"]);
  const value = Symbol("invalid");
  const result = schema.validate(value);

  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
  assert.deepEqual(typeof result.errors[0].message, "string");
  assert.throws(() => schema.parse(value), ValidationException);
});

describe(EnumSchema.name, () => {
  test("should return correct toString value (strings)", () => {
    const enumSchema = enums(["a", "b", "c"]);
    assert.deepEqual(enumSchema.toString(), "enum:a,b,c");
  });

  test("should parse string enum", () => {
    const enumSchema = enums(["a", "b", "c"]);
    assert.deepEqual(enumSchema.parse("a"), "a");
  });

  test("should return correct toString value (numbers)", () => {
    const enumSchema = enums([1, 2, 3]);
    assert.deepEqual(enumSchema.toString(), "enum:1,2,3");
  });

  test("should parse number enum", () => {
    const enumSchema = enums([1, 2, 3]);

    assert.deepEqual(enumSchema.validate(1).value, 1);
    assert.deepEqual(enumSchema.validate(2).value, 2);
    assert.deepEqual(enumSchema.parse(3), 3);
  });

  test("should parse number enum and undefined", () => {
    const enumSchema = enums([1, 2, 3]).optional();

    assert.deepEqual(enumSchema.validate(1).value, 1);
    assert.deepEqual(enumSchema.validate(2).value, 2);
    assert.deepEqual(enumSchema.parse(3), 3);
    assert.deepEqual(enumSchema.parse(undefined), undefined);

    assert.throws(() => enumSchema.parse("invalid"), ValidationException);
  });
});
