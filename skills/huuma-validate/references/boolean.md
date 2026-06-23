# BooleanSchema

Reference for `src/boolean.ts`. Validates boolean values; `.true()`/`.false()` narrow the inferred type to the literal.

## ⚠️ Prefer the factory

**Use the `boolean()` factory — not `new BooleanSchema()`.** The factory is the idiomatic, encouraged API; the constructor is an implementation detail.

```typescript
import { boolean } from "jsr:@huuma/validate";              // ✅ preferred
import { boolean } from "jsr:@huuma/validate/boolean";    // ✅ deep import (best tree-shaking)
import { BooleanSchema } from "jsr:@huuma/validate/boolean"; // ⚠️ constructor — avoid in app code
```

`boolean()` returns a `BooleanSchema` (inferred `boolean`). `.true()` → `true`; `.false()` → `false`; `.optional()` → `boolean | undefined`; `.required()` → `boolean`.

## Inference

```typescript
class BooleanSchema<T = boolean> extends PrimitiveSchema<T, BooleanSchema<RequiredType<T>>, BooleanSchema<OptionalType<T>>, BooleanJSONSchema>
```

## Methods

| Method | Signature | Behavior | Error message |
|--------|-----------|----------|---------------|
| `true()` | `(): BooleanSchema<true>` | value `=== true` | `"${key\|"boolean"}" is not "true"` |
| `false()` | `(): BooleanSchema<false>` | value `=== false` | `"${key\|"boolean"}" is not "false"` |
| `custom(v)` | `(validator: Validator): this` | your check | your message |
| `optional()` | `(): BooleanSchema<boolean\|undefined>` | — | — |
| `required()` | `(): BooleanSchema<boolean>` | — | — |

## Base validation

`_isBoolean` checks `typeof value === "boolean"`. Anything else (`"true"` string, 0/1, null) → `"${key|"boolean"}" is not type "boolean"`. No coercion.

`.true()` and `.false()` add an additional validator **after** the base type check, and the return type is narrowed so the inferred value is the literal `true` or `false` — useful for discriminated fields.

## Examples

```typescript
import { boolean } from "jsr:@huuma/validate";

const enabled = boolean().true();
enabled.validate(true);   // { value: true, errors: undefined }
enabled.validate(false);  // errors: [{ message: '"enabled" is not "true"' }]
enabled.validate("true"); // errors: [{ message: '"enabled" is not type "boolean"' }]

const disabled = boolean().false();
disabled.validate(false); // { value: false, errors: undefined }

const flag = boolean().optional();
flag.validate(undefined); // { value: undefined, errors: undefined }
```

## JSON Schema

`{ type: "boolean" }`. `.true()`/`.false()` do **not** emit a `const`/`enum` keyword — only `UuidSchema` and `LiteralSchema` populate those.