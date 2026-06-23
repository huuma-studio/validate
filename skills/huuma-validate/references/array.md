# ArraySchema

Reference for `src/array.ts`. Validates arrays where every element conforms to a single element schema.

## ⚠️ Prefer the factory

**Use the `array(schema)` factory — not `new ArraySchema(schema)`.** The factory is the idiomatic, encouraged API; the constructor is an implementation detail.

```typescript
import { array } from "jsr:@huuma/validate";            // ✅ preferred
import { array } from "jsr:@huuma/validate/array";      // ✅ deep import (best tree-shaking)
import { ArraySchema } from "jsr:@huuma/validate/array"; // ⚠️ constructor — avoid in app code
```

`array(elementSchema)` returns an `ArraySchema` inferring `elementSchema["infer"][]` (required). `.optional()` → `T[] | undefined`; `.required()` → `T[]`. Pass the element schema itself — and prefer its factory too: `array(string().notEmpty())`.

## Inference

```typescript
class ArraySchema<T extends Schema<unknown> | undefined>
  extends BaseSchema<T extends Schema<unknown> ? T["infer"][] : undefined, ArrayJSONSchema<T>>
```

> Unlike `PrimitiveSchema` subclasses, `ArraySchema` has **no `.custom()`** method — it extends `BaseSchema` directly. To add custom per-array logic, compose with `ObjectSchema`/`union` or validate outside the schema.

## Methods

| Method | Signature | Behavior |
|--------|-----------|----------|
| `required()` | `(): ArraySchema<Exclude<T, undefined>>` | mark required, narrow type |
| `optional()` | `(): ArraySchema<T \| undefined>` | mark optional |
| `validate(value, key?)` | `(): Validation<T["infer"][]>` | validate whole array + each element |
| `jsonSchema()` | `(): ArrayJSONSchema<T>` | `{ type: "array", items: <element jsonSchema> }` |

Inherited: `parse`, `isRequired`, `toString`.

## Validation behavior

1. `required(type)` checks presence — absent value when required → `"${key|"array"}" is required`.
2. `_isArray` checks `Array.isArray(value)` — non-arrays → `"${key|"array"}" not type "array"`.
3. For each element, the element schema's `validate` is called with key `"array index <i>"`. Element errors are collected (the failing element is **not** included in the output array, so a failed validation yields `value: undefined`).
4. On success, returns a **new array** of validated elements (not the original input).

Non-array values short-circuit element validation. Arrays are iterated with `.entries()`, so holes/sparse arrays are treated as `undefined` entries — which will then be validated by the element schema (typically failing the required check).

## Examples

```typescript
import { array, string, number, object } from "jsr:@huuma/validate";

const tags = array(string().notEmpty());
tags.validate(["a", "b"]);          // { value: ["a","b"], errors: undefined }
tags.validate(["a", "", "c"]);       // errors include { message: '"array index 1" is empty' }
tags.validate("not-an-array");       // errors: [{ message: '"tags" not type "array"' }]

const nums = array(number().min(0)).optional();
nums.validate(undefined);          // { value: undefined, errors: undefined }
nums.validate([1, 2, 3]);           // { value: [1,2,3], errors: undefined }

// Arrays of objects
const users = array(object({
  name: string().notEmpty(),
}));
```

## JSON Schema

`{ type: "array", items: <element.jsonSchema()> }`. `items` is a single schema (not a tuple). There is no `minItems`/`maxItems`/`uniqueItems` support.