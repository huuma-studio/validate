import {
  type OptionalType,
  PrimitiveSchema,
  type RequiredType,
  type ValidationError,
} from "./schema.ts";

export type Version = "1" | "4" | "all";

const patterns: Record<Version, RegExp> = {
  all: /^[0-9A-Z]{8}(-[0-9A-Z]{4}){3}-[0-9A-Z]{12}$/i,
  1: /^[0-9A-F]{8}-[0-9A-F]{4}-1[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
  4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
};

export class UuidSchema<T = string> extends PrimitiveSchema<
  T,
  UuidSchema<RequiredType<T>>,
  UuidSchema<OptionalType<T>>
> {
  constructor(version?: Version) {
    super("uuid");
    this.validator(isUuid(version));
  }
}

export const Uuid = UuidSchema;

function isUuid(version?: Version) {
  return (value: unknown, key?: string): ValidationError | undefined => {
    if (typeof value === "string" && patterns[version || "all"].test(value)) {
      return;
    }
    return {
      message: `"${key || "string"}" is not a valid "UUID"`,
    };
  };
}
