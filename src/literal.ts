import {
  type OptionalType,
  PrimitiveSchema,
  type RequiredType,
  type Validator,
} from "./schema.ts";

export class LiteralSchema<
  T extends string | number | undefined,
> extends PrimitiveSchema<
  T extends undefined ? never : T,
  LiteralSchema<RequiredType<T>>,
  LiteralSchema<OptionalType<T>>
> {
  constructor(value: RequiredType<T>) {
    super("literal");
    this.validator(isLiteral(value));
  }
}

function isLiteral<T>(to: T): Validator {
  return (value: unknown, key?: string) => {
    if (value === to) {
      return;
    }
    return {
      message: `"${key || "literal"}" is not equal to "${to}"`,
    };
  };
}
