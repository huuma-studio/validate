import { assertArrayIncludes } from "@std/assert/array-includes";
import { StringSchema } from "./string.ts";
import { assertEquals } from "@std/assert/equals";

const requiredMessage = {
  message: '"string" is required',
};
const notStringMessage = {
  message: '"string" is not type "string"',
};

const notEmptyMessage = {
  message: '"string" is empty',
};

const emptyMessage = {
  message: '"string" is not empty',
};

const equalsMessage = {
  message: '"string" is not equals "Cargo"',
};

const notEqualsMessage = {
  message: '"string" is equals "Cargo"',
};

const startsWithMessage = {
  message: `"string" does not start with "Ca"`,
};

const endsWithMessage = {
  message: `"string" does not end with "go"`,
};

const regexMessage = {
  message: '"string" does not match regex "/^[a-z]+$/g"',
};

const lengthMessage = {
  message: '"string" length is not 5',
};

const minLengthMessage = {
  message: '"string" length is less than 3',
};

const maxLengthMessage = {
  message: '"string" length is greater than 10',
};

Deno.test("String Schema Validation: 'isString'", () => {
  const isString = new StringSchema();
  assertEquals(isString.toString(), "string");
});

Deno.test("String Schema Validation: 'isString'", () => {
  const isString = new StringSchema();

  assertArrayIncludes(isString.validate(undefined).errors!, [requiredMessage]);
  assertArrayIncludes(isString.validate(null).errors!, [requiredMessage]);

  assertEquals(isString.validate("").errors, undefined);
  assertEquals(isString.validate("Cargo").errors, undefined);

  assertArrayIncludes(isString.validate(-1).errors!, [notStringMessage]);
  assertArrayIncludes(isString.validate(0).errors!, [notStringMessage]);
  assertArrayIncludes(isString.validate(1).errors!, [notStringMessage]);

  assertArrayIncludes(isString.validate(NaN).errors!, [notStringMessage]);
  assertArrayIncludes(isString.validate(Infinity).errors!, [notStringMessage]);
  assertArrayIncludes(isString.validate(-Infinity).errors!, [notStringMessage]);

  assertArrayIncludes(isString.validate(true).errors!, [notStringMessage]);
  assertArrayIncludes(isString.validate(false).errors!, [notStringMessage]);

  assertArrayIncludes(isString.validate({}).errors!, [notStringMessage]);
  assertArrayIncludes(isString.validate([]).errors!, [notStringMessage]);
  assertArrayIncludes(isString.validate(() => {}).errors!, [notStringMessage]);
});

Deno.test("String Schema Validation: 'required'", () => {
  const required = new StringSchema().optional().required();

  assertArrayIncludes(required.validate(undefined).errors!, [requiredMessage]);
  assertArrayIncludes(required.validate(null).errors!, [requiredMessage]);

  assertEquals(required.validate("").errors, undefined);
  assertEquals(required.validate("Cargo").errors, undefined);

  assertArrayIncludes(required.validate(-1).errors!, [notStringMessage]);
  assertArrayIncludes(required.validate(0).errors!, [notStringMessage]);
  assertArrayIncludes(required.validate(1).errors!, [notStringMessage]);

  assertArrayIncludes(required.validate(NaN).errors!, [notStringMessage]);
  assertArrayIncludes(required.validate(Infinity).errors!, [notStringMessage]);
  assertArrayIncludes(required.validate(-Infinity).errors!, [notStringMessage]);

  assertArrayIncludes(required.validate(true).errors!, [notStringMessage]);
  assertArrayIncludes(required.validate(false).errors!, [notStringMessage]);

  assertArrayIncludes(required.validate({}).errors!, [notStringMessage]);
  assertArrayIncludes(required.validate([]).errors!, [notStringMessage]);
  assertArrayIncludes(required.validate(() => {}).errors!, [notStringMessage]);
});

