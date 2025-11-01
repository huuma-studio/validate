import {
  type OptionalType,
  PrimitiveSchema,
  type Property,
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
  constructor(
    { validators, isRequired }: Property = { validators: [], isRequired: true },
  ) {
    const type = "boolean";
    const jsonSchema: BooleanJSONSchema = {
      type,
    };
    super(type, jsonSchema, {
      isRequired,
      validators: [...validators],
      baseValidators: [_isBoolean],
    });
  }

  protected override create(property: Property): this {
    return new BooleanSchema(property) as this;
  }

  true(): BooleanSchema<true> {
    return <BooleanSchema<true>> this.validator(_isTrue);
  }

  false(): BooleanSchema<false> {
    return <BooleanSchema<false>> this.validator(_isFalse);
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
