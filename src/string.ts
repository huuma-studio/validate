import {
  PrimitiveSchema,
  type Property,
  type ValidationError,
  type Validator,
} from "./schema.ts";

export type StringJSONSchema = {
  type: "string";
};

export class StringSchema<T = string> extends PrimitiveSchema<
  T,
  StringSchema<string>,
  StringSchema<string | undefined>,
  StringJSONSchema
> {
  constructor(
    { validators, isRequired }: Property = {
      isRequired: true,
      validators: [],
    },
  ) {
    const jsonSchema: StringJSONSchema = {
      type: "string",
    };

    super("string", jsonSchema, {
      isRequired,
      validators: [...validators],
      baseValidators: [_isString],
    });
  }

  create(property: Property): this {
    return new StringSchema(property) as this;
  }

  empty(): this {
    return this.validator(_isEmpty);
  }

  notEmpty(): this {
    return this.validator(_isNotEmpty);
  }

  equals(to: string): this {
    return this.validator(_isEquals(to));
  }

  notEquals(to: string): this {
    return this.validator(_isNotEquals(to));
  }

  startsWith(needle: string): this {
    return this.validator(_startsWith(needle));
  }

  endsWith(needle: string): this {
    return this.validator(_endsWith(needle));
  }

  regex(regex: RegExp): this {
    return this.validator(_isRegex(regex));
  }
}

export function string(): StringSchema {
  return new StringSchema();
}

function _isString(value: unknown, key?: string): ValidationError | undefined {
  if (typeof value === "string") {
    return;
  }
  return {
    message: `"${key || "string"}" is not type "string"`,
  };
}

function _isNotEmpty(
  value: unknown,
  key?: string,
): ValidationError | undefined {
  if (value !== undefined && value !== null && value !== "") {
    return;
  }
  return {
    message: `"${key || "string"}" is empty`,
  };
}

function _isEmpty(value: unknown, key?: string): ValidationError | undefined {
  if (value === "" || value === undefined || value === null) {
    return;
  }
  return {
    message: `"${key || "string"}" is not empty`,
  };
}

function _isEquals(to: string): Validator {
  return (value: unknown, key?: string) => {
    if (value === to) {
      return;
    }
    return {
      message: `"${key || "string"}" is not equals "${to}"`,
    };
  };
}

function _isNotEquals(to: string): Validator {
  return (value: unknown, key?: string) => {
    if (value !== to) {
      return;
    }
    return {
      message: `"${key || "string"}" is equals "${to}"`,
    };
  };
}

function _startsWith(needle: string): Validator {
  return (value: unknown, key?: string) => {
    const startsWith = new RegExp(`^${needle}`);
    if (startsWith.test(<string> value)) {
      return;
    }
    return {
      message: `"${key || "string"}" does not start with "${needle}"`,
    };
  };
}

function _endsWith(needle: string): Validator {
  const endsWith = new RegExp(`${needle}$`);
  return (value: unknown, key?: string) => {
    if (endsWith.test(<string> value)) {
      return;
    }
    return {
      message: `"${key || "string"}" does not end with "${needle}"`,
    };
  };
}

function _isRegex(regex: RegExp): Validator {
  return (value: unknown, key?: string) => {
    if (typeof value === "string" && regex.test(<string> value)) {
      return;
    }
    return {
      message: `"${key ?? "string"}" does not match regex "${regex}"`,
    };
  };
}