Deno.test("String Schema Validation: 'optional'", () => {
  const optional = new StringSchema().optional();

  assertEquals(optional.validate(undefined).errors, undefined);
  assertEquals(optional.validate(null).errors, undefined);

  assertEquals(optional.validate("").errors, undefined);
  assertEquals(optional.validate("Cargo").errors, undefined);

  assertArrayIncludes(optional.validate(-1).errors!, [notStringMessage]);
  assertArrayIncludes(optional.validate(0).errors!, [notStringMessage]);
  assertArrayIncludes(optional.validate(1).errors!, [notStringMessage]);

  assertArrayIncludes(optional.validate(NaN).errors!, [notStringMessage]);
  assertArrayIncludes(optional.validate(Infinity).errors!, [notStringMessage]);
  assertArrayIncludes(optional.validate(-Infinity).errors!, [notStringMessage]);
  assertArrayIncludes(optional.validate(NaN).errors!, [notStringMessage]);

  assertArrayIncludes(optional.validate(true).errors!, [notStringMessage]);
  assertArrayIncludes(optional.validate(false).errors!, [notStringMessage]);

  assertArrayIncludes(optional.validate({}).errors!, [notStringMessage]);
  assertArrayIncludes(optional.validate([]).errors!, [notStringMessage]);
  assertArrayIncludes(optional.validate(() => {}).errors!, [notStringMessage]);
});

Deno.test("String Schema Validation: 'notEmpty'", () => {
  const notEmpty = new StringSchema().notEmpty();

  assertArrayIncludes(notEmpty.validate(undefined).errors!, [notEmptyMessage]);
  assertArrayIncludes(notEmpty.validate(null).errors!, [notEmptyMessage]);

  assertArrayIncludes(notEmpty.validate("").errors!, [notEmptyMessage]);
  assertEquals(notEmpty.validate("Cargo").errors, undefined);

  assertArrayIncludes(notEmpty.validate(-1).errors!, [notStringMessage]);
  assertArrayIncludes(notEmpty.validate(0).errors!, [notStringMessage]);
  assertArrayIncludes(notEmpty.validate(1).errors!, [notStringMessage]);

  assertArrayIncludes(notEmpty.validate(NaN).errors!, [notStringMessage]);
  assertArrayIncludes(notEmpty.validate(Infinity).errors!, [notStringMessage]);
  assertArrayIncludes(notEmpty.validate(-Infinity).errors!, [notStringMessage]);

  assertArrayIncludes(notEmpty.validate(true).errors!, [notStringMessage]);
  assertArrayIncludes(notEmpty.validate(false).errors!, [notStringMessage]);

  assertArrayIncludes(notEmpty.validate({}).errors!, [notStringMessage]);
  assertArrayIncludes(notEmpty.validate([]).errors!, [notStringMessage]);
  assertArrayIncludes(notEmpty.validate(() => {}).errors!, [notStringMessage]);
});

Deno.test("String Schema Validation: 'empty'", () => {
  const empty = new StringSchema().empty();

  assertArrayIncludes(empty.validate(undefined).errors!, [
    requiredMessage,
    notStringMessage,
  ]);
  assertArrayIncludes(empty.validate(null).errors!, [
    requiredMessage,
    notStringMessage,
  ]);

  assertEquals(empty.validate("").errors, undefined);
  assertArrayIncludes(empty.validate("Cargo").errors!, [emptyMessage]);

  assertArrayIncludes(empty.validate(-1).errors!, [notStringMessage]);
  assertArrayIncludes(empty.validate(0).errors!, [notStringMessage]);
  assertArrayIncludes(empty.validate(1).errors!, [notStringMessage]);

  assertArrayIncludes(empty.validate(NaN).errors!, [notStringMessage]);
  assertArrayIncludes(empty.validate(Infinity).errors!, [notStringMessage]);
  assertArrayIncludes(empty.validate(-Infinity).errors!, [notStringMessage]);

  assertArrayIncludes(empty.validate(true).errors!, [notStringMessage]);
  assertArrayIncludes(empty.validate(false).errors!, [notStringMessage]);

  assertArrayIncludes(empty.validate({}).errors!, [notStringMessage]);
  assertArrayIncludes(empty.validate([]).errors!, [notStringMessage]);
  assertArrayIncludes(empty.validate(() => {}).errors!, [notStringMessage]);
});

