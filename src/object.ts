import {
  type BaseProperty,
  BaseSchema,
  type JSONSchema,
  type Property,
  required,
  type RequiredType,
  type Schema,
  toValidation,
  type Validation,
  type ValidationError,
} from "./schema.ts";

interface Keyable {
  [key: string]: unknown;
}

type KeyableSchema<T> = {
  [P in keyof T]: T[P] extends Schema<unknown> ? T[P] : never;
};

type SchemaType<T> = {
  [P in keyof T]: T[P] extends Schema<unknown> ? T[P]["infer"] : never;
};

type RequiredKeysJSONSchema<T> = {
  [K in keyof T]: T[K] extends BaseSchema<infer U>
    ? undefined extends BaseSchema<U>["infer"]
      ? never
      : K
    : never;
}[keyof T] &
  string;

type KeyableJSONSchema<T> = {
  [P in keyof T]: T[P] extends BaseSchema<unknown>
    ? undefined extends T[P]["infer"]
      ? undefined | ReturnType<T[P]["jsonSchema"]>
      : ReturnType<T[P]["jsonSchema"]>
    : never;
} & Record<string, JSONSchema>;

export interface ObjectJSONSchema<T> {
  type: "object";
  properties: KeyableJSONSchema<T>;
  required: RequiredKeysJSONSchema<T> extends never
    ? undefined
    : RequiredKeysJSONSchema<T>[];
}

export class ObjectSchema<T> extends BaseSchema<
  SchemaType<T>,
  ObjectJSONSchema<T>
> {
  #schema: T extends KeyableSchema<T extends undefined ? never : T> ? T : never;
  #property: BaseProperty;

  get schema(): T extends KeyableSchema<T extends undefined ? never : T>
    ? T
    : never {
    return this.#schema;
  }

  constructor(
    schema: T extends KeyableSchema<T extends undefined ? never : T>
      ? T
      : never,
    { validators, isRequired }: Property = { isRequired: true, validators: [] },
  ) {
    const type = "object";
    const jsonSchema: JSONSchema = {
      type,
      properties: Object.entries(schema).reduce(
        (acc, [key, value]) => {
          acc[key] = (<Schema<unknown>>value)?.jsonSchema();
          return acc;
        },
        {} as Record<string, JSONSchema>,
      ),
      required: Object.entries(schema).reduce((acc, [key, value]) => {
        if ((<Schema<unknown>>value)?.isRequired()) {
          acc.push(key);
        }
        return acc;
      }, [] as string[]),
    };

    const property: BaseProperty = {
      isRequired,
      validators: [...validators],
      baseValidators: [required(type), _isObject],
    };

    super(type, jsonSchema, property);
    this.#schema = schema;
    this.#property = property;
  }

  protected override create(property: Property): this {
    return new ObjectSchema(this.#schema, property) as this;
  }

  required(): ObjectSchema<RequiredType<T>> {
    return this.create({
      validators: [...this.#property.validators],
      isRequired: true,
    }) as ObjectSchema<RequiredType<T>>;
  }

  optional(): ObjectSchema<T | undefined> {
    return new ObjectSchema(this.#schema, {
      validators: [...this.#property.validators],
      isRequired: false,
    }) as ObjectSchema<T | undefined>;
  }

  validate(toValidate: unknown, key?: string): Validation<SchemaType<T>> {
    if (this.isSkipped(toValidate)) {
      return { value: <SchemaType<T>>toValidate, errors: undefined };
    }

    const errors = this.runValidators(toValidate, key);
    // Child errors are noise when the value itself is not an object
    if (!_isValidObject(toValidate)) {
      return { value: undefined, errors };
    }

    const schemaType: Record<string, unknown> = {};
    for (const key in this.#schema) {
      const { value, errors: validationErrors } = (<Schema<unknown>>(
        this.#schema[key]
      )).validate((<Keyable>toValidate)[key], key);

      if (validationErrors?.length) {
        errors.push(...validationErrors);
        continue;
      }
      schemaType[key] = value;
    }

    return toValidation(<SchemaType<T>>schemaType, errors);
  }
}

export function object<T extends KeyableSchema<T | undefined>>(
  schema: T extends KeyableSchema<T extends undefined ? never : T> ? T : never,
): ObjectSchema<T> {
  return new ObjectSchema(schema);
}

function _isObject(value: unknown, key?: string): ValidationError | undefined {
  if (_isValidObject(value)) {
    return;
  }
  return { message: `"${key || "object"}" not type "object"` };
}

function _isValidObject(value: unknown): value is Keyable {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}
