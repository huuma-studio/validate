import {
  isJsonSchemaType,
  type JSONSchema,
  type OptionalType,
  PrimitiveSchema,
  type RequiredType,
  type Validator,
} from "./schema.ts";

type LiteralJSONSchema<T> = {
  type: T extends string ? "string" : T extends number ? "number" : never;
  value: T;
};

export class LiteralSchema<
  T extends string | number | undefined,
> extends PrimitiveSchema<
  T extends undefined ? never : T,
  LiteralSchema<RequiredType<T>>,
  LiteralSchema<OptionalType<T>>,
  LiteralJSONSchema<T>
> {
  #jsonSchema?: JSONSchema;
  constructor(value: RequiredType<T>) {
    const typeOfValue = typeof value;
    if (
      !isJsonSchemaType(typeOfValue)
    ) {
      throw new Error(
        `LiteralSchema cannot be created with type of ${typeOfValue}`,
      );
    }
    const jsonSchema: JSONSchema = {
      type: typeOfValue,
      const: value,
    };
    super(`literal:${value}`, jsonSchema);
    this.validator(_isLiteral(value));
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
