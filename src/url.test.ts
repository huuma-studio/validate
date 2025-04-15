import { assertEquals } from "@std/assert/equals";
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

Deno.test("URL Schema Validation: 'toString()'", () => {
  const isURLSchema = new UrlSchema();
  assertEquals(isURLSchema.toString(), "url");
});

Deno.test("URL Schema Validation: 'isUrl'", async (t) => {
  await t.step("should validate URLs", () => {
    const urlSchema = new UrlSchema();
    assertEquals(urlSchema.validate(undefined).errors, [
      { message: notDefinedMessage },
      { message: notURLMessage },
    ]);
    assertEquals(urlSchema.validate(url1).errors, [{ message: notURLMessage }]);
    assertEquals(urlSchema.validate(url4).errors, undefined);
    // assertEquals(UrlSchema.validate(url4).errors, []);
  });

  await t.step("should allow undefined", () => {
    const urlSchema = new UrlSchema().optional();
    assertEquals(urlSchema.validate(undefined).errors, undefined);
    assertEquals(urlSchema.validate(url1).errors, [
      {
        message: notURLMessage,
      },
    ]);
    assertEquals(urlSchema.validate(url2).errors, undefined);
    assertEquals(urlSchema.validate(url3).errors, undefined);
    assertEquals(urlSchema.validate(url4).errors, undefined);
    assertEquals(urlSchema.validate(url5).errors, undefined);
  });
});

Deno.test("URL Schema Validation: 'isHttp'", async (t) => {
  await t.step("should validate protocol(https)", () => {
    const urlSchema = new UrlSchema().http();
    assertEquals(urlSchema.validate(undefined).errors, [
      { message: notDefinedMessage },
      { message: notURLMessage },
      { message: notHttpsMessage },
    ]);
    assertEquals(urlSchema.validate(url1).errors, [
      {
        message: notURLMessage,
      },
      {
        message: notHttpsMessage,
      },
    ]);
    assertEquals(urlSchema.validate(url2).errors, [
      {
        message: notHttpsMessage,
      },
    ]);
    assertEquals(urlSchema.validate(url3).errors, [
      {
        message: notHttpsMessage,
      },
    ]);
    assertEquals(urlSchema.validate(url4).errors, [
      {
        message: notHttpsMessage,
      },
    ]);
    assertEquals(urlSchema.validate(url5).errors, undefined);
  });
});

Deno.test("URL Schema Validation: 'isHttp'", async (t) => {
  await t.step("should validate http protocol(http/https)", () => {
    const urlSchema = new UrlSchema().http(false);
    assertEquals(urlSchema.validate(undefined).errors, [
      { message: notDefinedMessage },
      { message: notURLMessage },
      { message: notHttpMessage },
    ]);
    assertEquals(urlSchema.validate(url1).errors, [
      {
        message: notURLMessage,
      },
      {
        message: notHttpMessage,
      },
    ]);
    assertEquals(urlSchema.validate(url2).errors, [
      {
        message: notHttpMessage,
      },
    ]);
    assertEquals(urlSchema.validate(url3).errors, [
      {
        message: notHttpMessage,
      },
    ]);
    assertEquals(urlSchema.validate(url4).errors, undefined);
    assertEquals(urlSchema.validate(url5).errors, undefined);
  });
});

Deno.test("URL Schema Validation: 'isProtocol'", async (t) => {
  await t.step("should validate protocol", () => {
    const urlSchema = new UrlSchema().protocol("ssh:");
    assertEquals(urlSchema.validate(undefined).errors, [
      { message: notDefinedMessage },
      { message: notURLMessage },
      { message: notSSHMessage },
    ]);
    assertEquals(urlSchema.validate(url1).errors, [
      {
        message: notURLMessage,
      },
      {
        message: notSSHMessage,
      },
    ]);
    assertEquals(urlSchema.validate(url2).errors, [
      {
        message: notSSHMessage,
      },
    ]);
    assertEquals(urlSchema.validate(url3).errors, undefined);
    assertEquals(urlSchema.validate(url4).errors, [
      {
        message: notSSHMessage,
      },
    ]);
    assertEquals(urlSchema.validate(url5).errors, [
      {
        message: notSSHMessage,
      },
    ]);
  });
});
