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
  T extends ReadonlyArray<Schema<unknown>>
> extends BaseSchema<SchemaType<T[number]>, UnionJSONSchema<T>>
```

## Methods

Overrides `BaseSchema`: `validate`, `isRequired`. Inherits `parse`, `jsonSchema`, and `toString`.

> `UnionSchema` extends `BaseSchema` directly and has **no** `.custom()`, `.optional()`, or `.required()` methods. A union containing an optional member or a `nullish.undefined()` member is also optional, so enclosing object schemas omit that field from their JSON Schema `required` list. To accept `null`, include a `nullish.null()` member.

## Validation behavior

1. For factory-created unions (or constructors using default options), the value, including `undefined`, is validated against member schemas in order until one passes. A member such as `string().optional()` accepts `undefined` itself; these unions never accept a value that no member accepts. A member's optional metadata affects the union's `isRequired()` and an enclosing object's JSON Schema `required` list, but does not bypass member validation.
2. The **first** member that validates without errors wins — its `value` is returned and the remaining members are not run.
3. If no member passes, all members' errors are **flattened** into the `errors` array, with exact duplicates (e.g. `"id" is required` from several members) reported once. An empty `union([])` fails every value with `"${key|"union"}" cannot match an empty union`. Members receive the union's `key`, so inside an object the errors name the field (e.g. `"id" is not type "number"`).
4. A required union passes `undefined` to its members, which report their own validation errors if none accept it. `null` is always passed to the members and succeeds only if a member accepts it.

**Constructor-only exception:** `new UnionSchema(members, { isRequired: false, validators: [] })` explicitly makes the union itself optional. It accepts `undefined` without running any members, even for an empty union. This differs from optionality inferred from members. The inferred value type still comes solely from the members, so this option does not add `undefined` to that type. Prefer the factory with an accepting member, such as `union([string(), nullish.undefined()])`.

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

// An optional member makes the union field optional:
const schema = object({
  id: union([uuid().optional(), number()]),
});
```

## JSON Schema

`{ anyOf: [...each member's jsonSchema()] }`. Accepts values matching any member, including values that match multiple members, consistently with runtime validation.
