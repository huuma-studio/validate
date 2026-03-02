import {
  type BaseProperty,
  BaseSchema,
  type Property,
  type Validation,
  type ValidationError,
} from "./schema.ts";

export class NullSchema extends BaseSchema<null> {
  #property: BaseProperty;
  constructor(
    { isRequired, validators }: Property = {
      isRequired: true,
      validators: [],
    },
  ) {
    const type = "null";
    const property: BaseProperty = {
      isRequired,
      validators: [...validators],
      baseValidators: [_isNull],
    };
    super(type, { type: "null" }, property);
    this.#property = property;
  }

  protected override create(property: Property): this {
    return new NullSchema(property) as this;
  }

  override validate(value: unknown, key?: string): Validation<null> {
    const result = this.#property.baseValidators[0](value, key);
    if (result?.message) {
      return {
        value: undefined,
        errors: [result],
      };
    }
    return {
      value: null,
      errors: undefined,
    };
  }
}

export function nil(): NullSchema {
  return new NullSchema();
}

function _isNull(
  value: unknown,
  key?: string,
): ValidationError | undefined {
  if (value === null) {
    return;
  }
  return {
    message: `"${key || "value"}" is not "null"`,
  };
}
