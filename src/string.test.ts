import { assert, test } from "vite-plus/test";
import { StringSchema } from "./string.ts";
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

test("String Schema Validation: 'isString'", () => {
  const isString = new StringSchema();
  assert.deepEqual(isString.toString(), "string");
});

test("String Schema Validation: 'isString'", () => {
  const isString = new StringSchema();

  assert.includeDeepMembers(isString.validate(undefined).errors!, [
    requiredMessage,
  ]);
  assert.includeDeepMembers(isString.validate(null).errors!, [
    notStringMessage,
  ]);

  assert.deepEqual(isString.validate("").errors, undefined);
  assert.deepEqual(isString.validate("Cargo").errors, undefined);

  assert.includeDeepMembers(isString.validate(-1).errors!, [notStringMessage]);
  assert.includeDeepMembers(isString.validate(0).errors!, [notStringMessage]);
  assert.includeDeepMembers(isString.validate(1).errors!, [notStringMessage]);

  assert.includeDeepMembers(isString.validate(NaN).errors!, [notStringMessage]);
  assert.includeDeepMembers(isString.validate(Infinity).errors!, [
    notStringMessage,
  ]);
  assert.includeDeepMembers(isString.validate(-Infinity).errors!, [
    notStringMessage,
  ]);

  assert.includeDeepMembers(isString.validate(true).errors!, [
    notStringMessage,
  ]);
  assert.includeDeepMembers(isString.validate(false).errors!, [
    notStringMessage,
  ]);

  assert.includeDeepMembers(isString.validate({}).errors!, [notStringMessage]);
  assert.includeDeepMembers(isString.validate([]).errors!, [notStringMessage]);
  assert.includeDeepMembers(isString.validate(() => {}).errors!, [
    notStringMessage,
  ]);
});

test("String Schema Validation: 'required'", () => {
  const required = new StringSchema().optional().required();

  assert.includeDeepMembers(required.validate(undefined).errors!, [
    requiredMessage,
  ]);
  assert.includeDeepMembers(required.validate(null).errors!, [
    notStringMessage,
  ]);

  assert.deepEqual(required.validate("").errors, undefined);
  assert.deepEqual(required.validate("Cargo").errors, undefined);

  assert.includeDeepMembers(required.validate(-1).errors!, [notStringMessage]);
  assert.includeDeepMembers(required.validate(0).errors!, [notStringMessage]);
  assert.includeDeepMembers(required.validate(1).errors!, [notStringMessage]);

  assert.includeDeepMembers(required.validate(NaN).errors!, [notStringMessage]);
  assert.includeDeepMembers(required.validate(Infinity).errors!, [
    notStringMessage,
  ]);
  assert.includeDeepMembers(required.validate(-Infinity).errors!, [
    notStringMessage,
  ]);

  assert.includeDeepMembers(required.validate(true).errors!, [
    notStringMessage,
  ]);
  assert.includeDeepMembers(required.validate(false).errors!, [
    notStringMessage,
  ]);

  assert.includeDeepMembers(required.validate({}).errors!, [notStringMessage]);
  assert.includeDeepMembers(required.validate([]).errors!, [notStringMessage]);
  assert.includeDeepMembers(required.validate(() => {}).errors!, [
    notStringMessage,
  ]);
});

