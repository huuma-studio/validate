import {
  BaseSchema,
  isDefined,
  type Property,
  required,
  type Schema,
  type Validation,
  type ValidationError,
} from "./schema.ts";

type SchemaType<S> = S extends Schema<infer T> ? T : never;

type UnionJSONSchema<T extends ReadonlyArray<Schema<unknown>>> = {
  oneOf: T extends Array<Schema<infer U>>
    ? Array<ReturnType<T[number]["jsonSchema"]>>
    : never;
};

export class UnionSchema<
  T extends ReadonlyArray<
    T[number] extends Schema<unknown> ? T[number] : never
  >,
> extends BaseSchema<SchemaType<T[number]>, UnionJSONSchema<T>> {
  #schemas: T;
  #property: Property;

  constructor(schemas: T) {
    const type = `union:${schemas.map((s) => s?.toString()).join(",")}`;
    const jsonSchema: UnionJSONSchema<T> = {
      oneOf: schemas.map((s) => {
        if (s instanceof BaseSchema) {
          return s.jsonSchema();
        }
        throw Error("Schema not supported");
        // deno-lint-ignore no-explicit-any
      }) as any,
    };
    const property: Property = {
      isRequired: true,
      validators: [required(type)],
    };
    super(
      type,
      jsonSchema,
      property,
    );
    this.#schemas = schemas;
    this.#property = property;
  }

  validate(value: unknown): Validation<SchemaType<T[number]>> {
    const validations: Validation<unknown>[] = [];

    if (this.#property.isRequired || isDefined(value)) {
      for (const schema of this.#schemas) {
        if (schema instanceof BaseSchema) {
          validations.push(schema.validate(value));
        }
      }
    }

    if (
      // At least 1 validation passes
      validations.filter((v) => !v.errors?.length).length ||
      // or no validation fails (in case its not required)
      validations.filter((v) => v.errors?.length).length === 0
    ) {
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
