import { BaseSchema, type Validation } from "./schema.ts";

export class UnknownSchema extends BaseSchema<unknown> {
  constructor() {
    super("unknown");
  }

  override validate(value: unknown, _?: string): Validation<unknown> {
    return {
      value: <unknown> value,
      errors: undefined,
    };
  }
}

export function unknown(): UnknownSchema {
  return new UnknownSchema();
}