test("String Schema Validation: 'optional'", () => {
  const optional = new StringSchema().optional();

  assert.deepEqual(optional.validate(undefined).errors, undefined);
  assert.includeDeepMembers(optional.validate(null).errors!, [
    notStringMessage,
  ]);

  assert.deepEqual(optional.validate("").errors, undefined);
  assert.deepEqual(optional.validate("Cargo").errors, undefined);

  assert.includeDeepMembers(optional.validate(-1).errors!, [notStringMessage]);
  assert.includeDeepMembers(optional.validate(0).errors!, [notStringMessage]);
  assert.includeDeepMembers(optional.validate(1).errors!, [notStringMessage]);

  assert.includeDeepMembers(optional.validate(NaN).errors!, [notStringMessage]);
  assert.includeDeepMembers(optional.validate(Infinity).errors!, [
    notStringMessage,
  ]);
  assert.includeDeepMembers(optional.validate(-Infinity).errors!, [
    notStringMessage,
  ]);
  assert.includeDeepMembers(optional.validate(NaN).errors!, [notStringMessage]);

  assert.includeDeepMembers(optional.validate(true).errors!, [
    notStringMessage,
  ]);
  assert.includeDeepMembers(optional.validate(false).errors!, [
    notStringMessage,
  ]);

  assert.includeDeepMembers(optional.validate({}).errors!, [notStringMessage]);
  assert.includeDeepMembers(optional.validate([]).errors!, [notStringMessage]);
  assert.includeDeepMembers(optional.validate(() => {}).errors!, [
    notStringMessage,
  ]);
});

test("String Schema Validation: 'notEmpty'", () => {
  const notEmpty = new StringSchema().notEmpty();

  assert.includeDeepMembers(notEmpty.validate(undefined).errors!, [
    notEmptyMessage,
  ]);
  assert.includeDeepMembers(notEmpty.validate(null).errors!, [
    notStringMessage,
  ]);

  assert.includeDeepMembers(notEmpty.validate("").errors!, [notEmptyMessage]);
  assert.deepEqual(notEmpty.validate("Cargo").errors, undefined);

  assert.includeDeepMembers(notEmpty.validate(-1).errors!, [notStringMessage]);
  assert.includeDeepMembers(notEmpty.validate(0).errors!, [notStringMessage]);
  assert.includeDeepMembers(notEmpty.validate(1).errors!, [notStringMessage]);

  assert.includeDeepMembers(notEmpty.validate(NaN).errors!, [notStringMessage]);
  assert.includeDeepMembers(notEmpty.validate(Infinity).errors!, [
    notStringMessage,
  ]);
  assert.includeDeepMembers(notEmpty.validate(-Infinity).errors!, [
    notStringMessage,
  ]);

  assert.includeDeepMembers(notEmpty.validate(true).errors!, [
    notStringMessage,
  ]);
  assert.includeDeepMembers(notEmpty.validate(false).errors!, [
    notStringMessage,
  ]);

  assert.includeDeepMembers(notEmpty.validate({}).errors!, [notStringMessage]);
  assert.includeDeepMembers(notEmpty.validate([]).errors!, [notStringMessage]);
  assert.includeDeepMembers(notEmpty.validate(() => {}).errors!, [
    notStringMessage,
  ]);
});

test("String Schema Validation: 'empty'", () => {
  const empty = new StringSchema().empty();

  assert.includeDeepMembers(empty.validate(undefined).errors!, [
    requiredMessage,
    notStringMessage,
  ]);
  assert.includeDeepMembers(empty.validate(null).errors!, [notStringMessage]);

  assert.deepEqual(empty.validate("").errors, undefined);
  assert.includeDeepMembers(empty.validate("Cargo").errors!, [emptyMessage]);

  assert.includeDeepMembers(empty.validate(-1).errors!, [notStringMessage]);
  assert.includeDeepMembers(empty.validate(0).errors!, [notStringMessage]);
  assert.includeDeepMembers(empty.validate(1).errors!, [notStringMessage]);

  assert.includeDeepMembers(empty.validate(NaN).errors!, [notStringMessage]);
  assert.includeDeepMembers(empty.validate(Infinity).errors!, [
    notStringMessage,
  ]);
  assert.includeDeepMembers(empty.validate(-Infinity).errors!, [
    notStringMessage,
  ]);

  assert.includeDeepMembers(empty.validate(true).errors!, [notStringMessage]);
  assert.includeDeepMembers(empty.validate(false).errors!, [notStringMessage]);

  assert.includeDeepMembers(empty.validate({}).errors!, [notStringMessage]);
  assert.includeDeepMembers(empty.validate([]).errors!, [notStringMessage]);
  assert.includeDeepMembers(empty.validate(() => {}).errors!, [
    notStringMessage,
  ]);
});

