import {
  type BaseProperty,
  BaseSchema,
  isDefined,
  type Property,
  required,
  type Schema,
  type Validation,
  type ValidationError,
} from "./schema.ts";

export type ArrayJSONSchema<T extends Schema<unknown> | undefined> = {
  type: "array";
  items: T extends BaseSchema<infer U> ? ReturnType<T["jsonSchema"]> : never;
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
      // deno-lint-ignore no-explicit-any
      items: <any> schema.jsonSchema(),
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

  required(): ArraySchema<T> {
    return this.create({
      validators: [...this.#property.validators],
      isRequired: true,
    });
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
    const errors: ValidationError[] = [];

    if (this.#property.isRequired || isDefined(toValidate)) {
      const validators = [
        ...this.#property.baseValidators,
        ...this.#property.validators,
      ];
      for (const validator of validators) {
        const result = validator(toValidate, key);
        if (result) {
          errors.push(result);
        }
      }
      if (Array.isArray(toValidate)) {
        for (
          const [index, entry] of <IterableIterator<[number, unknown]>> (
            toValidate.entries()
          )
        ) {
          const validationErrors = this.schema.validate(
            entry,
            `array index ${index.toString()}`,
          ).errors;
          if (validationErrors?.length) {
            errors.push(...validationErrors);
          }
        }
      }
    }

    if (errors.length) {
      return {
        value: undefined,
        errors,
      };
    }

    return {
      value: <T extends Schema<unknown> ? T["infer"][] : undefined> toValidate,
      errors: undefined,
    };
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
