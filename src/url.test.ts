import { assert, describe, test } from "vite-plus/test";
import { UrlSchema } from "./url.ts";

const notDefinedMessage = '"url" is required';
const notURLMessage = '"url" is not a valid "URL"';
const notSSHMessage = '"url" is not of protocol type "ssh:"';
const notHttpsMessage = '"url" is not of protocol type "https:"';
const notHttpMessage = '"url" is not of protocol type "http:" or "https:"';

const url1 = "cargo";
const url2 = "ftp://cargo.wtf";
const url3 = "ssh://cargo.wtf";
const url4 = "http://cargo.wtf";
const url5 = "https://cargo.wtf";

test("URL Schema Validation: rejects an array containing a URL string", () => {
  const schema = new UrlSchema();
  assert.deepEqual(schema.parse(url5), url5);

  const result = schema.validate([url5]);
  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
});

test("URL Schema Validation: rejects a URL instance", () => {
  const schema = new UrlSchema();
  const result = schema.validate(new URL(url5));

  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
});

test("URL Schema Validation: rejects an object whose toString returns a URL", () => {
  const schema = new UrlSchema();
  const result = schema.validate({ toString: () => url5 });

  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
});

test("URL Schema Validation: HTTPS rejects an array containing a URL string", () => {
  const schema = new UrlSchema().http();
  assert.deepEqual(schema.parse(url5), url5);

  const result = schema.validate([url5]);
  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
});

test("URL Schema Validation: HTTPS rejects a URL instance", () => {
  const schema = new UrlSchema().http();
  const result = schema.validate(new URL(url5));

  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
});

test("URL Schema Validation: HTTPS rejects an object whose toString returns a URL", () => {
  const schema = new UrlSchema().http();
  const result = schema.validate({ toString: () => url5 });

  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
});

test("URL Schema Validation: protocol rejects an array containing a URL string", () => {
  const schema = new UrlSchema().protocol("https:");
  assert.deepEqual(schema.parse(url5), url5);

  const result = schema.validate([url5]);
  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
});

test("URL Schema Validation: protocol rejects a URL instance", () => {
  const schema = new UrlSchema().protocol("https:");
  const result = schema.validate(new URL(url5));

  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
});

test("URL Schema Validation: protocol rejects an object whose toString returns a URL", () => {
  const schema = new UrlSchema().protocol("https:");
  const result = schema.validate({ toString: () => url5 });

  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
});

test("URL Schema Validation: optional rejects an array containing a URL string", () => {
  const schema = new UrlSchema().optional();
  assert.deepEqual(schema.parse(url5), url5);

  const result = schema.validate([url5]);
  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
});

test("URL Schema Validation: optional rejects a URL instance", () => {
  const schema = new UrlSchema().optional();
  const result = schema.validate(new URL(url5));

  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
});

test("URL Schema Validation: optional rejects an object whose toString returns a URL", () => {
  const schema = new UrlSchema().optional();
  const result = schema.validate({ toString: () => url5 });

  assert(result.errors?.length);
  assert.deepEqual(result.value, undefined);
});

test("URL Schema Validation: 'toString()'", () => {
  const isURLSchema = new UrlSchema();
  assert.deepEqual(isURLSchema.toString(), "url");
});

describe("URL Schema Validation: 'isUrl'", () => {
  test("should validate URLs", () => {
    const urlSchema = new UrlSchema();
    assert.deepEqual(urlSchema.validate(undefined).errors, [
      { message: notDefinedMessage },
      { message: notURLMessage },
    ]);
    assert.deepEqual(urlSchema.validate(url1).errors, [
      { message: notURLMessage },
    ]);
    assert.deepEqual(urlSchema.validate(url4).errors, undefined);
    // assert.deepEqual(UrlSchema.validate(url4).errors, []);
  });

  test("should allow undefined", () => {
    const urlSchema = new UrlSchema().optional();
    assert.deepEqual(urlSchema.validate(undefined).errors, undefined);
    assert.deepEqual(urlSchema.validate(url1).errors, [
      {
        message: notURLMessage,
      },
    ]);
    assert.deepEqual(urlSchema.validate(url2).errors, undefined);
    assert.deepEqual(urlSchema.validate(url3).errors, undefined);
    assert.deepEqual(urlSchema.validate(url4).errors, undefined);
    assert.deepEqual(urlSchema.validate(url5).errors, undefined);
  });
});

describe("URL Schema Validation: 'isHttp'", () => {
  test("should validate protocol(https)", () => {
    const urlSchema = new UrlSchema().http();
    assert.deepEqual(urlSchema.validate(undefined).errors, [
      { message: notDefinedMessage },
      { message: notURLMessage },
      { message: notHttpsMessage },
    ]);
    assert.deepEqual(urlSchema.validate(url1).errors, [
      {
        message: notURLMessage,
      },
      {
        message: notHttpsMessage,
      },
    ]);
    assert.deepEqual(urlSchema.validate(url2).errors, [
      {
        message: notHttpsMessage,
      },
    ]);
    assert.deepEqual(urlSchema.validate(url3).errors, [
      {
        message: notHttpsMessage,
      },
    ]);
    assert.deepEqual(urlSchema.validate(url4).errors, [
      {
        message: notHttpsMessage,
      },
    ]);
    assert.deepEqual(urlSchema.validate(url5).errors, undefined);
  });
});

describe("URL Schema Validation: 'isHttp'", () => {
  test("should validate http protocol(http/https)", () => {
    const urlSchema = new UrlSchema().http(false);
    assert.deepEqual(urlSchema.validate(undefined).errors, [
      { message: notDefinedMessage },
      { message: notURLMessage },
      { message: notHttpMessage },
    ]);
    assert.deepEqual(urlSchema.validate(url1).errors, [
      {
        message: notURLMessage,
      },
      {
        message: notHttpMessage,
      },
    ]);
    assert.deepEqual(urlSchema.validate(url2).errors, [
      {
        message: notHttpMessage,
      },
    ]);
    assert.deepEqual(urlSchema.validate(url3).errors, [
      {
        message: notHttpMessage,
      },
    ]);
    assert.deepEqual(urlSchema.validate(url4).errors, undefined);
    assert.deepEqual(urlSchema.validate(url5).errors, undefined);
  });
});

describe("URL Schema Validation: 'isProtocol'", () => {
  test("should validate protocol", () => {
    const urlSchema = new UrlSchema().protocol("ssh:");
    assert.deepEqual(urlSchema.validate(undefined).errors, [
      { message: notDefinedMessage },
      { message: notURLMessage },
      { message: notSSHMessage },
    ]);
    assert.deepEqual(urlSchema.validate(url1).errors, [
      {
        message: notURLMessage,
      },
      {
        message: notSSHMessage,
      },
    ]);
    assert.deepEqual(urlSchema.validate(url2).errors, [
      {
        message: notSSHMessage,
      },
    ]);
    assert.deepEqual(urlSchema.validate(url3).errors, undefined);
    assert.deepEqual(urlSchema.validate(url4).errors, [
      {
        message: notSSHMessage,
      },
    ]);
    assert.deepEqual(urlSchema.validate(url5).errors, [
      {
        message: notSSHMessage,
      },
    ]);
  });
});
