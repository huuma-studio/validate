import {
  BaseSchema,
  isDefined,
  type JSONSchema,
  type Property,
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
  [P in keyof T]: T[P] extends Schema<infer U> ? T[P]["infer"] : never;
};

export class ObjectSchema<
  T extends KeyableSchema<T | undefined>,
> extends BaseSchema<SchemaType<T>> {
  #schema: T extends KeyableSchema<T extends undefined ? never : T> ? T
    : never;
  #jsonSchema: JSONSchema;
  #property: Property;

  get schema(): T extends KeyableSchema<T extends undefined ? never : T> ? T
    : never {
    return this.#schema;
  }

  constructor(
    schema: T extends KeyableSchema<T extends undefined ? never : T> ? T
      : never,
  ) {
    const type = "object";
    const jsonSchema: JSONSchema = {
      type,
      properties: Object.entries(schema).reduce((acc, [key, value]) => {
        acc[key] = (<Schema<unknown>> value)?.jsonSchema();
        return acc;
      }, {} as Record<string, JSONSchema>),
      required: Object.entries(schema).reduce((acc, [key, value]) => {
        if ((<Schema<unknown>> value)?.isRequired()) {
          acc.push(key);
        }
        return acc;
      }, [] as string[]),
    };
    const property: Property = {
      isRequired: true,
      validators: [required(type), _isObject],
    };
    super(type, jsonSchema, property);
    this.#schema = schema;
    this.#jsonSchema = jsonSchema;
    this.#property = property;
  }

  required(): ObjectSchema<T> {
    this.#property.isRequired = true;
    return this;
  }

  optional(): ObjectSchema<T | undefined> {
    this.#property.isRequired = false;
    return <ObjectSchema<T | undefined>> this;
  }

  validate(toValidate: unknown, key?: string): Validation<SchemaType<T>> {
    const errors: ValidationError[] = [];
    const schemaType: Record<string, unknown> = {};
    if (this.#property.isRequired || isDefined(toValidate)) {
      for (const validator of this.#property.validators) {
        const result = validator(toValidate, key);
        if (result) errors.push(result);
      }
      for (const key in this.#schema) {
        const toPush = isDefined(toValidate) && typeof toValidate !== "function"
          ? (<Keyable> toValidate)[key]
          : undefined;

        const { value, errors: validationErrors } = this.#schema[key].validate(
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

export function object<T extends KeyableSchema<T | undefined>>(
  schema: T extends KeyableSchema<T extends undefined ? never : T> ? T
    : never,
): ObjectSchema<
  T
> {
  return new ObjectSchema(schema);
}

function _isObject(value: unknown, key?: string): ValidationError | undefined {
  if (_isValidObject(value)) {
    return;
  }
  return { message: `"${key || "object"}" not type "object"` };
}

function _isValidObject(value: unknown) {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}
