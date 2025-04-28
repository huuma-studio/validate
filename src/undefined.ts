import {
  BaseSchema,
  type Property,
  type Validation,
  type ValidationError,
} from "./schema.ts";

export class UndefinedSchema extends BaseSchema<undefined, { type: "null" }> {
  #property: Property;
  constructor() {
    const type = "undefined";
    const property: Property = {
      isRequired: true,
      validators: [_isUndefined],
    };
    // TODO: Whats the correct way to handle undefined values in json schema?
    super(type, { type: "null" }, property);
    this.#property = property;
  }

  override validate(value: unknown, key?: string): Validation<undefined> {
    const result = this.#property.validators[0](value, key);
    if (result?.message) {
      return {
        value: undefined,
        errors: [result],
      };
    }
    return {
      value: undefined,
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
