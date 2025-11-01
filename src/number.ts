import {
  type BaseProperty,
  type OptionalType,
  PrimitiveSchema,
  type Property,
  type RequiredType,
  type ValidationError,
  type Validator,
} from "./schema.ts";

export type NumberJSONSchema = {
  type: "number";
};

export class NumberSchema<T = number> extends PrimitiveSchema<
  T,
  NumberSchema<RequiredType<T>>,
  NumberSchema<OptionalType<T>>,
  NumberJSONSchema
> {
  constructor(
    { isRequired, validators }: Property = { isRequired: true, validators: [] },
  ) {
    const type = "number";
    const jsonSchema: NumberJSONSchema = {
      type,
    };

    const property: BaseProperty = {
      isRequired,
      validators: [...validators],
      baseValidators: [_isNumber],
    };

    super(type, jsonSchema, property);
  }

  protected override create(property: Property): this {
    return new NumberSchema(property) as this;
  }

  positive(): this {
    return this.validator(_isPositive);
  }

  negative(): this {
    return this.validator(_isNegative);
  }

  equals(to: number): this {
    return this.validator(_isEquals(to));
  }

  min(like: number): this {
    return this.validator(_isMin(like));
  }

  max(like: number): this {
    return this.validator(_isMax(like));
  }
}

export function number(): NumberSchema {
  return new NumberSchema();
}

function _isNumber(value: unknown, key?: string): ValidationError | undefined {
  if (_isFiniteNumber(value)) {
    return;
  }
  return {
    message: `"${key || "number"}" is not type "number"`,
  };
}

function _isPositive(
  value: unknown,
  key?: string,
): ValidationError | undefined {
  if (_isFiniteNumber(value) && <number> value >= 1) {
    return;
  }
  return {
    message: `"${key || "number"}" is not positive`,
  };
}

function _isNegative(
  value: unknown,
  key?: string,
): ValidationError | undefined {
  if (_isFiniteNumber(value) && <number> value < 0) {
    return;
  }
  return {
    message: `"${key || "number"}" is not negative`,
  };
}

function _isEquals(to: number): Validator {
  return (value: unknown, key?: string) => {
    if (value === to) {
      return;
    }
    return {
      message: `"${key || "number"}" is not equals ${to}`,
    };
  };
}

function _isMin(is: number): Validator {
  return (value: unknown, key?: string) => {
    if (_isFiniteNumber(value) && <number> value >= is) {
      return;
    }
    return {
      message: `"${key || "number"}" is smaller than ${is}`,
    };
  };
}

function _isMax(is: number): Validator {
  return (value: unknown, key?: string) => {
    if (_isFiniteNumber(value) && <number> value <= is) {
      return;
    }
    return {
      message: `"${key || "number"}" is bigger than ${is}`,
    };
  };
}

function _isFiniteNumber(value: unknown) {
  if (typeof value !== "number") {
    return false;
  }
  return Number.isFinite(value);
}
