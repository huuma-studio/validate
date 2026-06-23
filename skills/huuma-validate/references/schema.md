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
}

interface Property       { validators: Validator[]; isRequired: boolean; }
interface BaseProperty   extends Property { baseValidators: Validator[]; }
```

## BaseSchema<T, J>

Abstract base for every schema. Key methods available on **all** schemas:

- `validate(value, key?): Validation<T>` — abstract; returns `{ value, errors }`.
- `parse(value): T` — calls `validate`; throws `ValidationException` on failure, else returns `value`.
- `jsonSchema(): J` — returns the cached JSON Schema object.
- `isRequired(): boolean` — whether the schema rejects `null`/`undefined`.
- `toString(): string` — the schema's type label (used in error messages and union labels).

`#jsonSchema`, `#type`, and `#property` are private. Constraint methods on subclasses return **new** instances via the protected `create(property)` method — schemas are immutable.

## PrimitiveSchema<T, R, O, J>

Extends `BaseSchema`. Adds the optionality + custom-validator API used by `StringSchema`, `NumberSchema`, `BooleanSchema`, `UrlSchema`, `UuidSchema`:

- `custom(validator: Validator): this` — append an arbitrary validator. Return `{ message }` to fail, `undefined` to pass.
- `required(): R` — mark required; narrows the type (removes `undefined`).
- `optional(): O` — mark optional; widens the type to `T | undefined`.
- `validate(value, key?): Validation<T>` — runs `baseValidators` then `validators`. Skipped entirely when the value is absent (`undefined`/`null`) **and** the schema is optional.

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
- `isDefined(value): boolean` — `value !== undefined && value !== null`.
- `isNotDefined(value): boolean` — `!isDefined(value)`.

> `isDefined` treats **both** `null` and `undefined` as absent. This is why optional schemas skip validation for `null` too.

## JSON Schema types

`JSONSchemaTypes = "string" | "number" | "object" | "array" | "boolean" | "null"`. The `JSONSchema` shape supports: `type`, `properties`, `required`, `items`, `enum`, `oneOf`, `const`, `format`, `pattern`.

## Absence semantics (applies to all schemas)

| Schema mode | Value is `null`/`undefined`      | Result          |
|-------------|----------------------------------|-----------------|
| required    | yes                              | `"... is required"` error |
| optional    | yes                              | skipped → `{ value: <absent>, errors: undefined }` |
| either      | no                               | validators run normally |