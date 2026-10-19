import { assert, describe, test } from "vite-plus/test";
import { uuid, UuidSchema } from "./uuid.ts";

const notUUIDMessage = '"string" is not a valid "UUID"';
const uuid1 = "ae6ad8ac-78c7-11ed-a1eb-0242ac120002";
const uuid4 = "a05dfb70-7359-45a8-8407-45f509b24258";

test("UUID Schema Validation: default rejects UUIDs containing only non-hexadecimal letters", () => {
  const result = uuid().validate("zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz");

  assert.deepEqual(result.errors, [{ message: notUUIDMessage }]);
  assert.deepEqual(result.value, undefined);
});

test("UUID Schema Validation: default rejects a non-hexadecimal first character", () => {
  const result = uuid().validate("ge6ad8ac-78c7-11ed-a1eb-0242ac120002");

  assert.deepEqual(result.errors, [{ message: notUUIDMessage }]);
  assert.deepEqual(result.value, undefined);
});

test("UUID Schema Validation: default rejects a non-hexadecimal last character", () => {
  const result = uuid().validate("ae6ad8ac-78c7-11ed-a1eb-0242ac12000z");

  assert.deepEqual(result.errors, [{ message: notUUIDMessage }]);
  assert.deepEqual(result.value, undefined);
});

test("UUID Schema Validation: all rejects UUIDs containing only non-hexadecimal letters", () => {
  const result = uuid("all").validate("zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz");

  assert.deepEqual(result.errors, [{ message: notUUIDMessage }]);
  assert.deepEqual(result.value, undefined);
});

test("UUID Schema Validation: all rejects a non-hexadecimal first character", () => {
  const result = uuid("all").validate("ge6ad8ac-78c7-11ed-a1eb-0242ac120002");

  assert.deepEqual(result.errors, [{ message: notUUIDMessage }]);
  assert.deepEqual(result.value, undefined);
});

test("UUID Schema Validation: all rejects a non-hexadecimal last character", () => {
  const result = uuid("all").validate("ae6ad8ac-78c7-11ed-a1eb-0242ac12000z");

  assert.deepEqual(result.errors, [{ message: notUUIDMessage }]);
  assert.deepEqual(result.value, undefined);
});

test("UUID Schema Validation: default accepts lowercase and uppercase hexadecimal UUIDs", () => {
  assert.deepEqual(uuid().parse(uuid1), uuid1);
  assert.deepEqual(uuid().parse(uuid4.toUpperCase()), uuid4.toUpperCase());
});

test("UUID Schema Validation: all accepts lowercase and uppercase hexadecimal UUIDs", () => {
  assert.deepEqual(uuid("all").parse(uuid1), uuid1);
  assert.deepEqual(uuid("all").parse(uuid4.toUpperCase()), uuid4.toUpperCase());
});

test("UUID Schema Validation: 'toString()'", () => {
  const isUUIDSchema = new UuidSchema();
  assert.deepEqual(isUUIDSchema.toString(), "uuid");
});

describe("UUID Schema Validation: 'isUUID'", () => {
  test("should validated all UUIDs", () => {
    const uuidSchema = new UuidSchema();
    assert.deepEqual(uuidSchema.validate(uuid1).errors, undefined);
    assert.deepEqual(uuidSchema.validate(uuid4).errors, undefined);
    assert.deepEqual(uuidSchema.validate("Cargo").errors, [
      {
        message: notUUIDMessage,
      },
    ]);
  });

  test("should validated all UUIDs and allow undefined", () => {
    const uuidSchema = new UuidSchema().optional();
    assert.deepEqual(uuidSchema.validate(undefined).errors, undefined);
    assert.deepEqual(uuidSchema.validate(uuid1).errors, undefined);
    assert.deepEqual(uuidSchema.validate(uuid4).errors, undefined);
    assert.deepEqual(uuidSchema.validate("Cargo").errors, [
      {
        message: notUUIDMessage,
      },
    ]);
  });

  test("should validated UUID V1", () => {
    const uuidSchema = new UuidSchema("1");
    assert.deepEqual(uuidSchema.validate(uuid1).errors, undefined);
    assert.deepEqual(uuidSchema.validate(uuid4).errors, [
      {
        message: notUUIDMessage,
      },
    ]);
    assert.deepEqual(uuidSchema.validate("Cargo").errors, [
      {
        message: notUUIDMessage,
      },
    ]);
  });

  test("should validated UUID V4", () => {
    const uuidSchema = new UuidSchema("4");
    assert.deepEqual(uuidSchema.validate(uuid1).errors, [
      {
        message: notUUIDMessage,
      },
    ]);
    assert.deepEqual(uuidSchema.validate(uuid4).errors, undefined);
    assert.deepEqual(uuidSchema.validate("Cargo").errors, [
      {
        message: notUUIDMessage,
      },
    ]);
  });
});

describe("UUID Schema Validation: 'uuid()' factory", () => {
  test("factory validates any UUID by default", () => {
    const uuidSchema = uuid();
    assert.deepEqual(uuidSchema.validate(uuid1).errors, undefined);
    assert.deepEqual(uuidSchema.validate(uuid4).errors, undefined);
  });

  test("factory accepts a version argument", () => {
    const uuidV1 = uuid("1");
    assert.deepEqual(uuidV1.validate(uuid1).errors, undefined);
    assert.deepEqual(uuidV1.validate(uuid4).errors, [
      {
        message: notUUIDMessage,
      },
    ]);

    const uuidV4 = uuid("4");
    assert.deepEqual(uuidV4.validate(uuid1).errors, [
      {
        message: notUUIDMessage,
      },
    ]);
    assert.deepEqual(uuidV4.validate(uuid4).errors, undefined);
  });

  test("factory supports optional", () => {
    const uuidSchema = uuid("4").optional();
    assert.deepEqual(uuidSchema.validate(undefined).errors, undefined);
    assert.deepEqual(uuidSchema.validate(uuid4).errors, undefined);
  });
});

describe("UUID JSON Schema: pattern accepts lowercase UUIDs", () => {
  const cases = [
    [undefined, uuid4],
    ["all", uuid1],
    ["1", uuid1],
    ["4", uuid4],
  ] as const;

  for (const [version, value] of cases) {
    test(`version ${version ?? "default"}`, () => {
      const pattern = new RegExp(uuid(version).jsonSchema().pattern);

      assert.isTrue(pattern.test(value));
      assert.isTrue(pattern.test(value.toUpperCase()));
    });
  }
});
