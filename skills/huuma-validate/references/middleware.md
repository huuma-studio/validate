# Huuma/Route middleware

Reference for `src/middleware.ts`. Request-part validation for `@huuma/route` apps.

## Imports

```typescript
import { validateBody, validateSearch } from "jsr:@huuma/validate/middleware";
// npm: from "@huuma/validate/middleware"
```

This module depends on `@huuma/route`. It is a separate subpath export — importing it pulls in the route types.

## Middleware

| Middleware | Signature | Validates |
|------------|-----------|-----------|
| `validateBody(schema)` | `(schema: Schema<unknown>): Middleware` | `ctx.body` |
| `validateSearch(schema)` | `(schema: Schema<unknown>): Middleware` | `ctx.search` (search/query params) |

A `Middleware` is `(ctx: RequestContext, next: Next) => Response | Promise<Response>` per `@huuma/route`.

## Behavior

1. Runs `schema.validate(ctx.<part>, label)` where label is `"Request Body"` or `"Search Parameters"`.
2. If `errors?.length`, builds a `BadRequestException` (HTTP 400) and sets `exception.error` to the array of `error.message` strings, then **throws** — the handler never runs.
3. Otherwise calls `next()` to proceed to the next middleware/handler.

On failure the request short-circuits with a 400. Validated values are **not** reassigned onto `ctx` — the schema is used purely as a gate. If you need the typed/validated value in the handler, call the schema's `validate`/`parse` again, or capture it via a follow-up middleware.

## Example

```typescript
import { validateBody, validateSearch } from "jsr:@huuma/validate/middleware";
import { object, string, number } from "jsr:@huuma/validate";
import { App } from "@huuma/route";

const app = new App();

const search = object({
  page: number().min(1).optional(),
  limit: number().min(1).max(100).optional(),
});

const body = object({
  username: string().notEmpty().minLength(3),
  email: string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
});

app.post("/users",
  validateSearch(search),
  validateBody(body),
  (ctx) => {
    // Reached only if both validated.
    return Response.json({ ok: true });
  },
);
```

A failed request yields 400 with a body like:

```json
{
  "error": [
    "\"username\" is empty",
    "\"email\" does not match regex \"/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/\""
  ]
}
```

## Notes

- The middleware uses `schema.validate` (non-throwing) internally and converts errors to a `BadRequestException` — so `parse()` semantics don't apply here.
- Only `body` and `search` are covered. For headers/params, validate manually inside the handler using the schema directly.
- The schema's `key` argument is the fixed label (`"Request Body"` / `"Search Parameters"`), not per-field — nested object errors still carry their property names.