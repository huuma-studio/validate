import {
  type OptionalType,
  PrimitiveSchema,
  type Property,
  type RequiredType,
  type ValidationError,
  type Validator,
} from "./schema.ts";

export type UrlJSONSchema = {
  type: "string";
  format: "uri";
};

export class UrlSchema<T = string> extends PrimitiveSchema<
  T,
  UrlSchema<RequiredType<T>>,
  UrlSchema<OptionalType<T>>,
  UrlJSONSchema
> {
  constructor(
    { validators, isRequired }: Property = { isRequired: true, validators: [] },
  ) {
    const jsonSchema: UrlJSONSchema = {
      type: "string",
      format: "uri",
    };
    super("url", jsonSchema, {
      baseValidators: [_isUrl],
      validators: [...validators],
      isRequired,
    });
  }

  protected override create(property: Property): this {
    return new UrlSchema(property) as this;
  }

  http(secure = true): UrlSchema<T> {
    return this.validator(_isHttp(secure));
  }

  protocol(protocol: string): UrlSchema<T> {
    return this.validator(_isProtocol(protocol));
  }
}

export function url<T = string>(): UrlSchema<T> {
  return new UrlSchema<T>();
}

function _isUrl(value: unknown, key?: string): ValidationError | undefined {
  if (_parseUrl(value) instanceof URL) {
    return;
  }
  return {
    message: `"${key || "url"}" is not a valid "URL"`,
  };
}

function _isProtocol(protocol: string): Validator {
  return (value: unknown, key?: string): ValidationError | undefined => {
    if (_parseUrl(value)?.protocol === protocol) {
      return;
    }
    return {
      message: `"${key || "url"}" is not of protocol type "${protocol}"`,
    };
  };
}

function _isHttp(secure: boolean): Validator {
  return (value: unknown, key?: string): ValidationError | undefined => {
    const allowed = secure ? ["https:"] : ["http:", "https:"];
    const protocol = _parseUrl(value)?.protocol;
    if (protocol && allowed.includes(protocol)) {
      return;
    }
    return {
      message: `"${key || "url"}" is not of protocol type "${
        allowed.join(
          `" or "`,
        )
      }"`,
    };
  };
}

function _parseUrl(value: unknown): URL | undefined {
  try {
    return new URL(<string> value);
  } catch {
    return;
  }
}
