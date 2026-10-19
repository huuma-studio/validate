import {
  type OptionalType,
  PrimitiveSchema,
  type Property,
  type RequiredType,
  type ValidationError,
} from "./schema.ts";

export type UuidJsonSchema = {
  type: "string";
  format: "uuid";
  pattern: string;
};

export type Version = "1" | "4" | "all";

const patterns: Record<Version, RegExp> = {
  all: /^[0-9A-Fa-f]{8}(-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}$/,
  1: /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-1[0-9A-Fa-f]{3}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/,
  4: /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}$/,
};

export class UuidSchema<T = string> extends PrimitiveSchema<
  T,
  UuidSchema<RequiredType<T>>,
  UuidSchema<OptionalType<T>>,
  UuidJsonSchema
> {
  constructor(
    private readonly version?: Version,
    { validators, isRequired }: Property = { validators: [], isRequired: true },
  ) {
    const jsonSchema: UuidJsonSchema = {
      type: "string",
      format: "uuid",
      pattern: patterns[version || "all"].source,
    };
    super("uuid", jsonSchema, {
      baseValidators: [_isUuid(version)],
      validators: [...validators],
      isRequired,
    });
  }

  create(property: Property): this {
    return new UuidSchema(this.version, property) as this;
  }
}

export function uuid<T = string>(version?: Version): UuidSchema<T> {
  return new UuidSchema<T>(version);
}

function _isUuid(version?: Version) {
  return (value: unknown, key?: string): ValidationError | undefined => {
    if (typeof value === "string" && patterns[version || "all"].test(value)) {
      return;
    }
    return {
      message: `"${key || "string"}" is not a valid "UUID"`,
    };
  };
}
