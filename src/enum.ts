import {
  type BaseProperty,
  BaseSchema,
  isDefined,
  type Property,
  required,
  type RequiredType,
  type Validation,
  type ValidationError,
  type Validator,
} from "./schema.ts";

export type EnumJSONSchema<T> = {
  enum: T extends undefined ? never : T[];
};

export class EnumSchema<
  T extends string | number | undefined,
> extends BaseSchema<
  T,
  EnumJSONSchema<T>
> {
  #enums: T[];
  #property: BaseProperty;

  constructor(
    enums: T[],
    { isRequired, validators }: Property = { isRequired: true, validators: [] },
  ) {
    const type = `enum:${enums.join(",")}`;
    const jsonSchema: EnumJSONSchema<T> = {
      enum: enums.map((e) => {
        return <T> e;
      }) as T extends undefined ? never : T[],
    };

    const property = {
      isRequired,
      validators: [...validators],
      baseValidators: [required(type), _isEnum(enums)],
    };

    super(type, jsonSchema, property);
    this.#property = property;
    this.#enums = enums;
  }

  protected override create(property: Property): this {
    return new EnumSchema(this.#enums, property) as this;
  }

  required(): EnumSchema<T> {
    return new EnumSchema(this.#enums, {
      isRequired: true,
      validators: [...this.#property.validators],
    });
  }

  optional(): EnumSchema<T | undefined> {
    return new EnumSchema(this.#enums, {
      isRequired: false,
      validators: [...this.#property.validators],
    });
  }

  override validate(
    toValidate: unknown,
    key?: string,
  ): Validation<T> {
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
    }

    if (errors.length) {
      return { errors, value: undefined };
    }

    return {
      value: toValidate as T,
      errors: undefined,
    };
  }
}

export function enums<T extends string | number | undefined>(
  enums: RequiredType<T>[],
): EnumSchema<T> {
  return new EnumSchema(enums);
}

function _isEnum(values: unknown[]): Validator {
  return (value: unknown, key?: string) => {
    if (values.includes(value)) {
      return;
    }

    return {
      message: `"${key || "enum"}": ("${value}") is not one of ${
        values
          .map((value) => `"${value}"`)
          .join(", ")
      }`,
    };
  };
}
