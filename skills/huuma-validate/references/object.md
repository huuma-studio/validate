# ObjectSchema

Reference for `src/object.ts`. Validates plain objects against a map of property schemas. The workhorse schema — nest other schemas here.

## ⚠️ Prefer the factory

**Use the `object({ ... })` factory — not `new ObjectSchema({ ... })`.** The factory is the idiomatic, encouraged API; the constructor is an implementation detail.

```typescript
import { object } from "jsr:@huuma/validate";              // ✅ preferred
import { object } from "jsr:@huuma/validate/object";      // ✅ deep import (best tree-shaking)
import { ObjectSchema } from "jsr:@huuma/validate/object"; // ⚠️ constructor — avoid in app code
```

`object({ key: schema, ... })` returns an `ObjectSchema`. `T` is the map of property schemas; the inferred value type is a mapped type `{ [K in keyof T]: T[K]["infer"] }` — optionality of individual properties flows through (optional properties become `X | undefined`). Prefer the factories for nested schemas too: `object({ name: string() })`.

## Inference

```typescript
class ObjectSchema<T> extends BaseSchema<SchemaType<T>, ObjectJSONSchema<T>>
```

## Methods

| Method | Signature | Behavior |
|--------|-----------|----------|
| `required()` | `(): ObjectSchema<RequiredType<T>>` | whole object required, narrows type |
| `optional()` | `(): ObjectSchema<T \| undefined>` | whole object optional |
| `validate(value, key?)` | `(): Validation<SchemaType<T>>` | validate object + each declared property |
| `jsonSchema()` | `(): ObjectJSONSchema<T>` | `{ type:"object", properties, required }` |
| `get schema` | `: T` | accessor for the property-schema map |

Inherited: `parse`, `isRequired`, `toString`.

> `ObjectSchema` extends `BaseSchema` (not `PrimitiveSchema`), so it has **no `.custom()`**. Add custom object-level logic outside the schema, or wrap fields individually.

## Validation behavior

1. `required(type)` + `_isObject` run first.
   - `_isObject` requires `typeof value === "object"`, not `Array.isArray(value)`, and not `null`. Arrays and `null` → `"${key|"object"}" not type "object"`.
2. For each **declared** key in the schema map, the value at that key is passed to the property's schema with `key` = the property name.
   - Missing/absent properties follow each property schema's required/optional rules.
3. On success, returns a **new object** containing only the declared keys with their validated values. **Unknown input properties are dropped** — not validated, not copied through, and **not** an error.
4. Property-level errors propagate into the object's `errors` array; the object's `value` is `undefined` if any error occurred.

## Absence & optionality

- The **whole object** can be `.optional()` (skips validation when `null`/`undefined`).
- Individual **properties** are optional/required via their own schema's `.optional()`/`.required()`. A required property that is absent yields `"<prop>" is required`.

## Examples

```typescript
import { object, string, number, array } from "jsr:@huuma/validate";

const user = object({
  username: string().notEmpty(),
  age: number().min(18),
  email: string().optional(),
  tags: array(string().notEmpty()).optional(),
});

user.validate({ username: "john", age: 25 });
// { value: { username: "john", age: 25, email: undefined, tags: undefined }, errors: undefined }

user.validate({ username: "", age: 25 });
// errors: [{ message: '"username" is empty' }]

user.validate({ age: 25 });           // errors: [{ message: '"username" is required' }]
user.validate({ username: "j", age: 15 }); // errors: [{ message: '"age" is smaller than 18' }]
user.validate(null);                   // errors: [{ message: '"<root>" is required' }] (required by default)

// Unknown keys are ignored
user.validate({ username: "j", age: 20, extra: "ignored" });
// value: { username: "j", age: 20, email: undefined, tags: undefined } — "extra" dropped

// Whole-object optionality
const maybeUser = user.optional();
maybeUser.validate(undefined); // { value: undefined, errors: undefined }
```

## Nesting

Compose freely — objects of objects of arrays:

```typescript
const order = object({
  id: string().notEmpty(),
  items: array(object({
    sku: string().notEmpty(),
    qty: number().min(1),
  })),
});
```

## JSON Schema

`{ type: "object", properties: { ...each property's jsonSchema() }, required: [<keys whose schema.isRequired()>] }`. Optional properties are omitted from `required`. Unknown properties do not appear in `properties`.