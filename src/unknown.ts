import {
  type BaseProperty,
  BaseSchema,
  type JSONSchema,
  jsonSchemaTypes,
  type Property,
  type Validation,
} from "./schema.ts";

export class UnknownSchema extends BaseSchema<unknown> {
  constructor(
    { isRequired = false, validators = [] }: Property = {
      isRequired: false,
      validators: [],
    },
  ) {
    const jsonSchema: JSONSchema = {
      type: [...jsonSchemaTypes],
    };
    const property: BaseProperty = {
      isRequired,
      validators: [...validators],
      baseValidators: [],
    };
    super("unknown", jsonSchema, property);
  }

  protected override create(property: Property): this {
    return new UnknownSchema(property) as this;
  }

  validate(value: unknown, _?: string): Validation<unknown> {
    return {
      value: <unknown> value,
      errors: undefined,
    };
  }
}

export function unknown(): UnknownSchema {
  return new UnknownSchema();
}
