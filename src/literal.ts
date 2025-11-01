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

export type LiteralJSONSchema<T> = {
  type: T extends string ? "string" : T extends number ? "number" : never;
  const: T;
};

export class LiteralSchema<
  T extends string | number | undefined,
> extends BaseSchema<
  T,
  LiteralJSONSchema<T>
> {
  #type: T;
  #property: BaseProperty;

  constructor(
    value: T,
    { isRequired, validators }: Property = { isRequired: true, validators: [] },
  ) {
    const type = `literal:${value}`;
    const typeOfValue = typeof value;
    if (
      typeOfValue !== "string" &&
      typeOfValue !== "number"
    ) {
      throw new Error(
        `LiteralSchema cannot be created with type of ${typeOfValue}`,
      );
    }
    const jsonSchema: LiteralJSONSchema<T> = {
      // deno-lint-ignore no-explicit-any
      type: <any> typeOfValue,
      const: value,
    };

    const property: BaseProperty = {
      isRequired,
      validators: [...validators],
      baseValidators: [required(type), _isLiteral(value)],
    };

    super(type, jsonSchema, property);
    this.#type = value;
    this.#property = property;
  }
  protected override create(property: Property): this {
    return new LiteralSchema(this.#type, property) as this;
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

  required(): LiteralSchema<T> {
    return new LiteralSchema(this.#type, {
      isRequired: true,
      validators: [...this.#property.validators],
    });
  }

  optional(): LiteralSchema<T | undefined> {
    return new LiteralSchema(this.#type, {
      isRequired: false,
      validators: [...this.#property.validators],
    });
  }
}

export function literal<T extends string | number | undefined>(
  value: RequiredType<T>,
): LiteralSchema<T> {
  return new LiteralSchema(value);
}

function _isLiteral<T>(to: T): Validator {
  return (value: unknown, key?: string) => {
    if (value === to) {
      return;
    }
    return {
      message: `"${key || "literal"}" is not equal to "${to}"`,
    };
  };
}