Deno.test("String Schema Validation: 'equals'", () => {
  const equals = new StringSchema().equals("Cargo");

  assertArrayIncludes(equals.validate(undefined).errors!, [equalsMessage]);
  assertArrayIncludes(equals.validate(null).errors!, [equalsMessage]);

  assertArrayIncludes(equals.validate("").errors!, [equalsMessage]);
  assertEquals(equals.validate("Cargo").errors, undefined);

  assertArrayIncludes(equals.validate(-1).errors!, [equalsMessage]);
  assertArrayIncludes(equals.validate(0).errors!, [equalsMessage]);
  assertArrayIncludes(equals.validate(1).errors!, [equalsMessage]);

  assertArrayIncludes(equals.validate(NaN).errors!, [equalsMessage]);
  assertArrayIncludes(equals.validate(Infinity).errors!, [equalsMessage]);
  assertArrayIncludes(equals.validate(-Infinity).errors!, [equalsMessage]);

  assertArrayIncludes(equals.validate(true).errors!, [equalsMessage]);
  assertArrayIncludes(equals.validate(false).errors!, [equalsMessage]);

  assertArrayIncludes(equals.validate({}).errors!, [equalsMessage]);
  assertArrayIncludes(equals.validate([]).errors!, [equalsMessage]);
  assertArrayIncludes(equals.validate(() => {}).errors!, [equalsMessage]);
});

Deno.test("String Schema Validation: 'notEquals'", () => {
  const notEquals = new StringSchema().notEquals("Cargo");

  assertArrayIncludes(notEquals.validate(undefined).errors!, [
    requiredMessage,
    notStringMessage,
  ]);
  assertArrayIncludes(notEquals.validate(null).errors!, [
    requiredMessage,
    notStringMessage,
  ]);

  assertEquals(notEquals.validate("").errors, undefined);
  assertArrayIncludes(notEquals.validate("Cargo").errors!, [notEqualsMessage]);

  assertArrayIncludes(notEquals.validate(-1).errors!, [notStringMessage]);
  assertArrayIncludes(notEquals.validate(0).errors!, [notStringMessage]);
  assertArrayIncludes(notEquals.validate(1).errors!, [notStringMessage]);

  assertArrayIncludes(notEquals.validate(NaN).errors!, [notStringMessage]);
  assertArrayIncludes(notEquals.validate(Infinity).errors!, [notStringMessage]);
  assertArrayIncludes(notEquals.validate(-Infinity).errors!, [
    notStringMessage,
  ]);

  assertArrayIncludes(notEquals.validate(true).errors!, [notStringMessage]);
  assertArrayIncludes(notEquals.validate(false).errors!, [notStringMessage]);

  assertArrayIncludes(notEquals.validate({}).errors!, [notStringMessage]);
  assertArrayIncludes(notEquals.validate([]).errors!, [notStringMessage]);
  assertArrayIncludes(notEquals.validate(() => {}).errors!, [notStringMessage]);
});

