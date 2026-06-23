# Usage patterns & recipes

Common composition and integration patterns with `@huuma/validate`. **All examples use the factory functions** (`string()`, `object()`, …) — the idiomatic API. Avoid `new *Schema(...)` constructors entirely; the factories accept the same options (e.g. `uuid("4")` for a versioned UUID).

## Required + optional fields on an object

```typescript
const user = object({
  id: string().notEmpty(),           // required
  displayName: string().optional(),   // optional
});
```

`optional()` properties yield `T | undefined` in the inferred type and are omitted from JSON Schema `required`.

## Nested objects and arrays

```typescript
const order = object({
  id: string().notEmpty(),
  items: array(object({
    sku: string().notEmpty(),
    qty: number().min(1),
  })),
  coupon: string().optional(),
});
```

## Optional whole object vs optional fields

```typescript
// A: object itself optional (absent object is fine)
const a = object({ name: string() }).optional();

// B: object required, name optional
const b = object({ name: string().optional() });
```

## Union for "either of two shapes"

```typescript
const identifier = union([uuid("4"), number().positive()]); // uuid("4") factory for the versioned UUID
```

Remember `UnionSchema` has no `.optional()`; wrap in an object field for optionality.

## Nullable field

There's no first-class "nullable" — `null` and `undefined` are both treated as absent. To explicitly accept `null`, use `undef().orNull()` or include `nil()` in a `union`.

## Strict unknown-key rejection

`ObjectSchema` ignores unknown properties. To reject them, validate the keyset separately (`.custom()` isn't available on `ObjectSchema`):

```typescript
const allowed = new Set(["username", "age"]);
const { value, errors } = schema.validate(input);
if (errors) { /* ... */ }
else {
  const extras = Object.keys(input).filter((k) => !allowed.has(k));
  if (extras.length) throw new Error(`Unknown keys: ${extras.join(", ")}`);
}
```

## Custom string constraint

```typescript
const slug = string()
  .regex(/^[a-z0-9-]+$/)
  .custom((value, key) =>
    String(value).startsWith("-")
      ? { message: `"${key ?? "slug"}" must not start with a hyphen` }
      : undefined
  );
```

## Validate-then-throw at a boundary

```typescript
import { ValidationException } from "jsr:@huuma/validate";

function assertValid<T>(schema: Schema<T>, input: unknown): T {
  const { value, errors } = schema.validate(input);
  if (errors) throw new ValidationException(errors);
  return value;
}
```

## Reuse a schema across body + type

```typescript
const createUserSchema = object({
  username: string().notEmpty(),
  email: string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
});

type CreateUser = typeof createUserSchema.infer; // { username: string; email: string }

app.post("/users", validateBody(createUserSchema), (ctx) => {
  const body = assertValid(createUserSchema, ctx.body); // re-validate for the typed value
  // body: CreateUser
});
```

## Tree-shaking for browsers

Import from subpaths so unused validators are dropped:

```typescript
import { string } from "@huuma/validate/string";
import { object } from "@huuma/validate/object";
```

Avoid `import * as validate from "@huuma/validate"` in size-critical bundles — it pulls the whole surface unless your bundler is very aggressive.

## Error reporting

Errors are `{ message: string }[]`. Build user-friendly messages:

```typescript
const { errors } = schema.validate(input);
if (errors) {
  const formatted = errors.map((e) => e.message).join("; ");
  return Response.json({ error: formatted }, { status: 400 });
}
```

## Generate OpenAPI component from a schema

```typescript
const schema = object({ /* ... */ });
const component = schema.jsonSchema();
// Embed in your OpenAPI spec under components.schemas.<Name>
```

Note `required` is omitted entirely (not an empty array) when there are no required fields — handle that in your OpenAPI assembler.