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

  length(n: number): this {
    return this.validator(_isLength(n));
  }

  minLength(n: number): this {
    return this.validator(_isMinLength(n));
  }

  maxLength(n: number): this {
    return this.validator(_isMaxLength(n));
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
    if (typeof value === "string" && value.startsWith(needle)) {
      return;
    }
    return _mismatch("start with", needle, key);
  };
}

function _endsWith(needle: string): Validator {
  return (value: unknown, key?: string) => {
    if (typeof value === "string" && value.endsWith(needle)) {
      return;
    }
    return _mismatch("end with", needle, key);
  };
}

function _mismatch(
  verb: string,
  needle: string,
  key?: string,
): ValidationError {
  return {
    message: `"${key || "string"}" does not ${verb} "${needle}"`,
  };
}

function _isRegex(regex: RegExp): Validator {
  const pattern = new RegExp(regex.source, regex.flags);
  return (value: unknown, key?: string) => {
    // Global and sticky patterns must start each validation at the beginning.
    pattern.lastIndex = 0;
    if (typeof value === "string" && pattern.test(value)) {
      return;
    }
    return {
      message: `"${key || "string"}" does not match regex "${pattern}"`,
    };
  };
}

// Length is measured in UTF-16 code units (the same unit `value.length`
// reports and the same unit `_startsWith`/`_endsWith` walk). `length` is a
// non-configurable own slot on the String exotic, so reading it cannot be
// diverted via String.prototype pollution. Astral characters (surrogate
// pairs) count as 2, matching the native String.prototype length semantics.
function _isLength(n: number): Validator {
  return (value: unknown, key?: string) => {
    if (typeof value === "string" && value.length === n) {
      return;
    }
    return {
      message: `"${key || "string"}" length is not ${n}`,
    };
  };
}

function _isMinLength(n: number): Validator {
  return (value: unknown, key?: string) => {
    if (typeof value === "string" && value.length >= n) {
      return;
    }
    return {
      message: `"${key || "string"}" length is less than ${n}`,
    };
  };
}

function _isMaxLength(n: number): Validator {
  return (value: unknown, key?: string) => {
    if (typeof value === "string" && value.length <= n) {
      return;
    }
    return {
      message: `"${key || "string"}" length is greater than ${n}`,
    };
  };
}