Deno.test("String Schema Validation: 'startsWith'", () => {
  const startsWith = new StringSchema().startsWith("Ca");

  assertArrayIncludes(startsWith.validate(undefined).errors!, [
    requiredMessage,
  ]);
  assertArrayIncludes(startsWith.validate(null).errors!, [requiredMessage]);

  assertArrayIncludes(startsWith.validate("").errors!, [startsWithMessage]);
  assertEquals(startsWith.validate("Cargo").errors, undefined);

  assertArrayIncludes(startsWith.validate(-1).errors!, [startsWithMessage]);
  assertArrayIncludes(startsWith.validate(0).errors!, [startsWithMessage]);
  assertArrayIncludes(startsWith.validate(1).errors!, [startsWithMessage]);

  assertArrayIncludes(startsWith.validate(NaN).errors!, [startsWithMessage]);
  assertArrayIncludes(startsWith.validate(Infinity).errors!, [
    startsWithMessage,
  ]);
  assertArrayIncludes(startsWith.validate(-Infinity).errors!, [
    startsWithMessage,
  ]);

  assertArrayIncludes(startsWith.validate(true).errors!, [startsWithMessage]);
  assertArrayIncludes(startsWith.validate(false).errors!, [startsWithMessage]);

  assertArrayIncludes(startsWith.validate({}).errors!, [startsWithMessage]);
  assertArrayIncludes(startsWith.validate([]).errors!, [startsWithMessage]);
  assertArrayIncludes(startsWith.validate(() => {}).errors!, [
    startsWithMessage,
  ]);
});
Deno.test("String Schema Validation: 'endsWith'", () => {
  const startsWith = new StringSchema().endsWith("go");

  assertArrayIncludes(startsWith.validate(undefined).errors!, [
    endsWithMessage,
  ]);
  assertArrayIncludes(startsWith.validate(null).errors!, [endsWithMessage]);

  assertArrayIncludes(startsWith.validate("").errors!, [endsWithMessage]);
  assertEquals(startsWith.validate("Cargo").errors, undefined);

  assertArrayIncludes(startsWith.validate(-1).errors!, [endsWithMessage]);
  assertArrayIncludes(startsWith.validate(0).errors!, [endsWithMessage]);
  assertArrayIncludes(startsWith.validate(1).errors!, [endsWithMessage]);

  assertArrayIncludes(startsWith.validate(NaN).errors!, [endsWithMessage]);
  assertArrayIncludes(startsWith.validate(Infinity).errors!, [endsWithMessage]);
  assertArrayIncludes(startsWith.validate(-Infinity).errors!, [
    endsWithMessage,
  ]);

  assertArrayIncludes(startsWith.validate(true).errors!, [endsWithMessage]);
  assertArrayIncludes(startsWith.validate(false).errors!, [endsWithMessage]);

  assertArrayIncludes(startsWith.validate({}).errors!, [endsWithMessage]);
  assertArrayIncludes(startsWith.validate([]).errors!, [endsWithMessage]);
  assertArrayIncludes(startsWith.validate(() => {}).errors!, [endsWithMessage]);
});

Deno.test(
  "String Schema Validation: 'startsWith' treats needle literally (no regex)",
  () => {
    // Regression: the old RegExp-based impl built `new RegExp("^" + needle)`,
    // so metacharacters in the needle were interpreted as a pattern. The
    // code-unit loop matches literally.
    const schema = (needle: string) => new StringSchema().startsWith(needle);

    // `.` previously matched any single character.
    assertEquals(schema(".").validate("x").errors, [
      {
        message: '"string" does not start with "."',
      },
    ]);
    assertEquals(schema(".").validate(".x").errors, undefined);

    // `a.b` previously matched `aXb`.
    assertEquals(schema("a.b").validate("aXb").errors, [
      {
        message: '"string" does not start with "a.b"',
      },
    ]);
    assertEquals(schema("a.b").validate("a.b").errors, undefined);
    assertEquals(schema("a.b").validate("a.bc").errors, undefined);

    // `^` is the start anchor in regex; `^x` must match a literal leading `^`.
    assertEquals(schema("^").validate("abc").errors, [
      {
        message: '"string" does not start with "^"',
      },
    ]);
    assertEquals(schema("^").validate("^abc").errors, undefined);

    // `$` is the end anchor in regex; as a prefix it must be literal.
    assertEquals(schema("$").validate("abc").errors, [
      {
        message: '"string" does not start with "$"',
      },
    ]);
    assertEquals(schema("$").validate("$1").errors, undefined);

    // Quantifiers / brackets / alternation / escapes — all literal now.
    assertEquals(schema("a*").validate("aaa").errors, [
      {
        message: '"string" does not start with "a*"',
      },
    ]);
    assertEquals(schema("a*").validate("a*").errors, undefined);
    assertEquals(schema("(a)").validate("(a)").errors, undefined);
    assertEquals(schema("[a]").validate("[a]").errors, undefined);
    assertEquals(schema("a|b").validate("b").errors, [
      {
        message: '"string" does not start with "a|b"',
      },
    ]);
    assertEquals(schema("a|b").validate("a|b").errors, undefined);
    assertEquals(schema("\\d").validate("\\d").errors, undefined);
    assertEquals(schema("\\d").validate("d").errors, [
      {
        message: '"string" does not start with "\\d"',
      },
    ]);
  },
);

