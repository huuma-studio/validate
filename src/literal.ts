import {
  type OptionalType,
  PrimitiveSchema,
  type RequiredType,
  type Validator,
} from "./schema.ts";

export type LiteralJSONSchema<T> = {
  type: T extends string ? "string" : T extends number ? "number" : never;
  const: T;
};

export class LiteralSchema<
  T extends string | number | undefined,
> extends PrimitiveSchema<
  T extends undefined ? never : T,
  LiteralSchema<RequiredType<T>>,
  LiteralSchema<OptionalType<T>>,
  LiteralJSONSchema<T>
> {
  #jsonSchema?: LiteralJSONSchema<T>;
  constructor(value: RequiredType<T>) {
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
