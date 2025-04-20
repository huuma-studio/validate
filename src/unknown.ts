import {
  BaseSchema,
  type JSONSchema,
  jsonSchemaTypes,
  type Property,
  type Validation,
} from "./schema.ts";

export class UnknownSchema extends BaseSchema<unknown> {
  readonly #jsonSchema: JSONSchema;
  readonly #property: Property;
  constructor() {
    const jsonSchema: JSONSchema = {
      type: [...jsonSchemaTypes],
    };
    const property: Property = { isRequired: false, validators: [] };
    super("unknown", jsonSchema, property);
    this.#jsonSchema = jsonSchema;
    this.#property = property;
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
