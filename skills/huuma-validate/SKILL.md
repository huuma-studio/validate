---
name: huuma-validate
description: Guides an agent on how to use the @huuma/validate runtime validation library — building schemas, validating data, handling errors, integrating with Huuma/Route, and generating JSON Schemas. Activate when working in a project that imports @huuma/validate, when writing or debugging validation code that uses StringSchema/NumberSchema/ObjectSchema/etc., or when migrating code from another validation library to @huuma/validate.
---

# Using @huuma/validate

`@huuma/validate` is a lightweight, zero-dependency, tree-shakable TypeScript validation library. Schemas are **class instances** built with a **chainable, immutable API**: every constraint method returns a *new* schema instance, so always chain on the returned value. It runs in browsers, Deno, Node.js, and any JS environment.

## How to use this skill

The instructions below are the orientation. **For exact signatures, edge cases, error messages, and per-validator examples, read the matching reference file under `references/`** (paths are relative to this skill directory). Load the relevant reference before writing or debugging code for that schema — they contain the authoritative detail.

| When working with… | Read |
|---|---|
| Core types, `BaseSchema`, `PrimitiveSchema`, `Validation`, `ValidationException`, absence semantics | `references/schema.md` |
| `StringSchema` | `references/string.md` |
| `NumberSchema` | `references/number.md` |
| `BooleanSchema` | `references/boolean.md` |
| `ArraySchema` | `references/array.md` |
| `ObjectSchema` (the workhorse for nesting) | `references/object.md` |
| `EnumSchema` | `references/enum.md` |
| `LiteralSchema` | `references/literal.md` |
| `UrlSchema` | `references/url.md` |
| `UuidSchema` | `references/uuid.md` |
| `UnionSchema` | `references/union.md` |
| `NullSchema`, `UndefinedSchema`, `UnknownSchema` | `references/null-undefined-unknown.md` |
| Huuma/Route middleware (`validateBody`, `validateSearch`) | `references/middleware.md` |
| `.jsonSchema()` output & keyword coverage | `references/json-schema.md` |
| Composition recipes, optional/nullable/strict patterns, boundary helpers | `references/usage-patterns.md` |
| Deriving TypeScript types from a schema (`typeof schema.infer`) | `references/type-inference.md` |

When unsure of a method's behavior, the corresponding `references/*.md` and the source `src/<type>.ts` are the sources of truth — the project README lags behind the source.

## Installation & imports

Published on **JSR** (Deno) and via JSR for npm/Node:

```typescript
// Deno — JSR
import { StringSchema, ObjectSchema } from "jsr:@huuma/validate";

// Node/Browser — `npx jsr add @huuma/validate`
import { StringSchema, ObjectSchema } from "@huuma/validate";
```

For minimum bundle size, import individual modules (each validator is fully independent and tree-shakable): `@huuma/validate/string`, `@huuma/validate/number`, `@huuma/validate/object`, etc. See each reference file's "Imports" section.

> Export names are `UrlSchema` and `UuidSchema` (lowercase `rl`/`uid`), **not** `URLSchema`/`UUIDSchema`.

## ⚠️ Always prefer the factory functions

Every schema class has a lowercase **factory function** exported from the main entrypoint. **Use the factory functions — not `new *Schema(...)` constructors.** This is the strongly encouraged, idiomatic API. Constructors are an implementation detail and should be avoided in application code.

| Schema | Factory | Example |
|---|---|---|
| `StringSchema` | `string()` | `string().notEmpty().minLength(3)` |
| `NumberSchema` | `number()` | `number().min(18)` |
| `BooleanSchema` | `boolean()` | `boolean().true()` |
| `ArraySchema` | `array(schema)` | `array(string().notEmpty())` |
| `ObjectSchema` | `object({ ... })` | `object({ name: string() })` |
| `EnumSchema` | `enums([...])` | `enums(["admin", "user"])` |
| `LiteralSchema` | `literal(value)` | `literal("active")` |
| `UrlSchema` | `url()` | `url().http()` |
| `UuidSchema` | `uuid(version?)` | `uuid("4")`, `uuid()` |
| `UnionSchema` | `union([...])` | `union([string(), number()])` |
| `NullSchema` | `nil()` | `nil()` |
| `UndefinedSchema` | `undef()` | `undef()` |
| `UnknownSchema` | `unknown()` | `unknown()` |

When in doubt, default to the factory. `uuid()` accepts an optional version (`"1"`, `"4"`, or omitted/`"all"`) so you never need the constructor — use `uuid("4")` instead of `new UuidSchema("4")`.

## Core mental model

1. **Schemas are immutable.** Each constraint returns a *new* instance. Don't mutate-then-read: `const s = string().notEmpty();`, not `s.notEmpty();` (and don't reach for `new StringSchema()` — use the factory).
2. **Required by default.** `.optional()` allows `null`/`undefined` (both treated as "absent" — validation is skipped). `.required()` re-enforces it. Optionality flows into the inferred TS type.
3. **Two validation entry points:**
   - `schema.validate(input)` → `{ value, errors }`, never throws. Check `errors` for an array.
   - `schema.parse(input)` → returns `value`, throws `ValidationException` (with `.errors`) on failure.
4. **Errors are `{ message: string }[]` and accumulate (no short-circuit).** Every base validator and every chained constraint runs and **all** errors are collected — a single invalid value can yield multiple errors (e.g. an absent required `string().notEmpty().minLength(3)` field produces `is required`, `is not type "string"`, and `is empty`/`length is less than 3`). Iterate the whole array; don't assume one error per field. See `references/schema.md`.
5. **`.custom()` exists only on `PrimitiveSchema` subclasses** (`StringSchema`, `NumberSchema`, `BooleanSchema`, `UrlSchema`, `UuidSchema`) — not on `ObjectSchema`, `ArraySchema`, `UnionSchema`, `EnumSchema`, `LiteralSchema`. See `references/schema.md`.

