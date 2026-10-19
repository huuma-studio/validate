# Core types & base classes

Reference for `src/schema.ts` — the foundation every schema builds on.

## Interfaces & types

```typescript
interface ValidationError { message: string; }

interface SuccessfulValidation<T> { value: T; errors: undefined; }
interface FailedValidation     { value: undefined; errors: ValidationError[]; }

type Validation<T> = SuccessfulValidation<T> | FailedValidation;

type Validator = (value: unknown, key?: string) => ValidationError | undefined;

interface Schema<T, J extends JSONSchema = JSONSchema> {
  validate(value: unknown, key?: string): Validation<T>;
  infer: T;            // phantom type used for inference
  jsonSchema(): J;
  isRequired(): boolean;
  toString(): string;
}

interface Property       { validators: Validator[]; isRequired: boolean; }
interface BaseProperty   extends Property { baseValidators: Validator[]; }
```

## BaseSchema<T, J>

Abstract base for every schema. Key methods available on **all** schemas:

- `validate(value, key?): Validation<T>` — runs `baseValidators` then `validators` and returns `{ value, errors }`. Skipped entirely when the value is `undefined` **and** the schema is optional. `ObjectSchema`, `ArraySchema`, `UnionSchema`, `NullSchema`, `UndefinedSchema`, and `UnknownSchema` override it.
- `parse(value): T` — calls `validate`; throws `ValidationException` on failure, else returns `value`.
- `jsonSchema(): J` — returns the cached JSON Schema object.
- `isRequired(): boolean` — whether the schema rejects `undefined`.
- `toString(): string` — the schema's type label (used in error messages and union labels).

`#jsonSchema`, `#type`, and `#property` are private. Constraint methods on subclasses return **new** instances via the protected `create(property)` method — schemas are immutable.

## PrimitiveSchema<T, R, O, J>

Extends `BaseSchema`. Adds the optionality + custom-validator API used by `StringSchema`, `NumberSchema`, `BooleanSchema`, `UrlSchema`, `UuidSchema`:

- `custom(validator: Validator): this` — append an arbitrary validator. Return `{ message }` to fail, `undefined` to pass.
- `required(): R` — mark required; narrows the type (removes `undefined`).
- `optional(): O` — mark optional; widens the type to `T | undefined`.
- `validate(value, key?): Validation<T>` — inherited from `BaseSchema`; `PrimitiveSchema` prepends the `required(type)` base validator.

## ValidationException

```typescript
class ValidationException extends Error {
  constructor(public errors: ValidationError[]);
  // super message = JSON.stringify(errors)
}
```

Thrown by `parse()`. Inspect `e.errors` for the structured `ValidationError[]`.

## Helpers

- `required(type): Validator` — produces `"${key || type}" is required` when value is absent.
- `isDefined(value): boolean` — `value !== undefined`.
- `isUndefined(value): boolean` — `!isDefined(value)`.
- `isNotDefined(value): boolean` — **deprecated** alias of `isUndefined`.
- `toValidation(value, errors): Validation<T>` — builds `{ value, errors: undefined }` when `errors` is empty, else `{ value: undefined, errors }`.

> Only `undefined` is absent. `null` is defined and is passed to the validators, so an optional `string()` rejects `null`.

## The `key` parameter

`validate(value, key?)` and `parse(value)` accept an optional `key` that labels the value in error messages. Every validator receives it and interpolates it as `"${key || <fallback>}"`.

- **With a `key`**: messages use it, e.g. `schema.validate(0, "age")` → `"age" is not positive`.
- **Without a `key`**: messages fall back to a per-schema default — usually the schema's **type name** (`"string"`, `"number"`, `"boolean"`, `"object"`, `"array"`, `"url"`), but a few use a hardcoded fallback (`UuidSchema` → `"string"`, `EnumSchema` → `"enum"`, `LiteralSchema` → `"literal"`, `NullSchema`/`UndefinedSchema` → `"value"`).
- **Nested validation** (`ObjectSchema`, `ArraySchema`) passes the property name / `"array index <i>"` automatically, so you don't need to pass a `key` for fields inside an object.
- For top-level / standalone calls where you want readable messages, pass the field name explicitly: `schema.validate(input, "email")`.

## JSON Schema types

`JSONSchemaTypes = "string" | "number" | "object" | "array" | "boolean" | "null"`. The `JSONSchema` shape supports: `type`, `properties`, `required`, `items`, `enum`, `anyOf`, `oneOf`, `const`, `format`, `pattern`.

## Absence semantics (applies to all schemas)

| Schema mode | Value       | Result                                              |
| ----------- | ----------- | --------------------------------------------------- |
| required    | `undefined` | `"... is required"` error                           |
| optional    | `undefined` | skipped → `{ value: undefined, errors: undefined }` |
| either      | `null`      | validators run normally (`null` is a value)         |
| either      | anything    | validators run normally                             |

## Error accumulation (no short-circuit)

Validators do **not** short-circuit. On a failed validation, **every** base validator **and** every chained constraint runs in sequence, and **all** produced errors are collected into the `errors` array. A single invalid value can therefore yield multiple errors.

This is most visible with required fields: when a required `string().notEmpty().minLength(3)` field is **absent**, you typically get three errors — `is required` (from the required base validator), `is not type "string"` (from the type base validator), and `is empty` / `length is less than 3` (from the chained constraints, which also run on the absent value). Similarly `number().min(13).max(130).validate("25")` returns three errors: `is not type "number"`, `is smaller than 13`, and `is bigger than 130`.

Practical implications:

- Don't assume `errors` has exactly one entry per invalid field — iterate the whole array.
- To surface a single user-facing message, deduplicate or pick the first error per field/path in your presentation layer.
- The `value` is `undefined` whenever `errors` is non-empty; you never get a partial value.

This behavior is uniform across all schemas (`PrimitiveSchema.validate`, `ObjectSchema.validate`, `ArraySchema.validate`, etc. all collect every error from every validator they run). The one exception: `ObjectSchema` does not validate its properties when the value is not an object, so `object({ ... }).validate(null)` returns only `"object" not type "object"`.
