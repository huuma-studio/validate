# EnumSchema

Reference for `src/enum.ts`. Validates that a value is one of a fixed set of string or number members.

## ⚠️ Prefer the factory

**Use the `enums([...])` factory — not `new EnumSchema([...])`.** The factory is the idiomatic, encouraged API; the constructor is an implementation detail.

```typescript
import { enums } from "jsr:@huuma/validate";           // ✅ preferred
import { enums } from "jsr:@huuma/validate/enum";     // ✅ deep import (best tree-shaking)
import { EnumSchema } from "jsr:@huuma/validate/enum"; // ⚠️ constructor — avoid in app code
```

`enums([...members])` returns an `EnumSchema`. `T` is inferred from the array element type: `["a","b"]` → `string`; `[1,2,3]` → `number`. Mixed arrays (`["a", 1]`) widen to `string | number` and are discouraged.

## Inference

```typescript
class EnumSchema<T extends string | number | undefined> extends BaseSchema<T, EnumJSONSchema<T>>
```

## Methods

| Method | Signature | Behavior |
|--------|-----------|----------|
| `required()` | `(): EnumSchema<Exclude<T, undefined>>` | mark required |
| `optional()` | `(): EnumSchema<T \| undefined>` | mark optional |
| `validate(value, key?)` | `(): Validation<T>` | run base + custom validators |
| `jsonSchema()` | `(): EnumJSONSchema<T>` | `{ enum: [...members] }` |

Inherited: `parse`, `isRequired`, `toString`, `custom` (via `BaseSchema`? — **no**; `EnumSchema` extends `BaseSchema` directly and does **not** expose `.custom()`).

> `EnumSchema` extends `BaseSchema` and does **not** have `.custom()`. For custom enum logic, wrap with another schema.

## Validation behavior

1. `required(type)` — absent required value → `"${key|"enum:..."}" is required`.
2. `_isEnum(enums)` — `values.includes(value)` (strict `===` membership). Failure:
   `"${key|"enum"}": ("${value}") is not one of "a", "b", "c"` (members joined with `, `).

Membership uses `Array.prototype.includes` strict equality — no coercion. `enums([0,1]).validate(false)` fails because `0 === false` is false.

## Examples

```typescript
import { enums } from "jsr:@huuma/validate";

const role = enums(["admin", "user", "guest"]);
role.validate("admin", "role"); // { value: "admin", errors: undefined }
role.validate("owner", "role");  // errors: [{ message: '"role": ("owner") is not one of "admin", "user", "guest"' }]
role.validate(0, "role");         // errors: membership fails ("role": ("0") is not one of …)

const status = enums([200, 400, 500]).optional();
status.validate(200);      // { value: 200, errors: undefined }
status.validate(undefined);// { value: undefined, errors: undefined }
status.validate(404);      // errors: membership fails

// TypeScript union inference for handlers
const r = role.parse("admin"); // r: "admin" | "user" | "guest"
```

## JSON Schema

`{ enum: [...members] }`. Note: no `type` field is emitted — consumers may want to add type context. The `enum` array uses the original member values.