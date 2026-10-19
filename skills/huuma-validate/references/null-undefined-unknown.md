# NullSchema, UndefinedSchema, UnknownSchema

Reference for `src/null.ts`, `src/undefined.ts`, `src/unknown.ts` — the degenerate/special-case schemas.

## ⚠️ Prefer the factories

**Use the `nullish.null()`, `nullish.undefined()`, and `unknown()` factories — not `new NullSchema()` / `new UndefinedSchema()` / `new UnknownSchema()`.** The factories are the idiomatic, encouraged API; the constructors are implementation details.

```typescript
import { nullish, unknown } from "jsr:@huuma/validate";              // ✅ preferred
import { nullish } from "jsr:@huuma/validate/nullish";              // ✅ deep import
import { unknown } from "jsr:@huuma/validate/unknown";              // ✅ deep import
import { nil, undef } from "jsr:@huuma/validate";                    // ⚠️ deprecated — use nullish.null() / nullish.undefined()
import { NullSchema, UndefinedSchema, UnknownSchema } from "jsr:@huuma/validate"; // ⚠️ constructors — avoid in app code
```

`nullish.null()` → `NullSchema`; `nullish.undefined()` → `UndefinedSchema`; `unknown()` → `UnknownSchema`. None of these factories take arguments.

`null` and `undefined` can't be used as top-level function names, so the `nullish` namespace exists to give these schemas their real names. The older `nil()` and `undef()` factories still work but are **deprecated**.

## NullSchema

```typescript
class NullSchema extends BaseSchema<null>
```

Validates that the value is **exactly** `null`.

- `validate` checks `value === null`; failure → `"${key|"value"}" is not "null"`.
- On success returns `{ value: null, errors: undefined }`.
- No `.optional()`/`.required()` fluent API (extends `BaseSchema` with `create` only). Required by default; an absent value fails with the same message (since absent ≠ `null`).

```typescript
nullish.null().validate(null);       // { value: null, errors: undefined }
nullish.null().validate(undefined);  // errors: [{ message: '"value" is not "null"' }]
nullish.null().validate(0);          // errors: [{ message: '"value" is not "null"' }]
```

JSON Schema: `{ type: "null" }`.

## UndefinedSchema

```typescript
class UndefinedSchema<T extends null | undefined = undefined> extends BaseSchema<T>
```

Validates that the value is `undefined` (or `null`/`undefined` with `.orNull()`).

| Method                  | Signature                                | Behavior                         |
| ----------------------- | ---------------------------------------- | -------------------------------- |
| `orNull()`              | `(): UndefinedSchema<null \| undefined>` | accept `null` **or** `undefined` |
| `validate(value, key?)` | `(): Validation<T>`                      | run base validator               |

- Base check `_isUndefined`: `value === undefined`; failure → `"${key|"value"}" is not "undefined"`.
- `.orNull()` swaps in `_isUndefinedOrNull`: `value == null` (covers both `null` and `undefined`); failure → `"${key|"value"}" is not "undefined" or "null"`.
- No `.optional()`/`.required()` fluent methods. Not required: `isRequired()` is `false` (like `unknown()`), since absent is exactly what it accepts. A `nullish.undefined()` object property is left out of the JSON Schema `required` list, and a `union` with a `nullish.undefined()` member is optional.

```typescript
nullish.undefined().validate(undefined); // { value: undefined, errors: undefined }
nullish.undefined().validate(null);       // errors: is not "undefined"
nullish.undefined().orNull().validate(null); // { value: null, errors: undefined }
nullish.undefined().validate("x");        // errors: is not "undefined"
```

JSON Schema: `{ type: "null" }` (a known limitation — the library does not model `undefined` in JSON Schema; a TODO exists in source).

## UnknownSchema

```typescript
class UnknownSchema extends BaseSchema<unknown>
```

Accepts **anything**, never errors. The escape hatch.

- `validate(value)` always returns `{ value, errors: undefined }` — the value passes through unchanged.
- Default `isRequired = false` (unlike other schemas) — matches "absent is fine" semantics.
- No constraint methods; no point in `.custom()` (everything already passes).

```typescript
unknown().validate("anything");  // { value: "anything", errors: undefined }
unknown().validate(null);        // { value: null, errors: undefined }
unknown().validate(undefined);   // { value: undefined, errors: undefined }
unknown().validate({ a: 1 });    // passes through
```

JSON Schema: `{ type: ["string","number","object","array","boolean","null"] }` — every JSON Schema type, i.e. "any".

## When to use

- `nullish.null()` — a field that must be explicitly `null` (rare; sometimes APIs distinguish absent vs null).
- `nullish.undefined()` — accept absence explicitly; `.orNull()` for nullable-absent fields.
- `unknown()` — opaque/passthrough fields where you don't want to enforce a shape but still want the value in the output.

For typical "optional field" use cases, prefer `someSchema.optional()` over `nullish.undefined()`.
