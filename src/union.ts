import {
  type BaseProperty,
  BaseSchema,
  type Property,
  type Schema,
  type Validation,
  type ValidationError,
} from "./schema.ts";

type SchemaType<S> = S extends Schema<infer T> ? T : never;

export type UnionJSONSchema<T extends ReadonlyArray<Schema<unknown>>> = {
  anyOf: Array<ReturnType<T[number]["jsonSchema"]>>;
};

export class UnionSchema<
  T extends ReadonlyArray<Schema<unknown>>,
> extends BaseSchema<SchemaType<T[number]>, UnionJSONSchema<T>> {
  #schemas: T;

  constructor(
    schemas: T,
    { isRequired, validators }: Property = { isRequired: true, validators: [] },
  ) {
    const type = `union:${schemas.map((s) => s?.toString()).join(",")}`;
    const jsonSchema: UnionJSONSchema<T> = {
      anyOf: schemas.map((s) => {
        if (s instanceof BaseSchema) {
          return s.jsonSchema();
        }
        throw Error("Schema not supported");
      }) as UnionJSONSchema<T>["anyOf"],
    };
    const property: BaseProperty = {
      isRequired,
      validators: [...validators],
      baseValidators: [],
    };
    super(type, jsonSchema, property);
    this.#schemas = schemas;
  }

  protected override create(property: Property): this {
    return new UnionSchema(this.#schemas, property) as this;
  }

  /**
   * The union is required unless it or one of its members is optional. Only
   * the union's own flag skips validation; members always decide for
   * themselves whether they accept `undefined`.
   */
  override isRequired(): boolean {
    return (
      super.isRequired() && this.#schemas.every((schema) => schema.isRequired())
    );
  }

  /**
   * Returns the value of the first member that accepts it. When no member
   * does, returns every distinct member error.
   */
  override validate(
    value: unknown,
    key?: string,
  ): Validation<SchemaType<T[number]>> {
    if (this.isSkipped(value)) {
      return { value: <SchemaType<T[number]>>value, errors: undefined };
    }

    if (!this.#schemas.length) {
      return {
        value: undefined,
        errors: [
          { message: `"${key || "union"}" cannot match an empty union` },
        ],
      };
    }

    const errors: ValidationError[] = [];
    for (const schema of this.#schemas) {
      const validation = schema.validate(value, key);
      if (!validation.errors?.length) {
        return {
          value: <SchemaType<T[number]>>validation.value,
          errors: undefined,
        };
      }
      for (const error of validation.errors) {
        if (!errors.some(({ message }) => message === error.message)) {
          errors.push(error);
        }
      }
    }

    return { value: undefined, errors };
  }
}

export function union<T extends ReadonlyArray<Schema<unknown>>>(
  schemas: T,
): UnionSchema<T> {
  return new UnionSchema(schemas);
}
