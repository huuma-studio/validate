# LiteralSchema

Reference for `src/literal.ts`. Validates that a value strictly equals a single string or number literal.

## ⚠️ Prefer the factory

**Use the `literal(value)` factory — not `new LiteralSchema(value)`.** The factory is the idiomatic, encouraged API; the constructor is an implementation detail.

```typescript
import { literal } from "jsr:@huuma/validate";              // ✅ preferred
import { literal } from "jsr:@huuma/validate/literal";    // ✅ deep import (best tree-shaking)
import { LiteralSchema } from "jsr:@huuma/validate/literal"; // ⚠️ constructor — avoid in app code
```

`literal(value)` returns a `LiteralSchema` inferring the literal type (e.g. `literal("active")` → `"active"`). The factory (and constructor) **throw** if `typeof value` is not `"string"` or `"number"` (e.g. `literal(true)` throws `LiteralSchema cannot be created with type of boolean`). Only string and number literals are supported.

## Inference

```typescript
class LiteralSchema<T extends string | number | undefined> extends BaseSchema<T, LiteralJSONSchema<T>>
```

## Methods

| Method | Signature | Behavior |
|--------|-----------|----------|
| `required()` | `(): LiteralSchema<Exclude<T, undefined>>` | mark required |
| `optional()` | `(): LiteralSchema<T \| undefined>` | mark optional |
| `validate(value, key?)` | `(): Validation<T>` | run base + custom validators |
| `jsonSchema()` | `(): LiteralJSONSchema<T>` | `{ type, const: value }` |

Inherited: `parse`, `isRequired`, `toString`, `custom` — **no**; extends `BaseSchema` directly, no `.custom()`.

## Validation behavior

1. `required(type)` — absent required → `"${key|"literal:active"}" is required`.
2. `_isLiteral(value)` — strict `===` equality to the literal. Failure: `"${key|"literal"}" is not equal to "active"`.

Equality is strict: `literal(42).validate("42")` fails (no coercion).

## Examples

```typescript
import { literal } from "jsr:@huuma/validate";

const status = literal("active");
status.validate("active", "status"); // { value: "active", errors: undefined }
status.validate("invited", "status"); // errors: [{ message: '"status" is not equal to "active"' }]

const code = literal(42).optional();
code.validate(42);          // { value: 42, errors: undefined }
code.validate(undefined);   // { value: undefined, errors: undefined }
code.validate(41);           // errors: equality fails
```

## When to use vs EnumSchema

- `LiteralSchema` — single fixed value (a constant).
- `EnumSchema` — one of several values.

For two-value unions, either `LiteralSchema` wrapped in `union([…])` or a 2-member `EnumSchema` works; `LiteralSchema` gives a narrower inferred type.

## JSON Schema

`{ type: "string" | "number", const: <value> }`. `type` is derived from `typeof value`.