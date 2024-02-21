import {
  BaseSchema,
  isDefined,
  required,
  Schema,
  Validation,
  ValidationError,
} from "../schema.ts";

export class ArraySchema<
  T extends Schema<unknown> | undefined,
> extends BaseSchema<T extends Schema<unknown> ? T["type"][] : undefined> {
  constructor(private schema: T extends undefined ? never : T) {
    super();
    this.validator(required("array")).validator(isArray);
  }

  required() {
    this.property.isRequired = true;
    return <ArraySchema<T>> this;
  }

  optional() {
    this.property.isRequired = false;
    return <ArraySchema<T | undefined>> this;
  }

  validate(
    toValidate: unknown,
    key?: string,
  ): Validation<T extends Schema<unknown> ? T["type"][] : undefined> {
    const errors: ValidationError[] = [];

    if (this.property.isRequired || isDefined(toValidate)) {
      for (const validator of this.property.validators) {
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
      value: <T extends Schema<unknown> ? T["type"][] : undefined> toValidate,
      errors: undefined,
    };
  }
}

function isArray(value: unknown, key?: string): ValidationError | undefined {
  if (Array.isArray(value)) {
    return;
  }
  return { message: `"${key || "array"}" not type "array"` };
}
