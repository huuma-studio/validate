# NumberSchema

Reference for `src/number.ts`. Validates finite numbers with range, sign, and equality constraints.

## ⚠️ Prefer the factory

**Use the `number()` factory — not `new NumberSchema()`.** The factory is the idiomatic, encouraged API; the constructor is an implementation detail.

```typescript
import { number } from "jsr:@huuma/validate";             // ✅ preferred
import { number } from "jsr:@huuma/validate/number";    // ✅ deep import (best tree-shaking)
import { NumberSchema } from "jsr:@huuma/validate/number"; // ⚠️ constructor — avoid in app code
```

`number()` returns a `NumberSchema` (inferred `number`, required). `.optional()` → `number | undefined`; `.required()` → `number`.

## Inference

```typescript
class NumberSchema<T = number> extends PrimitiveSchema<T, NumberSchema<RequiredType<T>>, NumberSchema<OptionalType<T>>, NumberJSONSchema>
```

## Methods

| Method | Signature | Behavior | Error message |
|--------|-----------|----------|---------------|
| `positive()` | `(): this` | value `>= 1` | `"${key\|"number"}" is not positive` |
| `negative()` | `(): this` | value `< 0` | `"${key\|"number"}" is not negative` |
| `min(n)` | `(like: number): this` | value `>= n` | `"${key\|"number"}" is smaller than ${n}` |
| `max(n)` | `(like: number): this` | value `<= n` | `"${key\|"number"}" is bigger than ${n}` |
| `equals(to)` | `(to: number): this` | value `=== to` | `"${key\|"number"}" is not equals ${to}` |
| `custom(v)` | `(validator: Validator): this` | your check | your message |
| `optional()` | `(): NumberSchema<number\|undefined>` | — | — |
| `required()` | `(): NumberSchema<number>` | — | — |

## Base validation

`_isNumber` uses `Number.isFinite(value)` after a `typeof value !== "number"` guard. Therefore:

- `NaN` → fails (`"${key|"number"}" is not type "number"`).
- `Infinity` / `-Infinity` → **also fail** (not finite). If you need to allow infinities, write a `.custom()` validator instead of relying on the base check.
- Strings like `"42"` are rejected — there is no coercion.

## Examples

```typescript
import { number } from "jsr:@huuma/validate";

const age = number().min(13).max(130);
age.validate(25);    // { value: 25, errors: undefined }
age.validate(12);    // errors: [{ message: '"age" is smaller than 13' }]
age.validate("25");  // errors: [{ message: '"age" is not type "number"' }]
age.validate(NaN);   // errors: [{ message: '"age" is not type "number"' }]

number().positive().validate(0);   // fails — positive means >= 1
number().negative().validate(-0); // fails — -0 === 0, not < 0
number().positive().validate(0.5);// fails — 0.5 < 1

// Port range
const port = number().min(0).max(65535);
```

## JSON Schema

`{ type: "number" }`. `min`/`max`/`positive`/`negative` do **not** emit `minimum`/`maximum` keywords — the JSON Schema is type-only.