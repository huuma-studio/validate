import { BaseSchema, type Validation, type ValidationError } from "./schema.ts";

export class UndefinedSchema extends BaseSchema<undefined> {
  constructor() {
    super("undefined");
  }

  override validate(value: unknown, key?: string): Validation<undefined> {
    const result = isUndefined(value, key);
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

function isUndefined(
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

export const Undefined = UndefinedSchema;

const isIts = new Undefined().parse(null);
console.log(isIts);
