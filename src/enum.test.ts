import { assertEquals } from "@std/assert/equals";
import { EnumSchema } from "./enum.ts";

Deno.test(EnumSchema.name, async (t) => {
  await t.step("should return correct toString value (strings)", () => {
    const enumSchema = new EnumSchema(["a", "b", "c"]);
    assertEquals(enumSchema.toString(), "enum:a,b,c");
  });

  await t.step("should parse string enum", () => {
    const enumSchema = new EnumSchema(["a", "b", "c"]);
    assertEquals(enumSchema.parse("a"), "a");
  });

  await t.step("should return correct toString value (numbers)", () => {
    const enumSchema = new EnumSchema([1, 2, 3]);
    assertEquals(enumSchema.toString(), "enum:1,2,3");
  });

  await t.step("should parse number enum", () => {
    const enumSchema = new EnumSchema([1, 2, 3]);

    assertEquals(enumSchema.validate(1).value, 1);
    assertEquals(enumSchema.validate(2).value, 2);
    assertEquals(enumSchema.parse(3), 3);
  });
});
