import {
  type BaseProperty,
  BaseSchema,
  type Property,
  required,
  type Schema,
  toValidation,
  type Validation,
  type ValidationError,
} from "./schema.ts";

export type ArrayJSONSchema<T extends Schema<unknown> | undefined> = {
  type: "array";
  items: T extends BaseSchema<unknown> ? ReturnType<T["jsonSchema"]> : never;
};

export class ArraySchema<
  T extends Schema<unknown> | undefined,
> extends BaseSchema<
  T extends Schema<unknown> ? T["infer"][] : undefined,
  ArrayJSONSchema<T>
> {
  readonly #property: BaseProperty;

  constructor(
    private schema: T extends undefined ? never : T,
    { validators, isRequired }: Property = {
      validators: [],
      isRequired: true,
    },
  ) {
    const type = "array";
    const jsonSchema: ArrayJSONSchema<T> = {
      type,
      items: <ArrayJSONSchema<T>["items"]>schema.jsonSchema(),
    };

    const property: BaseProperty = {
      isRequired,
      validators: [...validators],
      baseValidators: [required(type), _isArray],
    };
    super(type, jsonSchema, property);
    this.#property = property;
  }

  protected override create(property: Property): this {
    return new ArraySchema(this.schema, property) as this;
  }

  required(): ArraySchema<Exclude<T, undefined>> {
    return this.create({
      validators: [...this.#property.validators],
      isRequired: true,
    }) as unknown as ArraySchema<Exclude<T, undefined>>;
  }

  optional(): ArraySchema<T | undefined> {
    return this.create({
      validators: [...this.#property.validators],
      isRequired: false,
    });
  }

  validate(
    toValidate: unknown,
    key?: string,
  ): Validation<T extends Schema<unknown> ? T["infer"][] : undefined> {
    if (this.isSkipped(toValidate)) {
      return {
        value: <T extends Schema<unknown> ? T["infer"][] : undefined>toValidate,
        errors: undefined,
      };
    }

    const errors = this.runValidators(toValidate, key);
    const validatedItems: unknown[] = [];
    if (Array.isArray(toValidate)) {
      for (const [index, entry] of <IterableIterator<[number, unknown]>>(
        toValidate.entries()
      )) {
        const { value: validatedEntry, errors: validationErrors } =
          this.schema.validate(entry, `array index ${index.toString()}`);
        if (validationErrors?.length) {
          errors.push(...validationErrors);
        } else {
          validatedItems.push(validatedEntry);
        }
      }
    }

    return toValidation(
      <T extends Schema<unknown> ? T["infer"][] : undefined>validatedItems,
      errors,
    );
  }
}

export function array<T extends Schema<unknown> | undefined>(
  schema: T extends undefined ? never : T,
): ArraySchema<T> {
  return new ArraySchema(schema);
}

function _isArray(value: unknown, key?: string): ValidationError | undefined {
  if (Array.isArray(value)) {
    return;
  }
  return { message: `"${key || "array"}" not type "array"` };
}
