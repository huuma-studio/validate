import { assert, describe, test } from "vite-plus/test";
import { LiteralSchema } from "./literal.ts";
describe(LiteralSchema.name, () => {
  test("should return correct toString value (number)", () => {
    const literal = new LiteralSchema(2);
    assert.deepEqual(literal.toString(), "literal:2");
  });

  test("should validate literal number 2", () => {
    const literal = new LiteralSchema(2);
    assert.deepEqual(literal.validate(2).value, 2);
  });

  test("should return correct toString value (string)", () => {
    const literal = new LiteralSchema("Hello World");
    assert.deepEqual(literal.toString(), "literal:Hello World");
  });
  test('should validate literal string "Hello World"', () => {
    const literal = new LiteralSchema("Hello World");
    const validation = literal.validate("Hello World");
    assert.deepEqual(validation.value, "Hello World");
    assert.deepEqual(validation.errors, undefined);
  });

  test('should parse literal string "Hello World"', () => {
    const literal = new LiteralSchema("Hello World");
    const parsed = literal.parse("Hello World");
    assert.deepEqual(parsed, "Hello World");
  });

  test("should allow undefined", () => {
    const literal = new LiteralSchema(2).optional();
    assert.deepEqual(literal.validate(undefined).value, undefined);
  });

  test("should throw exception if schema is optional but wrong number", () => {
    const optionalLiteral = new LiteralSchema(2).optional();

    assert.deepEqual(optionalLiteral.parse(undefined), undefined);
  });
  test("should throw exception if schema is optional but wrong number", () => {});

  test("should throw expection if wrong number literal", () => {
    assert.throws(() => {
      const literal = new LiteralSchema(2);
      literal.parse(3);
    });
  });

  test("should throw expection if input value is NaN", () => {
    assert.throws(() => {
      const literal = new LiteralSchema(2);
      literal.parse(NaN);
    });
  });

  test("should throw expection if wrong string literal", () => {
    assert.throws(() => {
      const literal = new LiteralSchema(2);
      literal.parse("2");
    });
  });
});
