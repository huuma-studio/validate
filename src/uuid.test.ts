import { assertEquals } from "@std/assert/equals";
import { UuidSchema } from "./uuid.ts";

const notUUIDMessage = '"string" is not a valid "UUID"';
const uuid1 = "ae6ad8ac-78c7-11ed-a1eb-0242ac120002";
const uuid4 = "a05dfb70-7359-45a8-8407-45f509b24258";

Deno.test("UUID Schema Validation: 'toString()'", () => {
  const isUUIDSchema = new UuidSchema();
  assertEquals(isUUIDSchema.toString(), "uuid");
});

Deno.test("UUID Schema Validation: 'isUUID'", async (t) => {
  await t.step("should validated all UUIDs", () => {
    const uuidSchema = new UuidSchema();
    assertEquals(uuidSchema.validate(uuid1).errors, undefined);
    assertEquals(uuidSchema.validate(uuid4).errors, undefined);
    assertEquals(uuidSchema.validate("Cargo").errors, [
      {
        message: notUUIDMessage,
      },
    ]);
  });

  await t.step("should validated all UUIDs and allow undefined", () => {
    const uuidSchema = new UuidSchema().optional();
    assertEquals(uuidSchema.validate(undefined).errors, undefined);
    assertEquals(uuidSchema.validate(uuid1).errors, undefined);
    assertEquals(uuidSchema.validate(uuid4).errors, undefined);
    assertEquals(uuidSchema.validate("Cargo").errors, [
      {
        message: notUUIDMessage,
      },
    ]);
  });

  await t.step("should validated UUID V1", () => {
    const uuidSchema = new UuidSchema("1");
    assertEquals(uuidSchema.validate(uuid1).errors, undefined);
    assertEquals(uuidSchema.validate(uuid4).errors, [
      {
        message: notUUIDMessage,
      },
    ]);
    assertEquals(uuidSchema.validate("Cargo").errors, [
      {
        message: notUUIDMessage,
      },
    ]);
  });

  await t.step("should validated UUID V4", () => {
    const uuidSchema = new UuidSchema("4");
    assertEquals(uuidSchema.validate(uuid1).errors, [
      {
        message: notUUIDMessage,
      },
    ]);
    assertEquals(uuidSchema.validate(uuid4).errors, undefined);
    assertEquals(uuidSchema.validate("Cargo").errors, [
      {
        message: notUUIDMessage,
      },
    ]);
  });
});
