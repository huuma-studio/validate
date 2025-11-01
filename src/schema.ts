export type Validator = (
  value: unknown,
  key?: string,
) => ValidationError | undefined;

export type Validation<T> = SuccessfulValidation<T> | FailedValidation;

export interface SuccessfulValidation<T> {
  value: T;
  errors: undefined;
}
export interface FailedValidation {
  value: undefined;
  errors: ValidationError[];
}

export interface ValidationError {
  message: string;
}

export interface Property {
  validators: Validator[];
  isRequired: boolean;
}

export interface BaseProperty extends Property {
  baseValidators: Validator[];
}

export type OptionalType<T> = T extends undefined ? T : T | undefined;
export type RequiredType<T> = T extends undefined ? never
  : Exclude<T, undefined>;

export interface Schema<T, J extends JSONSchema = JSONSchema> {
  validate(value: unknown, key?: string): Validation<T>;
  infer: T;
  jsonSchema(): J;
  isRequired(): boolean;
}

export abstract class BaseSchema<T, J extends JSONSchema = JSONSchema>
  implements Schema<T, J> {
  readonly #jsonSchema: JSONSchema;
  readonly #type: string;
  readonly #property: BaseProperty;

  readonly infer!: T;

  constructor(type: string, jsonSchema: JSONSchema, property: BaseProperty) {
    this.#type = type;
    this.#jsonSchema = jsonSchema;
    this.#property = property;
  }

  toString(): string {
    return this.#type;
  }

  protected abstract create(property: Property): this;

  protected validator(validator: Validator): this {
    const property: Property = {
      isRequired: this.#property.isRequired,
      validators: [...this.#property.validators, validator],
    };
    return this.create(property);
  }

  abstract validate(value: unknown, key?: string): Validation<T>;

  parse(value: unknown): T {
    const { value: validated, errors } = this.validate(value);
    if (errors) {
      throw new ValidationException(errors);
    }
    return validated;
  }

  jsonSchema(): J {
    return <J> this.#jsonSchema;
  }

  isRequired(): boolean {
    return this.#property.isRequired;
  }
}

export abstract class PrimitiveSchema<
  T,
  R,
  O,
  J extends JSONSchema,
> extends BaseSchema<T, J> {
  readonly #property: BaseProperty;
  constructor(
    type: string,
    jsonSchema: JSONSchema,
    { isRequired, validators, baseValidators }: BaseProperty,
  ) {
    const property = {
      validators: [...validators],
      isRequired,
      baseValidators: [required(type), ...baseValidators],
    };
    super(type, jsonSchema, property);
    this.#property = property;
  }

  custom(validator: Validator): this {
    return this.validator(validator);
  }

  required(): R {
    const property: Property = {
      validators: [...this.#property.validators],
      isRequired: true,
    };
    return <R> (<unknown> this.create(property));
  }

  optional(): O {
    const property: Property = {
      validators: [...this.#property.validators],
      isRequired: false,
    };
    return <O> (<unknown> this.create(property));
  }

  validate(value: unknown, key?: string): Validation<T> {
    const errors: ValidationError[] = [];

    if (this.#property.isRequired || isDefined(value)) {
      const validators = [
        ...this.#property.baseValidators,
        ...this.#property.validators,
      ];
      for (const validator of validators) {
        const result = validator(value, key);
        if (result) errors.push(result);
      }
    }

    if (errors.length) {
      return {
        value: undefined,
        errors,
      };
    }

    return {
      value: <T> value,
      errors: undefined,
    };
  }
}

export function required(type: string): Validator {
  return (value: unknown, key?: string) => {
    if (isNotDefined(value)) {
      return {
        message: `"${key || type}" is required`,
      };
    }
  };
}

export function isNotDefined(value: unknown): boolean {
  return !isDefined(value);
}

export function isDefined(value: unknown): boolean {
  return value !== undefined && value !== null;
}

export class ValidationException extends Error {
  constructor(public errors: ValidationError[]) {
    super(JSON.stringify(errors));
  }
}

export const jsonSchemaTypes = [
  "string",
  "number",
  "object",
  "array",
  "boolean",
  "null",
] as const;

// deno-lint-ignore no-explicit-any
export function isJsonSchemaType(type: any): type is JSONSchemaTypes {
  return jsonSchemaTypes.includes(type);
}

export type JSONSchemaTypes = (typeof jsonSchemaTypes)[number];

export type JSONSchema = {
  type?: JSONSchemaTypes | JSONSchemaTypes[];
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema | JSONSchema[];
  enum?: (string | number)[];
  oneOf?: JSONSchema[];
  const?: unknown;
  format?: string;
  pattern?: string;
};
