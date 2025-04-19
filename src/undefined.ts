import { BaseSchema, type Validation, type ValidationError } from "./schema.ts";

export class UndefinedSchema extends BaseSchema<undefined> {
  constructor() {
    super("undefined");
  }

  override validate(value: unknown, key?: string): Validation<undefined> {
    const result = _isUndefined(value, key);
    if (result?.message) {
      return {
        value: undefined,
        errors: [result],
      };
    }
    return {
      value: <undefined> value,
      errors: undefined,
    };
  }
}

export function undef(): UndefinedSchema {
  return new UndefinedSchema();
}

function _isUndefined(
  value: unknown,
  key?: string,
): ValidationError | undefined {
  if (value === undefined) {
    return;
  }
  return {
    message: `"${key || "value"}" is not "undefined"`,
  };
}
