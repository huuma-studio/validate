import {
  type BaseProperty,
  BaseSchema,
  type Property,
  required,
  type RequiredType,
  type Validator,
} from "./schema.ts";

export type LiteralJSONSchema<T> = {
  type: T extends string ? "string" : T extends number ? "number" : never;
  const: T;
};

export class LiteralSchema<
  T extends string | number | undefined,
> extends BaseSchema<T, LiteralJSONSchema<T>> {
  #type: T;
  #property: BaseProperty;

  constructor(
    value: T,
    { isRequired, validators }: Property = { isRequired: true, validators: [] },
  ) {
    const type = `literal:${value}`;
    const typeOfValue = typeof value;
    if (typeOfValue !== "string" && typeOfValue !== "number") {
      throw new Error(
        `LiteralSchema cannot be created with type of ${typeOfValue}`,
      );
    }
    const jsonSchema: LiteralJSONSchema<T> = {
      type: <LiteralJSONSchema<T>["type"]>typeOfValue,
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

  required(): LiteralSchema<Exclude<T, undefined>> {
    return this.create({
      isRequired: true,
      validators: [...this.#property.validators],
    }) as unknown as LiteralSchema<Exclude<T, undefined>>;
  }

  optional(): LiteralSchema<T | undefined> {
    return this.create({
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

function _isLiteral(to: string | number | undefined): Validator {
  return (value: unknown, key?: string) => {
    if (value === to) {
      return;
    }
    return {
      message: `"${key || "literal"}" is not equal to "${to}"`,
    };
  };
}
