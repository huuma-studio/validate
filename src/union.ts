import {
  BaseSchema,
  type Schema,
  type Validation,
  type ValidationError,
} from "./schema.ts";

type SchemaType<S> = S extends Schema<infer T> ? T : never;

export class UnionSchema<
  T extends ReadonlyArray<
    T[number] extends Schema<unknown> ? T[number] : never
  >,
> extends BaseSchema<SchemaType<T[number]>> {
  private schemas: T;

  constructor(schemas: T) {
    super(`union:${schemas.map((s) => s?.toString()).join(",")}`);
    this.schemas = schemas;
  }

  validate(value: unknown): Validation<SchemaType<T[number]>> {
    const validations: Validation<unknown>[] = [];
    for (const schema of this.schemas) {
      if (schema instanceof BaseSchema) {
        validations.push(schema.validate(value));
      }
    }

    const passedValidations = validations.filter((v) => !v.errors?.length);

    if (passedValidations.length) {
      return { value: <SchemaType<T[number]>> value, errors: undefined };
    }

    return {
      value: undefined,
      errors: <ValidationError[]> validations
        .filter((v) => v.errors?.length)
        .map((e) => e.errors)
        .flat(),
    };
  }
}

export function union<
  T extends ReadonlyArray<
    T[number] extends Schema<unknown> ? T[number] : never
  >,
>(schemas: T): UnionSchema<T> {
  return new UnionSchema(schemas);
}