test("String Schema Validation: 'equals'", () => {
  const equals = new StringSchema().equals("Cargo");

  assert.includeDeepMembers(equals.validate(undefined).errors!, [
    equalsMessage,
  ]);
  assert.includeDeepMembers(equals.validate(null).errors!, [equalsMessage]);

  assert.includeDeepMembers(equals.validate("").errors!, [equalsMessage]);
  assert.deepEqual(equals.validate("Cargo").errors, undefined);

  assert.includeDeepMembers(equals.validate(-1).errors!, [equalsMessage]);
  assert.includeDeepMembers(equals.validate(0).errors!, [equalsMessage]);
  assert.includeDeepMembers(equals.validate(1).errors!, [equalsMessage]);

  assert.includeDeepMembers(equals.validate(NaN).errors!, [equalsMessage]);
  assert.includeDeepMembers(equals.validate(Infinity).errors!, [equalsMessage]);
  assert.includeDeepMembers(equals.validate(-Infinity).errors!, [
    equalsMessage,
  ]);

  assert.includeDeepMembers(equals.validate(true).errors!, [equalsMessage]);
  assert.includeDeepMembers(equals.validate(false).errors!, [equalsMessage]);

  assert.includeDeepMembers(equals.validate({}).errors!, [equalsMessage]);
  assert.includeDeepMembers(equals.validate([]).errors!, [equalsMessage]);
  assert.includeDeepMembers(equals.validate(() => {}).errors!, [equalsMessage]);
});

test("String Schema Validation: 'notEquals'", () => {
  const notEquals = new StringSchema().notEquals("Cargo");

  assert.includeDeepMembers(notEquals.validate(undefined).errors!, [
    requiredMessage,
    notStringMessage,
  ]);
  assert.includeDeepMembers(notEquals.validate(null).errors!, [
    notStringMessage,
  ]);

  assert.deepEqual(notEquals.validate("").errors, undefined);
  assert.includeDeepMembers(notEquals.validate("Cargo").errors!, [
    notEqualsMessage,
  ]);

  assert.includeDeepMembers(notEquals.validate(-1).errors!, [notStringMessage]);
  assert.includeDeepMembers(notEquals.validate(0).errors!, [notStringMessage]);
  assert.includeDeepMembers(notEquals.validate(1).errors!, [notStringMessage]);

  assert.includeDeepMembers(notEquals.validate(NaN).errors!, [
    notStringMessage,
  ]);
  assert.includeDeepMembers(notEquals.validate(Infinity).errors!, [
    notStringMessage,
  ]);
  assert.includeDeepMembers(notEquals.validate(-Infinity).errors!, [
    notStringMessage,
  ]);

  assert.includeDeepMembers(notEquals.validate(true).errors!, [
    notStringMessage,
  ]);
  assert.includeDeepMembers(notEquals.validate(false).errors!, [
    notStringMessage,
  ]);

  assert.includeDeepMembers(notEquals.validate({}).errors!, [notStringMessage]);
  assert.includeDeepMembers(notEquals.validate([]).errors!, [notStringMessage]);
  assert.includeDeepMembers(notEquals.validate(() => {}).errors!, [
    notStringMessage,
  ]);
});

