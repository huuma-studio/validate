import {
  type BaseProperty,
  BaseSchema,
  type Property,
  type Validation,
  type ValidationError,
} from "./schema.ts";

interface UndefinedProperty extends Property {
  allowNull?: boolean;
}

export class UndefinedSchema<T extends null | undefined = undefined>
  extends BaseSchema<T> {
  #property: BaseProperty;
  constructor(
    { isRequired, validators, allowNull }: UndefinedProperty = {
      isRequired: true,
      validators: [],
      allowNull: false,
    },
  ) {
    const type = "undefined";
    const property: BaseProperty = {
      isRequired,
      validators: [...validators],
      baseValidators: [allowNull ? _isUndefinedOrNull : _isUndefined],
    };
    // TODO: Whats the correct way to handle undefined values in json schema?
    super(type, { type: "null" }, property);
    this.#property = property;
  }

  protected override create(property: Property): this {
    return new UndefinedSchema(property) as this;
  }

  override validate(value: unknown, key?: string): Validation<T> {
    const result = this.#property.baseValidators[0](value, key);
    if (result?.message) {
      return {
        value: undefined,
        errors: [result],
      };
    }
    return {
      value: value as T,
      errors: undefined,
    };
  }

  orNull(): UndefinedSchema<null | undefined> {
    return new UndefinedSchema({
      ...this.#property,
      allowNull: true,
    });
  }
}

export function undef(): UndefinedSchema<undefined> {
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

function _isUndefinedOrNull(
  value: unknown,
  key?: string,
): ValidationError | undefined {
  if (value == null) {
    return;
  }
  return {
    message: `"${key || "value"}" is not "undefined" or "null"`,
  };
}
