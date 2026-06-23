# JSON Schema generation

Reference for `.jsonSchema()` — every schema can emit a JSON Schema (Draft subset) describing its shape. Useful for OpenAPI generation, documentation, and tooling.

## Calling it

```typescript
schema.jsonSchema(); // returns a plain object
```

The JSON Schema is **cached at construction time** — it reflects the schema as built and does **not** update if you later chain constraints (but since schemas are immutable, each chained instance has its own cached schema built from its own property set).

## Keyword coverage

| Keyword | Produced by |
|---------|--------------|
| `type` | all schemas |
| `properties` | `ObjectSchema` (map of property jsonSchemas) |
| `required` | `ObjectSchema` (keys whose schema `isRequired()`) |
| `items` | `ArraySchema` (single element schema) |
| `enum` | `EnumSchema` |
| `oneOf` | `UnionSchema` (member jsonSchemas) |
| `const` | `LiteralSchema` |
| `format` | `UrlSchema` (`"uri"`), `UuidSchema` (`"uuid"`) |
| `pattern` | `UuidSchema` (regex source) |

Constraints like `min`/`max`/`positive`/`negative`/`notEmpty`/`minLength`/`regex`/`http`/`protocol` are **runtime-only** and do **not** populate `minimum`/`maximum`/`pattern`/etc. in the JSON Schema. If you need full-fidelity JSON Schema, post-process or augment the output.

## Example

```typescript
import { object, string, number, array } from "jsr:@huuma/validate";

const schema = object({
  username: string().notEmpty(),
  age: number().min(18),
  tags: array(string()).optional(),
});

schema.jsonSchema();
/*
{
  type: "object",
  properties: {
    username: { type: "string" },
    age: { type: "number" },
    tags: { type: "array", items: { type: "string" } }
  },
  required: ["username", "age"]
}
*/
```

`tags` is optional so it is omitted from `required`, but its property schema still appears in `properties`.

## Type extraction

The `Schema<T, J>` interface's second parameter `J` is the JSON Schema type. Use `ReturnType<typeof schema.jsonSchema>` or the generic `J` if you need the static JSON Schema type for tooling.

## Composition

Nesting composes correctly: `ObjectSchema` calls each property's `.jsonSchema()`; `ArraySchema` calls the element's; `UnionSchema` maps `oneOf` from members. So a deeply nested schema yields a deeply nested JSON Schema in one call.