test("String Schema Validation: 'startsWith'", () => {
  const startsWith = new StringSchema().startsWith("Ca");

  assert.includeDeepMembers(startsWith.validate(undefined).errors!, [
    requiredMessage,
  ]);
  assert.includeDeepMembers(startsWith.validate(null).errors!, [
    startsWithMessage,
  ]);

  assert.includeDeepMembers(startsWith.validate("").errors!, [
    startsWithMessage,
  ]);
  assert.deepEqual(startsWith.validate("Cargo").errors, undefined);

  assert.includeDeepMembers(startsWith.validate(-1).errors!, [
    startsWithMessage,
  ]);
  assert.includeDeepMembers(startsWith.validate(0).errors!, [
    startsWithMessage,
  ]);
  assert.includeDeepMembers(startsWith.validate(1).errors!, [
    startsWithMessage,
  ]);

  assert.includeDeepMembers(startsWith.validate(NaN).errors!, [
    startsWithMessage,
  ]);
  assert.includeDeepMembers(startsWith.validate(Infinity).errors!, [
    startsWithMessage,
  ]);
  assert.includeDeepMembers(startsWith.validate(-Infinity).errors!, [
    startsWithMessage,
  ]);

  assert.includeDeepMembers(startsWith.validate(true).errors!, [
    startsWithMessage,
  ]);
  assert.includeDeepMembers(startsWith.validate(false).errors!, [
    startsWithMessage,
  ]);

  assert.includeDeepMembers(startsWith.validate({}).errors!, [
    startsWithMessage,
  ]);
  assert.includeDeepMembers(startsWith.validate([]).errors!, [
    startsWithMessage,
  ]);
  assert.includeDeepMembers(startsWith.validate(() => {}).errors!, [
    startsWithMessage,
  ]);
});
test("String Schema Validation: 'endsWith'", () => {
  const startsWith = new StringSchema().endsWith("go");

  assert.includeDeepMembers(startsWith.validate(undefined).errors!, [
    endsWithMessage,
  ]);
  assert.includeDeepMembers(startsWith.validate(null).errors!, [
    endsWithMessage,
  ]);

  assert.includeDeepMembers(startsWith.validate("").errors!, [endsWithMessage]);
  assert.deepEqual(startsWith.validate("Cargo").errors, undefined);

  assert.includeDeepMembers(startsWith.validate(-1).errors!, [endsWithMessage]);
  assert.includeDeepMembers(startsWith.validate(0).errors!, [endsWithMessage]);
  assert.includeDeepMembers(startsWith.validate(1).errors!, [endsWithMessage]);

  assert.includeDeepMembers(startsWith.validate(NaN).errors!, [
    endsWithMessage,
  ]);
  assert.includeDeepMembers(startsWith.validate(Infinity).errors!, [
    endsWithMessage,
  ]);
  assert.includeDeepMembers(startsWith.validate(-Infinity).errors!, [
    endsWithMessage,
  ]);

  assert.includeDeepMembers(startsWith.validate(true).errors!, [
    endsWithMessage,
  ]);
  assert.includeDeepMembers(startsWith.validate(false).errors!, [
    endsWithMessage,
  ]);

  assert.includeDeepMembers(startsWith.validate({}).errors!, [endsWithMessage]);
  assert.includeDeepMembers(startsWith.validate([]).errors!, [endsWithMessage]);
  assert.includeDeepMembers(startsWith.validate(() => {}).errors!, [
    endsWithMessage,
  ]);
});

