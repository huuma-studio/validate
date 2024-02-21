import { Next } from "cargo/middleware/middleware.ts";
import type { Schema, ValidationError } from "../../schema.ts";
import type { RequestContext } from "cargo/http/request.ts";
import { BadRequestException } from "cargo/http/exceptions/bad-request-exception.ts";

export function validateBody(schema: Schema<unknown>) {
  return (ctx: RequestContext, next: Next) => {
    const errors = schema.validate(ctx.body, "Request Body").errors;
    if (errors?.length) {
      throwValidationException(errors);
    }
    return next(ctx);
  };
}

export function validateSearch(schema: Schema<unknown>) {
  return (ctx: RequestContext, next: Next) => {
    const errors = schema.validate(ctx.search, "Search Parameters").errors;
    if (errors?.length) {
      throwValidationException(errors);
    }
    return next(ctx);
  };
}

function throwValidationException(errors: ValidationError[]) {
  const exception = new BadRequestException();
  exception.error = errors.map((error) => {
    return `${error.message}`;
  });
  throw exception;
}