Deno.test(
  "String Schema Validation: 'endsWith' treats needle literally (no regex)",
  () => {
    // Regression: the old impl built `new RegExp(needle + "$")`, so `$` in the
    // needle collided with the appended end anchor and metacharacters acted as a
    // pattern. The code-unit loop matches literally.
    const schema = (needle: string) => new StringSchema().endsWith(needle);

    // `.` previously matched any trailing character.
    assertEquals(schema(".").validate("x").errors, [
      {
        message: '"string" does not end with "."',
      },
    ]);
    assertEquals(schema(".").validate("x.").errors, undefined);

    // `a.b` previously matched `aXb`.
    assertEquals(schema("a.b").validate("aXb").errors, [
      {
        message: '"string" does not end with "a.b"',
      },
    ]);
    assertEquals(schema("a.b").validate("a.b").errors, undefined);
    assertEquals(schema("a.b").validate("xa.b").errors, undefined);

    // `$` in the needle previously merged with the appended anchor.
    assertEquals(schema("$").validate("abc").errors, [
      {
        message: '"string" does not end with "$"',
      },
    ]);
    assertEquals(schema("$").validate("abc$").errors, undefined);

    // `^` as a suffix must be literal.
    assertEquals(schema("^").validate("abc").errors, [
      {
        message: '"string" does not end with "^"',
      },
    ]);
    assertEquals(schema("^").validate("abc^").errors, undefined);

    // Quantifiers / brackets / alternation / escapes — all literal now.
    assertEquals(schema("a*").validate("aaa").errors, [
      {
        message: '"string" does not end with "a*"',
      },
    ]);
    assertEquals(schema("a*").validate("aa*").errors, undefined);
    assertEquals(schema("(a)").validate("x(a)").errors, undefined);
    assertEquals(schema("[a]").validate("x[a]").errors, undefined);
    assertEquals(schema("a|b").validate("a").errors, [
      {
        message: '"string" does not end with "a|b"',
      },
    ]);
    assertEquals(schema("a|b").validate("xa|b").errors, undefined);
    assertEquals(schema("\\d").validate("\\d").errors, undefined);
    assertEquals(schema("\\d").validate("d").errors, [
      {
        message: '"string" does not end with "\\d"',
      },
    ]);
  },
);

Deno.test("String Schema Validation: 'startsWith' length boundaries", () => {
  // Empty needle matches any string (including ""), matching native startsWith.
  assertEquals(
    new StringSchema().startsWith("").validate("").errors,
    undefined,
  );
  assertEquals(
    new StringSchema().startsWith("").validate("Cargo").errors,
    undefined,
  );

  // Needle longer than value -> fail (length guard, no index access).
  assertEquals(new StringSchema().startsWith("Cargo").validate("Ca").errors, [
    {
      message: '"string" does not start with "Cargo"',
    },
  ]);

  // Needle equal in length to value -> exact equality required.
  assertEquals(
    new StringSchema().startsWith("Cargo").validate("Cargo").errors,
    undefined,
  );
  assertEquals(
    new StringSchema().startsWith("Cargo").validate("Cargx").errors,
    [
      {
        message: '"string" does not start with "Cargo"',
      },
    ],
  );

  // Whole value is a prefix of a longer string -> pass.
  assertEquals(
    new StringSchema().startsWith("Cargo").validate("CargoShip").errors,
    undefined,
  );

  // Single code unit vs single code unit.
  assertEquals(
    new StringSchema().startsWith("C").validate("C").errors,
    undefined,
  );
  assertEquals(new StringSchema().startsWith("C").validate("c").errors, [
    {
      message: '"string" does not start with "C"',
    },
  ]);
});

Deno.test("String Schema Validation: 'endsWith' length boundaries", () => {
  // Empty needle matches any string.
  assertEquals(new StringSchema().endsWith("").validate("").errors, undefined);
  assertEquals(
    new StringSchema().endsWith("").validate("Cargo").errors,
    undefined,
  );

  // Needle longer than value -> fail.
  assertEquals(new StringSchema().endsWith("Cargo").validate("go").errors, [
    {
      message: '"string" does not end with "Cargo"',
    },
  ]);

  // Needle equal in length to value -> exact equality required.
  assertEquals(
    new StringSchema().endsWith("Cargo").validate("Cargo").errors,
    undefined,
  );
  assertEquals(new StringSchema().endsWith("Cargo").validate("Cargx").errors, [
    {
      message: '"string" does not end with "Cargo"',
    },
  ]);

  // Suffix of a longer string -> pass.
  assertEquals(
    new StringSchema().endsWith("go").validate("Cargo").errors,
    undefined,
  );

  // Single code unit vs single code unit.
  assertEquals(
    new StringSchema().endsWith("o").validate("o").errors,
    undefined,
  );
  assertEquals(new StringSchema().endsWith("o").validate("O").errors, [
    {
      message: '"string" does not end with "o"',
    },
  ]);
});