test("String Schema Validation: 'startsWith' treats needle literally (no regex)", () => {
  // Regression: the old RegExp-based impl built `new RegExp("^" + needle)`,
  // so metacharacters in the needle were interpreted as a pattern. The
  // code-unit loop matches literally.
  const schema = (needle: string) => new StringSchema().startsWith(needle);

  // `.` previously matched any single character.
  assert.deepEqual(schema(".").validate("x").errors, [
    {
      message: '"string" does not start with "."',
    },
  ]);
  assert.deepEqual(schema(".").validate(".x").errors, undefined);

  // `a.b` previously matched `aXb`.
  assert.deepEqual(schema("a.b").validate("aXb").errors, [
    {
      message: '"string" does not start with "a.b"',
    },
  ]);
  assert.deepEqual(schema("a.b").validate("a.b").errors, undefined);
  assert.deepEqual(schema("a.b").validate("a.bc").errors, undefined);

  // `^` is the start anchor in regex; `^x` must match a literal leading `^`.
  assert.deepEqual(schema("^").validate("abc").errors, [
    {
      message: '"string" does not start with "^"',
    },
  ]);
  assert.deepEqual(schema("^").validate("^abc").errors, undefined);

  // `$` is the end anchor in regex; as a prefix it must be literal.
  assert.deepEqual(schema("$").validate("abc").errors, [
    {
      message: '"string" does not start with "$"',
    },
  ]);
  assert.deepEqual(schema("$").validate("$1").errors, undefined);

  // Quantifiers / brackets / alternation / escapes — all literal now.
  assert.deepEqual(schema("a*").validate("aaa").errors, [
    {
      message: '"string" does not start with "a*"',
    },
  ]);
  assert.deepEqual(schema("a*").validate("a*").errors, undefined);
  assert.deepEqual(schema("(a)").validate("(a)").errors, undefined);
  assert.deepEqual(schema("[a]").validate("[a]").errors, undefined);
  assert.deepEqual(schema("a|b").validate("b").errors, [
    {
      message: '"string" does not start with "a|b"',
    },
  ]);
  assert.deepEqual(schema("a|b").validate("a|b").errors, undefined);
  assert.deepEqual(schema("\\d").validate("\\d").errors, undefined);
  assert.deepEqual(schema("\\d").validate("d").errors, [
    {
      message: '"string" does not start with "\\d"',
    },
  ]);
});

test("String Schema Validation: 'endsWith' treats needle literally (no regex)", () => {
  // Regression: the old impl built `new RegExp(needle + "$")`, so `$` in the
  // needle collided with the appended end anchor and metacharacters acted as a
  // pattern. The code-unit loop matches literally.
  const schema = (needle: string) => new StringSchema().endsWith(needle);

  // `.` previously matched any trailing character.
  assert.deepEqual(schema(".").validate("x").errors, [
    {
      message: '"string" does not end with "."',
    },
  ]);
  assert.deepEqual(schema(".").validate("x.").errors, undefined);

  // `a.b` previously matched `aXb`.
  assert.deepEqual(schema("a.b").validate("aXb").errors, [
    {
      message: '"string" does not end with "a.b"',
    },
  ]);
  assert.deepEqual(schema("a.b").validate("a.b").errors, undefined);
  assert.deepEqual(schema("a.b").validate("xa.b").errors, undefined);

  // `$` in the needle previously merged with the appended anchor.
  assert.deepEqual(schema("$").validate("abc").errors, [
    {
      message: '"string" does not end with "$"',
    },
  ]);
  assert.deepEqual(schema("$").validate("abc$").errors, undefined);

  // `^` as a suffix must be literal.
  assert.deepEqual(schema("^").validate("abc").errors, [
    {
      message: '"string" does not end with "^"',
    },
  ]);
  assert.deepEqual(schema("^").validate("abc^").errors, undefined);

  // Quantifiers / brackets / alternation / escapes — all literal now.
  assert.deepEqual(schema("a*").validate("aaa").errors, [
    {
      message: '"string" does not end with "a*"',
    },
  ]);
  assert.deepEqual(schema("a*").validate("aa*").errors, undefined);
  assert.deepEqual(schema("(a)").validate("x(a)").errors, undefined);
  assert.deepEqual(schema("[a]").validate("x[a]").errors, undefined);
  assert.deepEqual(schema("a|b").validate("a").errors, [
    {
      message: '"string" does not end with "a|b"',
    },
  ]);
  assert.deepEqual(schema("a|b").validate("xa|b").errors, undefined);
  assert.deepEqual(schema("\\d").validate("\\d").errors, undefined);
  assert.deepEqual(schema("\\d").validate("d").errors, [
    {
      message: '"string" does not end with "\\d"',
    },
  ]);
});

