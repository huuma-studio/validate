import {
  BaseSchema,
  isDefined,
  required,
  type Schema,
  type Validation,
  type ValidationError,
} from "./schema.ts";

interface Keyable {
  [key: string]: unknown;
}

type KeyableSchema<T> = {
  [P in keyof T]: T[P] extends Schema<infer U> ? T[P] : never;
};

type SchemaType<T> = {
  [P in keyof T]: T[P] extends Schema<infer U> ? T[P]["type"] : never;
};

export class ObjectSchema<
  T extends KeyableSchema<T | undefined>,
> extends BaseSchema<SchemaType<T>> {
  constructor(
    private schema: T extends KeyableSchema<T extends undefined ? never : T> ? T
      : never,
  ) {
    super();
    this.validator(required("object")).validator(isObject);
  }

  required(): ObjectSchema<T> {
    this.property.isRequired = true;
    return this;
  }

  optional(): ObjectSchema<T | undefined> {
    this.property.isRequired = false;
    return <ObjectSchema<T | undefined>> this;
  }

  validate(toValidate: unknown, key?: string): Validation<SchemaType<T>> {
    const errors: ValidationError[] = [];
    const schemaType: Record<string, unknown> = {};
    if (this.property.isRequired || isDefined(toValidate)) {
      for (const validator of this.property.validators) {
        const result = validator(toValidate, key);
        if (result) errors.push(result);
      }
      for (const key in this.schema) {
        const toPush = isDefined(toValidate) && typeof toValidate !== "function"
          ? (<Keyable> toValidate)[key]
          : undefined;

        const { value, errors: validationErrors } = this.schema[key].validate(
          toPush,
          key,
        );

        if (validationErrors?.length) {
          errors.push(...validationErrors);
          continue;
        }
        schemaType[key] = value;
      }
    }
    if (errors.length) {
      return {
        value: undefined,
        errors,
      };
    }

    return {
      value: <SchemaType<T>> schemaType,
      errors: undefined,
    };
  }
}

function isObject(value: unknown, key?: string): ValidationError | undefined {
  if (isValidObject(value)) {
    return;
  }
  return { message: `"${key || "object"}" not type "object"` };
}

function isValidObject(value: unknown) {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}
