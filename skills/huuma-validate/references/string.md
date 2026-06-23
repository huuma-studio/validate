# StringSchema

Reference for `src/string.ts`. Validates `string` values with length, prefix/suffix, regex, equality, and custom constraints.

## ⚠️ Prefer the factory

**Use the `string()` factory — not `new StringSchema()`.** The factory is the idiomatic, encouraged API; the constructor is an implementation detail.

```typescript
import { string } from "jsr:@huuma/validate";              // ✅ preferred
import { string } from "jsr:@huuma/validate/string";      // ✅ deep import (best tree-shaking)
import { StringSchema } from "jsr:@huuma/validate/string"; // ⚠️ constructor — avoid in app code
```

`string()` returns a `StringSchema` (inferred `string`, required). `.optional()` → `string | undefined`; `.required()` → `string`.

## Inference

```typescript
class StringSchema<T = string> extends PrimitiveSchema<T, StringSchema<string>, StringSchema<string | undefined>, StringJSONSchema>
```

## Methods

| Method | Signature | Error message |
|--------|-----------|---------------|
| `notEmpty()` | `(): this` | `"${key\|"string"}" is empty` (when `""`, `null`, or `undefined`) |
| `empty()` | `(): this` | `"${key\|"string"}" is not empty` |
| `equals(to)` | `(to: string): this` | `"${key\|"string"}" is not equals "${to}"` |
| `notEquals(to)` | `(to: string): this` | `"${key\|"string"}" is equals "${to}"` |
| `startsWith(needle)` | `(needle: string): this` | `"${key\|"string"}" does not start with "${needle}"` |
| `endsWith(needle)` | `(needle: string): this` | `"${key\|"string"}" does not end with "${needle}"` |
| `regex(re)` | `(regex: RegExp): this` | `"${key\|"string"}" does not match regex "${regex}"` |
| `length(n)` | `(n: number): this` | `"${key\|"string"}" length is not ${n}` |
| `minLength(n)` | `(n: number): this` | `"${key\|"string"}" length is less than ${n}` |
| `maxLength(n)` | `(n: number): this` | `"${key\|"string"}" length is greater than ${n}` |
| `custom(v)` | `(validator: Validator): this` | your message |
| `optional()` | `(): StringSchema<string\|undefined>` | — |
| `required()` | `(): StringSchema<string>` | — |

Inherited from `BaseSchema`: `validate`, `parse`, `jsonSchema`, `isRequired`.

## Base validation

The type check `_isString` runs first: if `typeof value !== "string"` → `"${key|"string"}" is not type "string"`. Then each chained constraint runs **in sequence, with no short-circuit** — every validator runs and every error is collected. A non-string value still gets passed to the chained validators (length/prefix/regex checks), which may add further errors, so a single invalid value commonly produces several errors. See `references/schema.md` for the error-accumulation rules.

## Length semantics

All length checks use **UTF-16 code units** (i.e. native `value.length`). Astral characters (surrogate pairs) count as **2**. `startsWith`/`endsWith` also walk UTF-16 code units via direct index access (safe against `String.prototype` pollution).

## Examples

```typescript
import { string } from "jsr:@huuma/validate";

const username = string().notEmpty().minLength(3).maxLength(32);

const { value, errors } = username.validate("john");
// value: "john", errors: undefined

username.validate("", "username");   // errors: [{ message: '"username" is empty' }, { message: '"username" length is less than 3' }] (no short-circuit — both notEmpty and minLength fail)
username.validate("ab", "username");   // errors: [{ message: '"username" length is less than 3' }]

// Regex
const email = string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);

// Custom
const noProfanity = string().custom((value, key) =>
  /badword/.test(String(value))
    ? { message: `"${key ?? "string"}" contains profanity` }
    : undefined
);

// Optional
const maybe = string().optional();
maybe.validate(undefined); // { value: undefined, errors: undefined }
maybe.validate(null);      // { value: undefined, errors: undefined } (null treated as absent)
```

## JSON Schema

`{ type: "string" }`. Constraint methods like `regex` do **not** populate `pattern` automatically — only `UuidSchema` and explicit construction set `pattern`/`format`.