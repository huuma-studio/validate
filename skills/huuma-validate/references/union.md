# UnionSchema

Reference for `src/union.ts`. Validates if **any** member schema passes — the OR of schemas.

## ⚠️ Prefer the factory

**Use the `union([...])` factory — not `new UnionSchema([...])`.** The factory is the idiomatic, encouraged API; the constructor is an implementation detail.

```typescript
import { union } from "jsr:@huuma/validate";           // ✅ preferred
import { union } from "jsr:@huuma/validate/union";    // ✅ deep import (best tree-shaking)
import { UnionSchema } from "jsr:@huuma/validate/union"; // ⚠️ constructor — avoid in app code
```

`union([...memberSchemas])` returns a `UnionSchema`. The inferred value type is the union of each member's `infer` type: `union([string(), number()])` infers `string | number`. Prefer the member factories too: `union([uuid(), number()])`.

## Inference

```typescript
class UnionSchema<
  T extends ReadonlyArray<T[number] extends Schema<unknown> ? T[number] : never>
> extends BaseSchema<SchemaType<T[number]>, UnionJSONSchema<T>>
```

## Methods

Inherited from `BaseSchema`: `validate`, `parse`, `jsonSchema`, `isRequired`, `toString`.

> `UnionSchema` extends `BaseSchema` directly and has **no** `.custom()`, `.optional()`, or `.required()` methods. It is always treated as **required** at construction; to make a union optional, either include an `UndefinedSchema`/`NullSchema` member, or wrap it in an `ObjectSchema` field with optionality — there is no built-in `.optional()` on `UnionSchema` itself.

## Validation behavior

1. If required (always, since there's no `.optional()`), the value is validated against each member schema.
2. The **first** member that validates without errors wins — its `value` is returned.
3. If no member passes, all members' errors are **flattened** and returned as the `errors` array.
4. If the value is absent (`undefined`/`null`) and required, every member's required check fires, so the flattened errors will include `"${key}" is required` from each member — typically redundant but signal "no member accepted it".

The `create(property)` method returns a new `UnionSchema` with the same member schemas but a different property — used internally; not part of the public fluent API.

## Examples

```typescript
import { union, string, number, literal, uuid, object } from "jsr:@huuma/validate";

const id = union([uuid("4"), number().positive()]); // uuid("4") factory for the versioned UUID
id.validate("550e8400-e29b-41d4-a716-446655440000"); // passes as UUID → value is the string
id.validate(42);                                      // passes as number → value is 42
id.validate(-1);                                       // both fail → flattened errors from both

const status = union([literal("active"), literal("invited")]);
status.validate("active");  // { value: "active", errors: undefined }
status.validate("pending"); // both fail → flattened errors

// Optional-ish union (no .optional() on UnionSchema):
const schema = object({
  id: union([uuid(), number()]), // uuid() factory for any-version
});
```

## JSON Schema

`{ oneOf: [...each member's jsonSchema()] }`. Mirrors JSON Schema's `oneOf` keyword (though the runtime semantics are "any", not "exactly one").