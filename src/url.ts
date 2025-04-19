import {
  type OptionalType,
  PrimitiveSchema,
  type RequiredType,
  type ValidationError,
  type Validator,
} from "./schema.ts";

export class UrlSchema<T = string> extends PrimitiveSchema<
  T,
  UrlSchema<RequiredType<T>>,
  UrlSchema<OptionalType<T>>
> {
  constructor() {
    super("url");
    this.validator(isUrl);
  }

  http(secure = true): UrlSchema<T> {
    this.validator(isHttp(secure));
    return this;
  }

  protocol(protocol: string): UrlSchema<T> {
    this.validator(isProtocol(protocol));
    return this;
  }
}

function isUrl(value: unknown, key?: string): ValidationError | undefined {
  if (_isUrl(value) instanceof URL) {
    return;
  }
  return {
    message: `"${key || "url"}" is not a valid "URL"`,
  };
}

function isProtocol(protocol: string): Validator {
  return (value: unknown, key?: string): ValidationError | undefined => {
    if (_isUrl(value)?.protocol === protocol) {
      return;
    }
    return {
      message: `"${key || "url"}" is not of protocol type "${protocol}"`,
    };
  };
}

function isHttp(secure: boolean): Validator {
  return (value: unknown, key?: string): ValidationError | undefined => {
    const allowed = secure ? ["https:"] : ["http:", "https:"];
    const protocol = _isUrl(value)?.protocol;
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

export function url<T = string>(): UrlSchema<T> {
  return new UrlSchema<T>();
}

function _isUrl(value: unknown): URL | undefined {
  try {
    return new URL(<string> value);
  } catch {
    return;
  }
}
