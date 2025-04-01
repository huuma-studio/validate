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

export type OptionalType<T> = T extends undefined ? T : T | undefined;
export type RequiredType<T> = T extends undefined ? never
  : Exclude<T, undefined>;

export interface Schema<T> {
  validate(value: unknown, key?: string): Validation<T>;
  infer: T;
}

export abstract class BaseSchema<T> implements Schema<T> {
  property: Property = {
    validators: [],
    isRequired: true,
  };

  readonly infer!: T;
  #type: string;

  constructor(type: string) {
    this.#type = type;
  }

  toString(): string {
    return this.#type;
  }

  protected validator(validator: Validator): this {
    this.property.validators.push(validator);
    return this;
  }

  abstract validate(value: unknown, key?: string): Validation<T>;

  parse(value: unknown): T {
    const { value: validated, errors } = this.validate(value);
    if (errors) {
      throw new ValidationException(errors);
    }
    return validated;
  }
}

export abstract class PrimitiveSchema<T, R, O> extends BaseSchema<T> {
  constructor(type: string) {
    super(type);
    this.property.validators = [required(type)];
  }

  custom(validator: Validator): this {
    this.validator(validator);
    return this;
  }

  required(): R {
    this.property.isRequired = true;
    return <R> (<unknown> this);
  }

  optional(): O {
    this.property.isRequired = false;
    return <O> (<unknown> this);
  }

  validate(value: unknown, key?: string): Validation<T> {
    const errors: ValidationError[] = [];

    if (this.property.isRequired || isDefined(value)) {
      for (const validator of this.property.validators) {
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
