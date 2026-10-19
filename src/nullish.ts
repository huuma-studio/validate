/**
 * Schemas for the nullish values `null` and `undefined`, grouped so they can
 * use their real names: `nullish.null()` and `nullish.undefined()`.
 *
 * @module
 */
import { NullSchema } from "./null.ts";
import { UndefinedSchema } from "./undefined.ts";

export interface Nullish {
  /** Creates a schema that accepts only `null`. */
  null(): NullSchema;
  /** Creates a schema that accepts only `undefined`. */
  undefined(): UndefinedSchema<undefined>;
}

export const nullish: Nullish = {
  null(): NullSchema {
    return new NullSchema();
  },
  undefined(): UndefinedSchema<undefined> {
    return new UndefinedSchema();
  },
};