test("String Schema Validation: 'startsWith' length boundaries", () => {
  // Empty needle matches any string (including ""), matching native startsWith.
  assert.deepEqual(
    new StringSchema().startsWith("").validate("").errors,
    undefined,
  );
  assert.deepEqual(
    new StringSchema().startsWith("").validate("Cargo").errors,
    undefined,
  );

  // Needle longer than value -> fail (length guard, no index access).
  assert.deepEqual(
    new StringSchema().startsWith("Cargo").validate("Ca").errors,
    [
      {
        message: '"string" does not start with "Cargo"',
      },
    ],
  );

  // Needle equal in length to value -> exact equality required.
  assert.deepEqual(
    new StringSchema().startsWith("Cargo").validate("Cargo").errors,
    undefined,
  );
  assert.deepEqual(
    new StringSchema().startsWith("Cargo").validate("Cargx").errors,
    [
      {
        message: '"string" does not start with "Cargo"',
      },
    ],
  );

  // Whole value is a prefix of a longer string -> pass.
  assert.deepEqual(
    new StringSchema().startsWith("Cargo").validate("CargoShip").errors,
    undefined,
  );

  // Single code unit vs single code unit.
  assert.deepEqual(
    new StringSchema().startsWith("C").validate("C").errors,
    undefined,
  );
  assert.deepEqual(new StringSchema().startsWith("C").validate("c").errors, [
    {
      message: '"string" does not start with "C"',
    },
  ]);
});

test("String Schema Validation: 'endsWith' length boundaries", () => {
  // Empty needle matches any string.
  assert.deepEqual(
    new StringSchema().endsWith("").validate("").errors,
    undefined,
  );
  assert.deepEqual(
    new StringSchema().endsWith("").validate("Cargo").errors,
    undefined,
  );

  // Needle longer than value -> fail.
  assert.deepEqual(new StringSchema().endsWith("Cargo").validate("go").errors, [
    {
      message: '"string" does not end with "Cargo"',
    },
  ]);

  // Needle equal in length to value -> exact equality required.
  assert.deepEqual(
    new StringSchema().endsWith("Cargo").validate("Cargo").errors,
    undefined,
  );
  assert.deepEqual(
    new StringSchema().endsWith("Cargo").validate("Cargx").errors,
    [
      {
        message: '"string" does not end with "Cargo"',
      },
    ],
  );

  // Suffix of a longer string -> pass.
  assert.deepEqual(
    new StringSchema().endsWith("go").validate("Cargo").errors,
    undefined,
  );

  // Single code unit vs single code unit.
  assert.deepEqual(
    new StringSchema().endsWith("o").validate("o").errors,
    undefined,
  );
  assert.deepEqual(new StringSchema().endsWith("o").validate("O").errors, [
    {
      message: '"string" does not end with "o"',
    },
  ]);
});

test("String Schema Validation: 'startsWith' astral characters (surrogate pairs)", () => {
  const astral = "𝓪"; // U+1D4EA, two UTF-16 code units: \uD835\uDCEA

  // Full pair at the start -> pass.
  assert.deepEqual(
    new StringSchema().startsWith(astral).validate("𝓪bc").errors,
    undefined,
  );
  // No match -> fail.
  assert.deepEqual(
    new StringSchema().startsWith(astral).validate("abc").errors,
    [
      {
        message: '"string" does not start with "𝓪"',
      },
    ],
  );
  // Only the high surrogate matches the first code unit; the low surrogate
  // differs, so the full pair must align — this is not a partial match.
  assert.deepEqual(
    new StringSchema().startsWith(astral).validate("\uD835x").errors,
    [
      {
        message: '"string" does not start with "𝓪"',
      },
    ],
  );
  // Needle is just the high surrogate; matches the first code unit of the
  // astral value (matches native startsWith code-unit semantics).
  assert.deepEqual(
    new StringSchema().startsWith("\uD835").validate("𝓪").errors,
    undefined,
  );
  // Needle is a full pair but value's first code unit is a lone high
  // surrogate followed by an unrelated code unit -> fail.
  assert.deepEqual(
    new StringSchema().startsWith(astral).validate("\uD835\u0010").errors,
    [
      {
        message: '"string" does not start with "𝓪"',
      },
    ],
  );
});

