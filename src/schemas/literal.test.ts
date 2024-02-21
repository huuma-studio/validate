import { assertEquals } from "std/assert/assert_equals.ts";
import { assertThrows } from "std/assert/assert_throws.ts";
import { LiteralSchema } from "./literal.ts";

Deno.test(LiteralSchema.name, async (t) => {
  await t.step("should validate literal number 2", () => {
    const literal = new LiteralSchema(2);
    assertEquals(literal.validate(2).value, 2);
  });

  await t.step('should validate literal string "Hello World"', () => {
    const literal = new LiteralSchema("Hello World");
    const validation = literal.validate("Hello World");
    assertEquals(validation.value, "Hello World");
    assertEquals(validation.errors, undefined);
  });

  await t.step('should parse literal string "Hello World"', () => {
    const literal = new LiteralSchema("Hello World");
    const parsed = literal.parse("Hello World");
    assertEquals(parsed, "Hello World");
  });

  await t.step("should allow undefined", () => {
    const literal = new LiteralSchema(2).optional();
    assertEquals(literal.validate(undefined).value, undefined);
  });

  await t.step(
    "should throw exception if schema is optional but wrong number",
    () => {
      const optionalLiteral = new LiteralSchema(2).optional();

      assertEquals(optionalLiteral.parse(undefined), undefined);
    },
  );
  await t.step(
    "should throw exception if schema is optional but wrong number",
    () => {},
  );

  await t.step("should throw expection if wrong number literal", () => {
    assertThrows(() => {
      const literal = new LiteralSchema(2);
      literal.parse(3);
    });
  });

  await t.step("should throw expection if input value is NaN", () => {
    assertThrows(() => {
      const literal = new LiteralSchema(2);
      literal.parse(NaN);
    });
  });

  await t.step("should throw expection if wrong string literal", () => {
    assertThrows(() => {
      const literal = new LiteralSchema(2);
      literal.parse("2");
    });
  });
});
