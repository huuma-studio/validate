import {
  type OptionalType,
  PrimitiveSchema,
  type RequiredType,
  type ValidationError,
  type Validator,
} from "./schema.ts";

type NumberJSONSchema = {
  type: "number";
};

export class NumberSchema<T = number> extends PrimitiveSchema<
  T,
  NumberSchema<RequiredType<T>>,
  NumberSchema<OptionalType<T>>,
  NumberJSONSchema
> {
  #jsonSchema: NumberJSONSchema;
  constructor() {
    const type = "number";
    const jsonSchema: NumberJSONSchema = {
      type,
    };
    super(type, jsonSchema);
    this.validator(_isNumber);
    this.#jsonSchema = jsonSchema;
  }

  positive(): this {
    this.validator(_isPositive);
    return this;
  }

  negative(): this {
    this.validator(_isNegative);
    return this;
  }

  equals(to: number): this {
    this.validator(_isEquals(to));
    return this;
  }

  min(like: number): this {
    this.validator(_isMin(like));
    return this;
  }

  max(like: number): this {
    this.validator(_isMax(like));
    return this;
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
