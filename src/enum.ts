import {
  type OptionalType,
  PrimitiveSchema,
  type RequiredType,
  type Validator,
} from "./schema.ts";

type EnumJSONSchema<T> = {
  enum: T extends undefined ? never : T[];
};

export class EnumSchema<
  T extends string | number | undefined,
> extends PrimitiveSchema<
  T extends undefined ? undefined : T,
  EnumSchema<RequiredType<T>>,
  EnumSchema<OptionalType<T>>,
  EnumJSONSchema<T>
> {
  #jsonSchema: EnumJSONSchema<T>;
  constructor(enums: RequiredType<T>[]) {
    const jsonSchema: EnumJSONSchema<T> = {
      enum: (enums.map((e) => {
        return <T> e;
      }) as T extends undefined ? never : T[]),
    };
    super(`enum:${enums.join(",")}`, jsonSchema);
    this.validator(_isEnum(enums));

    this.#jsonSchema = jsonSchema;
  }
}

export function enums<
  T extends string | number | undefined,
>(enums: RequiredType<T>[]): EnumSchema<T> {
  return new EnumSchema(enums);
}

function _isEnum(values: unknown[]): Validator {
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