Deno.test(
  "String Schema Validation: 'startsWith' astral characters (surrogate pairs)",
  () => {
    const astral = "𝓪"; // U+1D4EA, two UTF-16 code units: \uD835\uDCEA

    // Full pair at the start -> pass.
    assertEquals(
      new StringSchema().startsWith(astral).validate("𝓪bc").errors,
      undefined,
    );
    // No match -> fail.
    assertEquals(new StringSchema().startsWith(astral).validate("abc").errors, [
      {
        message: '"string" does not start with "𝓪"',
      },
    ]);
    // Only the high surrogate matches the first code unit; the low surrogate
    // differs, so the full pair must align — this is not a partial match.
    assertEquals(
      new StringSchema().startsWith(astral).validate("\uD835x").errors,
      [
        {
          message: '"string" does not start with "𝓪"',
        },
      ],
    );
    // Needle is just the high surrogate; matches the first code unit of the
    // astral value (matches native startsWith code-unit semantics).
    assertEquals(
      new StringSchema().startsWith("\uD835").validate("𝓪").errors,
      undefined,
    );
    // Needle is a full pair but value's first code unit is a lone high
    // surrogate followed by an unrelated code unit -> fail.
    assertEquals(
      new StringSchema().startsWith(astral).validate("\uD835\u0010").errors,
      [
        {
          message: '"string" does not start with "𝓪"',
        },
      ],
    );
  },
);

Deno.test(
  "String Schema Validation: 'endsWith' astral characters (surrogate pairs)",
  () => {
    const astral = "𝓪"; // U+1D4EA, two UTF-16 code units: \uD835\uDCEA

    // Full pair at the end -> pass.
    assertEquals(
      new StringSchema().endsWith(astral).validate("bc𝓪").errors,
      undefined,
    );
    // No match -> fail.
    assertEquals(new StringSchema().endsWith(astral).validate("abc").errors, [
      {
        message: '"string" does not end with "𝓪"',
      },
    ]);
    // Value ends with the full pair; needle is the high surrogate only -> the
    // last code unit of the value is the low surrogate, so no match.
    assertEquals(new StringSchema().endsWith("\uD835").validate("𝓪").errors, [
      {
        message: '"string" does not end with "\uD835"',
      },
    ]);
    // Value ends with a lone high surrogate; needle is the high surrogate -> pass.
    assertEquals(
      new StringSchema().endsWith("\uD835").validate("x\uD835").errors,
      undefined,
    );
    // Value ends with a lone high surrogate; needle is the full pair -> fail.
    assertEquals(
      new StringSchema().endsWith(astral).validate("x\uD835").errors,
      [
        {
          message: '"string" does not end with "𝓪"',
        },
      ],
    );
  },
);

Deno.test("String Schema Validation: 'regex'", () => {
  const regex = new StringSchema().regex(/^[a-z]+$/g);

  assertArrayIncludes(regex.validate(undefined).errors!, [regexMessage]);
  assertArrayIncludes(regex.validate(null).errors!, [regexMessage]);

  assertArrayIncludes(regex.validate("").errors!, [regexMessage]);
  assertEquals(regex.validate("cargo").errors, undefined);

  assertArrayIncludes(regex.validate(-1).errors!, [regexMessage]);
  assertArrayIncludes(regex.validate(0).errors!, [regexMessage]);
  assertArrayIncludes(regex.validate(1).errors!, [regexMessage]);

  assertArrayIncludes(regex.validate(NaN).errors!, [regexMessage]);
  assertArrayIncludes(regex.validate(Infinity).errors!, [regexMessage]);
  assertArrayIncludes(regex.validate(-Infinity).errors!, [regexMessage]);

  assertArrayIncludes(regex.validate(true).errors!, [regexMessage]);
  assertArrayIncludes(regex.validate(false).errors!, [regexMessage]);

  assertArrayIncludes(regex.validate({}).errors!, [regexMessage]);
  assertArrayIncludes(regex.validate([]).errors!, [regexMessage]);
  assertArrayIncludes(regex.validate(() => {}).errors!, [regexMessage]);
});