test("String Schema Validation: 'endsWith' astral characters (surrogate pairs)", () => {
  const astral = "𝓪"; // U+1D4EA, two UTF-16 code units: \uD835\uDCEA

  // Full pair at the end -> pass.
  assert.deepEqual(
    new StringSchema().endsWith(astral).validate("bc𝓪").errors,
    undefined,
  );
  // No match -> fail.
  assert.deepEqual(new StringSchema().endsWith(astral).validate("abc").errors, [
    {
      message: '"string" does not end with "𝓪"',
    },
  ]);
  // Value ends with the full pair; needle is the high surrogate only -> the
  // last code unit of the value is the low surrogate, so no match.
  assert.deepEqual(new StringSchema().endsWith("\uD835").validate("𝓪").errors, [
    {
      message: '"string" does not end with "\uD835"',
    },
  ]);
  // Value ends with a lone high surrogate; needle is the high surrogate -> pass.
  assert.deepEqual(
    new StringSchema().endsWith("\uD835").validate("x\uD835").errors,
    undefined,
  );
  // Value ends with a lone high surrogate; needle is the full pair -> fail.
  assert.deepEqual(
    new StringSchema().endsWith(astral).validate("x\uD835").errors,
    [
      {
        message: '"string" does not end with "𝓪"',
      },
    ],
  );
});

test("String Schema Validation: 'regex'", () => {
  const regex = new StringSchema().regex(/^[a-z]+$/g);

  assert.includeDeepMembers(regex.validate(undefined).errors!, [regexMessage]);
  assert.includeDeepMembers(regex.validate(null).errors!, [regexMessage]);

  assert.includeDeepMembers(regex.validate("").errors!, [regexMessage]);
  assert.deepEqual(regex.validate("cargo").errors, undefined);

  assert.includeDeepMembers(regex.validate(-1).errors!, [regexMessage]);
  assert.includeDeepMembers(regex.validate(0).errors!, [regexMessage]);
  assert.includeDeepMembers(regex.validate(1).errors!, [regexMessage]);

  assert.includeDeepMembers(regex.validate(NaN).errors!, [regexMessage]);
  assert.includeDeepMembers(regex.validate(Infinity).errors!, [regexMessage]);
  assert.includeDeepMembers(regex.validate(-Infinity).errors!, [regexMessage]);

  assert.includeDeepMembers(regex.validate(true).errors!, [regexMessage]);
  assert.includeDeepMembers(regex.validate(false).errors!, [regexMessage]);

  assert.includeDeepMembers(regex.validate({}).errors!, [regexMessage]);
  assert.includeDeepMembers(regex.validate([]).errors!, [regexMessage]);
  assert.includeDeepMembers(regex.validate(() => {}).errors!, [regexMessage]);
});

test("Basic JSON Schema", () => {
  const schema = new StringSchema();
  const jsonSchema = schema.jsonSchema();
  assert.deepEqual(jsonSchema, { type: "string" });
});

test("String Schema Validation: a global regex gives consistent results across calls", () => {
  const schema = new StringSchema().regex(/^[a-z]+$/g);

  assert.deepEqual(schema.validate("abc").errors, undefined);
  assert.deepEqual(schema.validate("abc").errors, undefined);
  assert.deepEqual(schema.validate("abc").errors, undefined);
  assert.deepEqual(schema.validate("123").errors?.length, 1);
  assert.deepEqual(schema.validate("abc").errors, undefined);
});

test("String Schema Validation: a sticky regex gives consistent results across calls", () => {
  const schema = new StringSchema().regex(/^[a-z]+$/y);

  assert.deepEqual(schema.validate("abc").errors, undefined);
  assert.deepEqual(schema.validate("abc").errors, undefined);
  assert.deepEqual(schema.validate("abc").errors, undefined);
  assert.deepEqual(schema.validate("123").errors?.length, 1);
  assert.deepEqual(schema.validate("abc").errors, undefined);
});

