import {
  type BaseProperty,
  BaseSchema,
  type Property,
  required,
  type RequiredType,
  type Validator,
} from "./schema.ts";

export type EnumJSONSchema<T> = {
  enum: T extends undefined ? never : T[];
};

export class EnumSchema<
  T extends string | number | undefined,
> extends BaseSchema<T, EnumJSONSchema<T>> {
  #enums: T[];
  #property: BaseProperty;

  constructor(
    enums: T[],
    { isRequired, validators }: Property = { isRequired: true, validators: [] },
  ) {
    const type = `enum:${enums.join(",")}`;
    const jsonSchema: EnumJSONSchema<T> = {
      enum: enums.map((e) => {
        return <T>e;
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

  required(): EnumSchema<Exclude<T, undefined>> {
    return this.create({
      isRequired: true,
      validators: [...this.#property.validators],
    }) as unknown as EnumSchema<Exclude<T, undefined>>;
  }

  optional(): EnumSchema<T | undefined> {
    return this.create({
      isRequired: false,
      validators: [...this.#property.validators],
    });
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

    // Objects may have missing, non-callable, or throwing coercion methods.
    const valueLabel =
      (typeof value === "object" && value !== null) ||
      typeof value === "function"
        ? typeof value
        : String(value);

    return {
      message: `"${key || "enum"}": ("${valueLabel}") is not one of ${values
        .map((value) => `"${String(value)}"`)
        .join(", ")}`,
    };
  };
}