## Quick reference: what each schema does

Factory-first. Use the factory, not `new` (see the "⚠️ Always prefer the factory functions" section).

- **`string()`** — `string` with length/prefix/suffix/regex/equality. UTF-16 length semantics.
- **`number()`** — finite `number` with `min`/`max`/`positive`/`negative`/`equals`. NaN/Infinity fail.
- **`boolean()`** — `boolean`; `.true()`/`.false()` narrow to the literal type.
- **`array(schema)`** — arrays of a single element schema; validates each element as `"array index <i>"`. No `.custom()`.
- **`object({ ... })`** — plain objects against a property-schema map; unknown keys are dropped silently; nested arbitrarily. No `.custom()`.
- **`enums([...])`** — one of a fixed string/number set.
- **`literal(value)`** — strict `===` to a single string/number literal. Constructor throws for non-string/number.
- **`url()`** — URL strings via `new URL()`; `.http(secure?)` and `.protocol(p)`.
- **`uuid(version?)`** — UUID strings; pass `"1"`/`"4"` for a specific version (e.g. `uuid("4")`), omit for any version. No need for the constructor.
- **`union([...])`** — OR of member schemas; first passing member wins; errors flattened on full failure. No `.optional()`/`.custom()`.
- **`nil()`** / **`undef()`** (`.orNull()`) / **`unknown()`** — degenerate/special-case schemas. `unknown()` always passes.

## Huuma/Route integration

`@huuma/validate/middleware` exports `validateBody(schema)` and `validateSearch(schema)` — gate request parts before a handler, throwing a `BadRequestException` (HTTP 400) with `error` = array of `error.message` strings on failure. See `references/middleware.md` for the full example and notes (validated values are not reassigned onto `ctx`).

## JSON Schema generation

Every schema has `.jsonSchema()` returning a cached JSON Schema object. Keyword coverage is partial (e.g. `min`/`max`/`regex` are runtime-only and do not populate `minimum`/`pattern`). See `references/json-schema.md` for the full keyword table and caveats.

## Type inference

Each schema carries a phantom `infer: T` member, so one schema is both the runtime validator and the source of a static type. The canonical idiom:

```typescript
const userSchema = object({ username: string().notEmpty(), age: number().min(18) });
type User = typeof userSchema.infer; // { username: string; age: number }

// validate/parse already return the inferred type — no named type needed:
const { value } = userSchema.validate(input); // value: User
const user = userSchema.parse(input);          // user: User (throws on invalid)
```

Key points: `.optional()` widens to `T | undefined`; `.true()`/`.false()`/`literal()`/`enums()` narrow to literals/unions; `infer` is a phantom *type* only (don't read it as a value). Full detail, alternative extraction forms, and gotchas in `references/type-inference.md`.

## Common mistakes to avoid

- **Using `new *Schema(...)` constructors.** Use the factory functions (`string()`, `number()`, `object()`, ...) instead — they are the idiomatic API. The factories accept the same options as the constructors (e.g. `uuid("4")` for a versioned UUID). There is no reason to reach for `new` in application code. See the "⚠ Always prefer the factory functions" section above.
- **Mutating instead of chaining** — constraint methods return new instances.
- **Wrong class names** — `UrlSchema`/`UuidSchema`, not `URLSchema`/`UUIDSchema`.
- **Expecting `.custom()` on `ObjectSchema`/`UnionSchema`** — only `PrimitiveSchema` subclasses have it.
- **Treating `null` and `undefined` differently for optionality** — both are "absent"; optional schemas skip both.
- **Expecting `ObjectSchema` to reject unknown keys** — it ignores/drops them. For strictness, validate the keyset separately (see `references/usage-patterns.md`).
- **Using `parse()` without try/catch** — it throws `ValidationException` on any failure.
- **Reading `schema.infer` as a value.** `infer` is a phantom type member; `schema.infer` is `undefined` at runtime. Extract the type with `typeof schema.infer`, never the value. See `references/type-inference.md`.
- **Importing the whole library when bundle size matters** — use deep imports (`@huuma/validate/string`, etc.).

## Worked example

```typescript
import {
  object, string, number, array, enums, url, union, literal, UuidSchema,
} from "jsr:@huuma/validate";

const userSchema = object({
  id: uuid("4"),                          // versioned UUID via factory — no constructor needed
  username: string().notEmpty().minLength(3).maxLength(32),
  email: string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
  age: number().min(13).optional(),
  roles: array(enums(["admin", "user", "guest"])).optional(),
  website: url().http().optional(),
  status: union([literal("active"), literal("invited")]),
});

type User = typeof userSchema.infer; // the validated value's static type

const { value, errors } = userSchema.validate(input);
if (errors) console.error(errors.map((e) => e.message));
else console.log(value); // fully typed
```

## Source of truth

Always defer to the source when a reference file is ambiguous:

- `src/schema.ts` — base classes, types, `ValidationException`.
- `src/<type>.ts` — each validator's implementation.
- `src/middleware.ts` — `validateBody`, `validateSearch`.
- `src/mod.ts` / `deno.json` — exports and subpath import map.

Read the relevant `src/<type>.ts` alongside the `references/<type>.md` if a method's exact behavior is in question.