test("String Schema Validation: 'length'", () => {
  const length = new StringSchema().length(5);

  assert.includeDeepMembers(length.validate(undefined).errors!, [
    requiredMessage,
    lengthMessage,
  ]);
  assert.includeDeepMembers(length.validate(null).errors!, [lengthMessage]);

  assert.includeDeepMembers(length.validate("").errors!, [lengthMessage]);
  assert.deepEqual(length.validate("Cargo").errors, undefined);

  assert.includeDeepMembers(length.validate(-1).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assert.includeDeepMembers(length.validate(0).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assert.includeDeepMembers(length.validate(1).errors!, [
    notStringMessage,
    lengthMessage,
  ]);

  assert.includeDeepMembers(length.validate(NaN).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assert.includeDeepMembers(length.validate(Infinity).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assert.includeDeepMembers(length.validate(-Infinity).errors!, [
    notStringMessage,
    lengthMessage,
  ]);

  assert.includeDeepMembers(length.validate(true).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assert.includeDeepMembers(length.validate(false).errors!, [
    notStringMessage,
    lengthMessage,
  ]);

  assert.includeDeepMembers(length.validate({}).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assert.includeDeepMembers(length.validate([]).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
  assert.includeDeepMembers(length.validate(() => {}).errors!, [
    notStringMessage,
    lengthMessage,
  ]);
});

test("String Schema Validation: 'minLength'", () => {
  const minLength = new StringSchema().minLength(3);

  assert.includeDeepMembers(minLength.validate(undefined).errors!, [
    requiredMessage,
    minLengthMessage,
  ]);
  assert.includeDeepMembers(minLength.validate(null).errors!, [
    minLengthMessage,
  ]);

  assert.includeDeepMembers(minLength.validate("").errors!, [minLengthMessage]);
  assert.deepEqual(minLength.validate("Cargo").errors, undefined);

  assert.includeDeepMembers(minLength.validate(-1).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assert.includeDeepMembers(minLength.validate(0).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assert.includeDeepMembers(minLength.validate(1).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);

  assert.includeDeepMembers(minLength.validate(NaN).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assert.includeDeepMembers(minLength.validate(Infinity).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assert.includeDeepMembers(minLength.validate(-Infinity).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);

  assert.includeDeepMembers(minLength.validate(true).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assert.includeDeepMembers(minLength.validate(false).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);

  assert.includeDeepMembers(minLength.validate({}).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assert.includeDeepMembers(minLength.validate([]).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
  assert.includeDeepMembers(minLength.validate(() => {}).errors!, [
    notStringMessage,
    minLengthMessage,
  ]);
});

test("String Schema Validation: 'maxLength'", () => {
  const maxLength = new StringSchema().maxLength(10);

  assert.includeDeepMembers(maxLength.validate(undefined).errors!, [
    requiredMessage,
    maxLengthMessage,
  ]);
  assert.includeDeepMembers(maxLength.validate(null).errors!, [
    maxLengthMessage,
  ]);

  assert.deepEqual(maxLength.validate("").errors, undefined);
  assert.deepEqual(maxLength.validate("Cargo").errors, undefined);
  assert.includeDeepMembers(maxLength.validate("CargoShipYard").errors!, [
    maxLengthMessage,
  ]);

  assert.includeDeepMembers(maxLength.validate(-1).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assert.includeDeepMembers(maxLength.validate(0).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assert.includeDeepMembers(maxLength.validate(1).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);

  assert.includeDeepMembers(maxLength.validate(NaN).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assert.includeDeepMembers(maxLength.validate(Infinity).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assert.includeDeepMembers(maxLength.validate(-Infinity).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);

  assert.includeDeepMembers(maxLength.validate(true).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assert.includeDeepMembers(maxLength.validate(false).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);

  assert.includeDeepMembers(maxLength.validate({}).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assert.includeDeepMembers(maxLength.validate([]).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
  assert.includeDeepMembers(maxLength.validate(() => {}).errors!, [
    notStringMessage,
    maxLengthMessage,
  ]);
});