Deno.test("Basic JSON Schema", () => {
  const schema = new StringSchema();
  const jsonSchema = schema.jsonSchema();
  assertEquals(jsonSchema, { type: "string" });
});

Deno.test("String Schema Validation: 'length'", () => {
  const length = new StringSchema().length(5);

  assertArrayIncludes(length.validate(undefined).errors!, [
    requiredMessage,
    lengthMessage,
  ]);
  assertArrayIncludes(length.validate(null).errors!, [
    requiredMessage,
    lengthMessage,
  ]);

  assertArrayIncludes(length.validate("").errors!, [lengthMessage]);
  assertEquals(length.validate("Cargo").errors, undefined);

  assertArrayIncludes(length.validate(-1).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assertArrayIncludes(length.validate(0).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assertArrayIncludes(length.validate(1).errors!, [
    notStringMessage,
    lengthMessage,
  ]);

  assertArrayIncludes(length.validate(NaN).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assertArrayIncludes(length.validate(Infinity).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assertArrayIncludes(length.validate(-Infinity).errors!, [
    notStringMessage,
    lengthMessage,
  ]);

  assertArrayIncludes(length.validate(true).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assertArrayIncludes(length.validate(false).errors!, [
    notStringMessage,
    lengthMessage,
  ]);

  assertArrayIncludes(length.validate({}).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assertArrayIncludes(length.validate([]).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assertArrayIncludes(length.validate(() => {}).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
});

Deno.test("String Schema Validation: 'minLength'", () => {
  const minLength = new StringSchema().minLength(3);

  assertArrayIncludes(minLength.validate(undefined).errors!, [
    requiredMessage,
    minLengthMessage,
  ]);
  assertArrayIncludes(minLength.validate(null).errors!, [
    requiredMessage,
    minLengthMessage,
  ]);

  assertArrayIncludes(minLength.validate("").errors!, [minLengthMessage]);
  assertEquals(minLength.validate("Cargo").errors, undefined);

  assertArrayIncludes(minLength.validate(-1).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assertArrayIncludes(minLength.validate(0).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assertArrayIncludes(minLength.validate(1).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);

  assertArrayIncludes(minLength.validate(NaN).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assertArrayIncludes(minLength.validate(Infinity).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assertArrayIncludes(minLength.validate(-Infinity).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);

  assertArrayIncludes(minLength.validate(true).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assertArrayIncludes(minLength.validate(false).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);

  assertArrayIncludes(minLength.validate({}).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assertArrayIncludes(minLength.validate([]).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assertArrayIncludes(minLength.validate(() => {}).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
});

Deno.test("String Schema Validation: 'maxLength'", () => {
  const maxLength = new StringSchema().maxLength(10);

  assertArrayIncludes(maxLength.validate(undefined).errors!, [
    requiredMessage,
    maxLengthMessage,
  ]);
  assertArrayIncludes(maxLength.validate(null).errors!, [
    requiredMessage,
    maxLengthMessage,
  ]);

  assertEquals(maxLength.validate("").errors, undefined);
  assertEquals(maxLength.validate("Cargo").errors, undefined);
  assertArrayIncludes(maxLength.validate("CargoShipYard").errors!, [
    maxLengthMessage,
  ]);

  assertArrayIncludes(maxLength.validate(-1).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assertArrayIncludes(maxLength.validate(0).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assertArrayIncludes(maxLength.validate(1).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);

  assertArrayIncludes(maxLength.validate(NaN).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assertArrayIncludes(maxLength.validate(Infinity).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assertArrayIncludes(maxLength.validate(-Infinity).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);

  assertArrayIncludes(maxLength.validate(true).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assertArrayIncludes(maxLength.validate(false).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);

  assertArrayIncludes(maxLength.validate({}).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assertArrayIncludes(maxLength.validate([]).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assertArrayIncludes(maxLength.validate(() => {}).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
});
