import {
  isJsonSchemaType,
  type JSONSchema,
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
  #jsonSchema: JSONSchema;
  constructor(private enums: RequiredType<T>[]) {
    const jsonSchema: JSONSchema = {
      oneOf: enums.map((e) => {
        const typeOf = typeof e;
        if (isJsonSchemaType(typeOf)) {
          return {
            type: typeOf,
          };
        }
        throw new Error(`Invalid enum type ${e}`);
      }),
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
