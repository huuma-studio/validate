import {
  type OptionalType,
  PrimitiveSchema,
  type RequiredType,
  type ValidationError,
} from "./schema.ts";

export class BooleanSchema<T = boolean> extends PrimitiveSchema<
  T,
  BooleanSchema<RequiredType<T>>,
  BooleanSchema<OptionalType<T>>
> {
  constructor() {
    super("boolean");
    this.validator(isBoolean);
  }

  true(): this {
    this.validator(isTrue);
    return this;
  }

  false(): this {
    this.validator(isFalse);
    return this;
  }
}

function isBoolean(value: unknown, key?: string): ValidationError | undefined {
  if (typeof value === "boolean") {
    return;
  }
  return {
    message: `"${key || "boolean"}" is not type "boolean"`,
  };
}

function isTrue(value: unknown, key?: string): ValidationError | undefined {
  if (value === true) {
    return;
  }
  return {
    message: `"${key || "boolean"}" is not "true"`,
  };
}

function isFalse(value: unknown, key?: string): ValidationError | undefined {
  if (value === false) {
    return;
  }
  return {
    message: `"${key || "boolean"}" is not "false"`,
  };
}
