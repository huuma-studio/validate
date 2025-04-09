# Huuma/Validate

A lightweight, flexible validation library built with TypeScript. Designed to work seamlessly in browsers, Deno, Node.js, and any JavaScript environment, featuring minimal bundle size and tree-shakable imports.

## Features

- Strong TypeScript support with full type inference
- Intuitive, chainable API for building complex validation schemas
- Built-in validators for common data types:
  - Strings
  - Numbers
  - Booleans
  - Arrays
  - Objects
  - URLs
  - UUIDs
  - Enums
  - Literals
- Middleware utilities for Huuma/Route integration
- Clear, helpful validation error messages
- Extremely lightweight bundle size
- Tree-shakable architecture – import only what you need
- Runtime-agnostic – works in browsers, Deno, Node.js, and other JavaScript environments
- Zero dependencies

## Installation

### Using JSR (Deno)

```typescript
// Import the entire library
import * as validate from "jsr:@huuma/validate";

// Or import specific validators to reduce bundle size
import { StringSchema, NumberSchema, ObjectSchema } from "jsr:@huuma/validate";

// Import individual validators directly for maximum tree-shaking
import { StringSchema } from "jsr:@huuma/validate/string";
import { NumberSchema } from "jsr:@huuma/validate/number";
import { ObjectSchema } from "jsr:@huuma/validate/object";
import { BooleanSchema } from "jsr:@huuma/validate/boolean";
```

### Using npm (Node.js, Browsers)

```bash
npx jsr add @huuma/validate
```

Then import:

```typescript
// Import the entire library
import * as validate from "@huuma/validate";

// Or import specific validators
import { StringSchema, NumberSchema } from "@huuma/validate";
```

## Basic Usage

```typescript
import { StringSchema, NumberSchema, ObjectSchema } from "jsr:@huuma/validate";

// Define a schema
const userSchema = new ObjectSchema({
  username: new StringSchema().notEmpty(),
  email: new StringSchema().regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/),
  age: new NumberSchema().min(18),
});

// Validate data
const result = userSchema.validate({
  username: "john_doe",
  email: "john@example.com",
  age: 25
});

// Check if validation passed
if (result.errors) {
  console.error("Validation failed:", result.errors);
} else {
  // Use the validated data
  const validatedUser = result.value;
  console.log("Valid user:", validatedUser);
}

// Alternative: Use parse method (throws error on invalid data)
try {
  const validatedUser = userSchema.parse({
    username: "john_doe",
    email: "john@example.com",
    age: 25
  });
  console.log("Valid user:", validatedUser);
} catch (error) {
  console.error("Validation failed:", error);
}
```

## Validation Types

### String Validation

```typescript
import { StringSchema } from "jsr:@huuma/validate";

const schema = new StringSchema()
  .notEmpty()        // String must not be empty
  .startsWith("http") // String must start with "http"
  .endsWith(".com")  // String must end with ".com"
  .regex(/^[a-z]+$/) // String must match the regex pattern
  .equals("value")   // String must equal "value"
  .notEquals("bad")  // String must not equal "bad"
  .optional();       // Value can be undefined
```

### Number Validation

```typescript
import { NumberSchema } from "jsr:@huuma/validate";

const schema = new NumberSchema()
  .positive()      // Number must be positive (>= 1)
  .negative()      // Number must be negative (< 0)
  .min(10)         // Number must be >= 10
  .max(100)        // Number must be <= 100
  .equals(42)      // Number must equal 42
  .optional();     // Value can be undefined
```

### Boolean Validation

```typescript
import { BooleanSchema } from "jsr:@huuma/validate";

const schema = new BooleanSchema()
  .true()       // Must be true
  .optional();  // Value can be undefined

// Or
const falseSchema = new BooleanSchema()
  .false();     // Must be false
```

### Array Validation

```typescript
import { ArraySchema, StringSchema } from "jsr:@huuma/validate";

// Array of strings
const schema = new ArraySchema(new StringSchema().notEmpty())
  .optional();  // The array itself can be undefined
```

### Object Validation

```typescript
import { ObjectSchema, StringSchema, NumberSchema } from "jsr:@huuma/validate";

const schema = new ObjectSchema({
  name: new StringSchema().notEmpty(),
  age: new NumberSchema().min(18),
  email: new StringSchema().optional(),
});
```

### URL Validation

```typescript
import { URLSchema } from "jsr:@huuma/validate";

const schema = new URLSchema()
  .http(true)  // Must be HTTPS (pass false to allow HTTP or HTTPS)
  .optional();

// Or validate specific protocols
const sshSchema = new URLSchema()
  .protocol("ssh:");
```

### UUID Validation

```typescript
import { UUIDSchema } from "jsr:@huuma/validate";

// Any UUID version
const schema = new UUIDSchema();

// Specific UUID version
const uuidV4Schema = new UUIDSchema("4");  // Only UUID v4
const uuidV1Schema = new UUIDSchema("1");  // Only UUID v1
```

### Enum Validation

```typescript
import { EnumSchema } from "jsr:@huuma/validate";

// String enum
const roleSchema = new EnumSchema(["admin", "user", "guest"]);

// Number enum
const statusSchema = new EnumSchema([200, 400, 500]);
```

### Literal Validation

```typescript
import { LiteralSchema } from "jsr:@huuma/validate";

// Must exactly match the literal value
const schema = new LiteralSchema("active");
const numSchema = new LiteralSchema(42);
```

## Bundle Size Optimization

For applications where bundle size is critical, use direct imports to benefit from tree-shaking:

```typescript
// Only import what you need
import { StringSchema } from "@huuma/validate/string";
import { NumberSchema } from "@huuma/validate/number";

// This ensures unused validators aren't included in your bundle
```

Each validator is completely independent, allowing for minimal overhead when only specific validation types are needed. This approach works in all JavaScript environments and is particularly valuable for browser applications.

## Integration with Huuma/Route

The library provides middleware for easy integration with Huuma/Route applications:

```typescript
import { validateBody, validateSearch } from "jsr:@huuma/validate/middleware";
import { StringSchema, ObjectSchema } from "jsr:@huuma/validate";

import { App } from "@huuma/route";

const app = new App();

// Define schemas
const searchParamsSchema = new ObjectSchema({
  page: new StringSchema().optional(),
  limit: new StringSchema().optional(),
});

const userSchema = new ObjectSchema({
  username: new StringSchema().notEmpty(),
  email: new StringSchema().notEmpty(),
});

// Apply validation middleware
app.post("/users",
  validateSearch(searchParamsSchema),  // Validates search parameters
  validateBody(userSchema),            // Validates request body
  (ctx) => {
    // At this point, both ctx.search and ctx.body are validated
    // If validation fails, an appropriate HTTP error is returned automatically
    return Response.json({ success: true });
  }
);
```

## Custom Validators

You can add custom validators to any schema:

```typescript
import { StringSchema } from "jsr:@huuma/validate";

const schema = new StringSchema().custom((value, key) => {
  if (value === "forbidden_value") {
    return {
      message: `"${key || 'string'}" contains a forbidden value`
    };
  }
  // Return undefined when validation passes
  return undefined;
});
```

## Error Handling

Validation errors have a consistent format:

```typescript
// Example validation errors
[
  { message: '"username" is empty' },
  { message: '"email" is not type "string"' },
  { message: '"age" is smaller than 18' }
]
```

## License

MIT
