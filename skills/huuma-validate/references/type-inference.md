# Type inference

How to derive TypeScript types from schemas. Every schema carries a phantom `infer` member (declared on the `Schema<T, J>` interface — see `references/schema.md`) that holds the validated value's type, so a single schema can serve as both the runtime validator and the source of a static type.

## The canonical idiom: `typeof schema.infer`

```typescript
import { object, string, number } from "jsr:@huuma/validate";

const userSchema = object({
  username: string().notEmpty(),
  age: number().min(18),
});

type User = typeof userSchema.infer;
// { username: string; age: number }
```

`typeof userSchema.infer` reads the phantom `infer: T` property's type. `infer` is declared on the instance (not exported as a value), so you access it through `typeof <the schema instance>.infer`. This is the recommended, most concise form.

## From validation results

`validate` and `parse` already return the inferred type — you usually don't need a named type at all:

```typescript
const { value } = userSchema.validate(input); // value: User
const user = userSchema.parse(input);          // user: User (throws on invalid)
```

The `value` field of `SuccessfulValidation<T>` and the return of `parse()` are typed as `T`, so destructuring or assigning gives you the inferred type directly. Only extract a named `type` alias when you need to reference it in signatures, interfaces, or generic constraints.

## Optionality widens the type

`.optional()` adds `| undefined` to the inferred type; `.required()` removes it:

```typescript
type A = typeof string().infer;            // string
type B = typeof string().optional().infer; // string | undefined
type C = typeof string().optional().required().infer; // string
```

For object schemas this flows through per-property: an optional property becomes `X | undefined` in the inferred object type, and the whole object can also be `.optional()`.

## Narrowing with `.true()` / `.false()` / `literal()` / `enums()`

These narrow the inferred type to a literal or union:

```typescript
type T = typeof boolean().true().infer;          // true
type F = typeof boolean().false().infer;         // false
type L = typeof literal("active").infer;          // "active"
type R = typeof enums(["admin", "user"]).infer;   // "admin" | "user"
type U = typeof union([string(), number()]).infer; // string | number
```

`boolean().true()` is useful for discriminated-union fields where the literal `true`/`false` acts as the discriminant.

## Nested inference

`object()` and `array()` compose: the inferred type mirrors the structure.

```typescript
import { object, string, number, array } from "jsr:@huuma/validate";

const orderSchema = object({
  id: string().notEmpty(),
  items: array(object({
    sku: string().notEmpty(),
    qty: number().min(1),
  })),
});

type Order = typeof orderSchema.infer;
// {
//   id: string;
//   items: { sku: string; qty: number }[];
// }
```

## Alternative extraction forms

If you only have the schema *type* (not an instance), or want to avoid `typeof`:

```typescript
import type { Schema } from "jsr:@huuma/validate";

// From the instance (recommended):
type User = typeof userSchema.infer;

// From the Schema<T, J> generic parameter (advanced, needs the instance type):
type UserFromGeneric = typeof userSchema extends Schema<infer T, unknown> ? T : never;

// From validate's return type:
type ValidatedUser = ReturnType<typeof userSchema.validate>["value"];
```

Prefer `typeof schema.infer` — it's the shortest, matches how the library is designed, and works for every schema.

## Practical pattern: schema as single source of truth

Define the schema once and derive both the runtime check and the type, so they can never drift:

```typescript
const createUserSchema = object({
  username: string().notEmpty(),
  email: string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
});

type CreateUser = typeof createUserSchema.infer;

function createUser(input: unknown): CreateUser {
  return createUserSchema.parse(input); // throws ValidationException on bad input
}
```

## Gotchas

- **`infer` is a phantom property, not a value.** Don't read it at runtime (`schema.infer` is `undefined`); only its *type* is meaningful. Use `typeof schema.infer`, never `schema.infer` as a value.
- **Optional properties stay present in the type.** `object({ x: string().optional() }).infer` is `{ x: string | undefined }`, not `{ x?: string }`. The key is always present in the inferred shape; only its value may be `undefined`.
- **Unknown object keys are not in the type.** `ObjectSchema` only knows about declared keys, so the inferred type lists exactly those keys (see `references/object.md`).
- **`UnionSchema` has no `.optional()`.** To make a union-typed field optional, wrap it in an `object()` property and call `.optional()` on that property's schema (see `references/union.md`).
- **Inference is structural, not nominal.** Two different object schemas with the same shape infer the same type — there's no branding. If you need nominal distinction, post-process the type (e.g. `type UserId = string & { readonly __brand: "UserId" }`).