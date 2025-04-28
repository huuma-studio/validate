import {
  BaseSchema,
  isDefined,
  type Property,
  required,
  type Schema,
  type Validation,
  type ValidationError,
} from "./schema.ts";

type ArrayJSONSchema<T extends Schema<unknown> | undefined> = {
  type: "array";
  items: T extends BaseSchema<infer U> ? ReturnType<T["jsonSchema"]>
    : never;
};

export class ArraySchema<
  T extends Schema<unknown> | undefined,
> extends BaseSchema<
  T extends Schema<unknown> ? T["infer"][] : undefined,
  ArrayJSONSchema<T>
> {
  #jsonSchema: ArrayJSONSchema<T>;
  #property: Property;
  constructor(private schema: T extends undefined ? never : T) {
    const type = "array";
    const jsonSchema: ArrayJSONSchema<T> = {
      type,
      // deno-lint-ignore no-explicit-any
      items: <any> schema.jsonSchema(),
    };
    const property: Property = {
      isRequired: true,
      validators: [required(type), _isArray],
    };

    super(type, jsonSchema, property);
    this.#jsonSchema = jsonSchema;
    this.#property = property;
  }

  required(): ArraySchema<T> {
    this.#property.isRequired = true;
    return this;
  }

  optional(): ArraySchema<T | undefined> {
    this.#property.isRequired = false;
    return this;
  }

  validate(
    toValidate: unknown,
    key?: string,
  ): Validation<T extends Schema<unknown> ? T["infer"][] : undefined> {
    const errors: ValidationError[] = [];

    if (this.#property.isRequired || isDefined(toValidate)) {
      for (const validator of this.#property.validators) {
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

export function array<
  T extends Schema<unknown> | undefined,
>(
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
