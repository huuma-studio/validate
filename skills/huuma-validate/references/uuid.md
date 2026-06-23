# UuidSchema

Reference for `src/uuid.ts`. Validates UUID strings, optionally restricted to a specific version.

## ⚠️ Prefer the factory

**Use the `uuid(version?)` factory — not `new UuidSchema(...)`.** The factory accepts an optional version argument (`"1"`, `"4"`, or omitted/`"all"`), so it covers every case the constructor does. The constructor is an implementation detail and should be avoided in app code.

```typescript
import { uuid } from "jsr:@huuma/validate";              // ✅ preferred
import { uuid } from "jsr:@huuma/validate/uuid";          // ✅ deep import (best tree-shaking)
import { UuidSchema } from "jsr:@huuma/validate/uuid";     // ⚠️ constructor — avoid in app code

const any = uuid();        // ✅ any version
const v4 = uuid("4");       // ✅ UUID v4 via factory (no constructor needed)
const v1 = uuid("1");       // ✅ UUID v1 via factory
```

> The export is `UuidSchema`, **not** `UUIDSchema`. README is wrong.

`uuid()` / `uuid("all")` → any-version UUID, inferred `string`, required. `uuid("1")`/`uuid("4")` → that version only. `.optional()` → `string | undefined`.

## Inference

```typescript
type Version = "1" | "4" | "all";
class UuidSchema<T = string> extends PrimitiveSchema<T, UuidSchema<RequiredType<T>>, UuidSchema<OptionalType<T>>, UuidJsonSchema>
```

Factory signature: `uuid<T = string>(version?: Version): UuidSchema<T>` — defaults to `"all"`. The constructor `new UuidSchema(version?)` accepts the same argument; prefer the factory.

## Methods

Inherited from `PrimitiveSchema`: `custom`, `optional`, `required`, `validate`, `parse`, `jsonSchema`, `isRequired`. No version-specific methods beyond the constructor.

## Validation behavior

`_isUuid(version)` tests the value against a version-specific regex:

- `"all"`: `/^[0-9A-Z]{8}(-[0-9A-Z]{4}){3}-[0-9A-Z]{12}$/i` — any hex UUID shape (version nibble not checked).
- `"1"`: third group must start with `1`.
- `"4"`: third group must start with `4`, fourth group must start with `8`, `9`, `A`, or `B`.

Regexes are case-insensitive (lower or upper hex letters). Failure: `"${key|"string"}" is not a valid "UUID"`.

Note: `"all"` checks only the structural shape, not a valid version nibble — a string like `00000000-0000-0000-0000-000000000000` passes `"all"`. Use `"1"`/`"4"` for stricter version checking.

## Examples

```typescript
import { uuid } from "jsr:@huuma/validate";

const any = uuid();
any.validate("550e8400-e29b-41d4-a716-446655440000"); // passes (v4 shape)
any.validate("not-a-uuid");                            // fails
any.validate("00000000-0000-0000-0000-000000000000");  // passes "all" (shape only)

const v4 = uuid("4"); // UUID v4 via factory
v4.validate("550e8400-e29b-41d4-a716-446655440000"); // passes (4 and a)
v4.validate("550e8400-e29b-11d4-a716-446655440000"); // fails (version nibble is 1)

const v1 = uuid("1"); // UUID v1 via factory
v1.validate("550e8400-e29b-11d4-a716-446655440000"); // passes
v1.validate("550e8400-e29b-41d4-a716-446655440000"); // fails (not v1)

const maybe = uuid("4").optional();
maybe.validate(undefined); // { value: undefined, errors: undefined }
```

## JSON Schema

`{ type: "string", format: "uuid", pattern: <regex source> }`. Unlike most schemas, `UuidSchema` **does** populate `pattern` (and `format: "uuid"`).