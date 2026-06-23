# UrlSchema

Reference for `src/url.ts`. Validates URL strings via the global `URL` constructor, with protocol constraints.

## ⚠️ Prefer the factory

**Use the `url()` factory — not `new UrlSchema()`.** The factory is the idiomatic, encouraged API; the constructor is an implementation detail.

```typescript
import { url } from "jsr:@huuma/validate";           // ✅ preferred
import { url } from "jsr:@huuma/validate/url";       // ✅ deep import (best tree-shaking)
import { UrlSchema } from "jsr:@huuma/validate/url"; // ⚠️ constructor — avoid in app code
```

> The export is `UrlSchema` (lowercase `rl`), **not** `URLSchema`. The README's `URLSchema` is wrong.

`url()` returns a `UrlSchema` (inferred `string`, required). `.optional()` → `string | undefined`.

## Inference

```typescript
class UrlSchema<T = string> extends PrimitiveSchema<T, UrlSchema<RequiredType<T>>, UrlSchema<OptionalType<T>>, UrlJSONSchema>
```

## Methods

| Method | Signature | Behavior | Error message |
|--------|-----------|----------|---------------|
| `http(secure?)` | `(secure = true): UrlSchema<T>` | `true` → `https:` only; `false` → `http:` or `https:` | `"${key\|"url"}" is not of protocol type "https:"` (or `"http:" or "https:"`) |
| `protocol(p)` | `(protocol: string): UrlSchema<T>` | require exact `protocol` (e.g. `"ssh:"`, include the colon) | `"${key\|"url"}" is not of protocol type "ssh:"` |
| `custom(v)` | `(validator: Validator): this` | your check | your message |
| `optional()` | `(): UrlSchema<string\|undefined>` | — | — |
| `required()` | `(): UrlSchema<string>` | — | — |

## Base validation

`_isUrl` parses with `new URL(value)` inside a try/catch. If parsing throws (invalid URL) → `"${key|"url"}" is not a valid "URL"`. Protocol strings compared use the `URL.protocol` property, which **includes the trailing colon** (e.g. `"https:"`, `"ssh:"`).

## Examples

```typescript
import { url } from "jsr:@huuma/validate";

const site = url().http(); // https only (default)
site.validate("https://example.com"); // { value: "https://example.com", errors: undefined }
site.validate("http://example.com");  // errors: [{ message: '"url" is not of protocol type "https:"' }]
site.validate("not a url");            // errors: 2 entries — "is not a valid \"URL\"" and "is not of protocol type \"https:\"" (both _isUrl and _isHttp run, no short-circuit)

const anyHttp = url().http(false); // http or https
anyHttp.validate("http://example.com");     // passes
anyHttp.validate("ftp://example.com");       // fails

const ssh = url().protocol("ssh:");
ssh.validate("ssh://git@example.com/repo.git"); // passes
ssh.validate("https://example.com");            // fails

const any = url().optional();
any.validate(undefined); // { value: undefined, errors: undefined }
```

## JSON Schema

`{ type: "string", format: "uri" }`. The `http()`/`protocol()` constraints are **not** reflected in the JSON Schema output (no `pattern`).