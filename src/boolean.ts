import {
  type OptionalType,
  PrimitiveSchema,
  type RequiredType,
  type ValidationError,
} from "./schema.ts";

export type BooleanJSONSchema = {
  type: "boolean";
};

export class BooleanSchema<T = boolean> extends PrimitiveSchema<
  T,
  BooleanSchema<RequiredType<T>>,
  BooleanSchema<OptionalType<T>>,
  BooleanJSONSchema
> {
  #jsonSchema: BooleanJSONSchema;

  constructor() {
    const type = "boolean";
    const jsonSchema: BooleanJSONSchema = {
      type,
    };
    super(type, jsonSchema);
    this.#jsonSchema = jsonSchema;
    this.validator(_isBoolean);
  }

  true(): BooleanSchema<true> {
    this.validator(_isTrue);
    return <BooleanSchema<true>> this;
  }

  false(): BooleanSchema<false> {
    this.validator(_isFalse);
    return <BooleanSchema<false>> this;
  }
}

export function boolean(): BooleanSchema {
  return new BooleanSchema();
}

function _isBoolean(value: unknown, key?: string): ValidationError | undefined {
  if (typeof value === "boolean") {
    return;
  }
  return {
    message: `"${key || "boolean"}" is not type "boolean"`,
  };
}

function _isTrue(value: unknown, key?: string): ValidationError | undefined {
  if (value === true) {
    return;
  }
  return {
    message: `"${key || "boolean"}" is not "true"`,
  };
}

function _isFalse(value: unknown, key?: string): ValidationError | undefined {
  if (value === false) {
    return;
  }
  return {
    message: `"${key || "boolean"}" is not "false"`,
  };
}
