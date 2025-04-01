import {
  type OptionalType,
  PrimitiveSchema,
  type RequiredType,
  type Validator,
} from "./schema.ts";

export class EnumSchema<
  T extends string | number | undefined,
> extends PrimitiveSchema<
  T extends undefined ? undefined : T,
  EnumSchema<RequiredType<T>>,
  EnumSchema<OptionalType<T>>
> {
  constructor(private values: RequiredType<T>[]) {
    super("enum");
    this.validator(isEnum(values));
  }
}

function isEnum(values: unknown[]): Validator {
  return (value: unknown, key?: string) => {
    if (values.includes(value)) {
      return;
    }
    return {
      message: `"${key || "enum"}": ("${value}") is not one of ${
        values.map((value) => `"${value}"`).join(", ")
      }`,
    };
  };
}
