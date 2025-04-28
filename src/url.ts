import {
  type OptionalType,
  PrimitiveSchema,
  type RequiredType,
  type ValidationError,
  type Validator,
} from "./schema.ts";

type UrlJSONSchema = {
  type: "string";
  format: "uri";
};

export class UrlSchema<T = string> extends PrimitiveSchema<
  T,
  UrlSchema<RequiredType<T>>,
  UrlSchema<OptionalType<T>>,
  UrlJSONSchema
> {
  #jsonSchema: UrlJSONSchema;

  constructor() {
    const jsonSchema: UrlJSONSchema = {
      type: "string",
      format: "uri",
    };
    super("url", jsonSchema);
    this.validator(_isUrl);
    this.#jsonSchema = jsonSchema;
  }

  http(secure = true): UrlSchema<T> {
    this.validator(_isHttp(secure));
    return this;
  }

  protocol(protocol: string): UrlSchema<T> {
    this.validator(_isProtocol(protocol));
    return this;
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
