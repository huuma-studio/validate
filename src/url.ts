import {
  type OptionalType,
  PrimitiveSchema,
  type RequiredType,
  type ValidationError,
  type Validator,
} from "./schema.ts";

export class URLSchema<T = string> extends PrimitiveSchema<
  T,
  URLSchema<RequiredType<T>>,
  URLSchema<OptionalType<T>>
> {
  constructor() {
    super("url");
    this.validator(isUrl);
  }

  http(secure = true): URLSchema<T> {
    this.validator(isHttp(secure));
    return this;
  }

  protocol(protocol: string): URLSchema<T> {
    this.validator(isProtocol(protocol));
    return this;
  }
}

function isUrl(value: unknown, key?: string): ValidationError | undefined {
  if (url(value) instanceof URL) {
    return;
  }
  return {
    message: `"${key || "url"}" is not a valid "URL"`,
  };
}

function isProtocol(protocol: string): Validator {
  return (value: unknown, key?: string): ValidationError | undefined => {
    if (url(value)?.protocol === protocol) {
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
    const protocol = url(value)?.protocol;
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

function url(value: unknown): URL | undefined {
  try {
    return new URL(<string> value);
  } catch {
    return;
  }
}
