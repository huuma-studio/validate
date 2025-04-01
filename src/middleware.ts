import { BadRequestException } from "@huuma/route/http/exception/bad-request-exception";
import type { RequestContext } from "@huuma/route/http/request";
import type { Middleware, Next } from "@huuma/route/middleware";
import type { Schema, ValidationError } from "./schema.ts";

export function validateBody(schema: Schema<unknown>): Middleware {
  return (ctx: RequestContext, next: Next) => {
    const errors = schema.validate(ctx.body, "Request Body").errors;
    if (errors?.length) {
      throwValidationException(errors);
    }
    return next();
  };
}

export function validateSearch(schema: Schema<unknown>): Middleware {
  return (ctx: RequestContext, next: Next) => {
    const errors = schema.validate(ctx.search, "Search Parameters").errors;
    if (errors?.length) {
      throwValidationException(errors);
    }
    return next();
  };
}

function throwValidationException(errors: ValidationError[]): void {
  const exception = new BadRequestException();
  exception.error = errors.map((error) => {
    return `${error.message}`;
  });
  throw exception;
}
