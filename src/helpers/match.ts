import type { Option } from "../option";
import type { Result } from "../result";

// Hidden discriminant tag — set by Ok/Err/Some/None instances for O(1) dispatch.
// Same Symbol as the one declared in the variant classes via Symbol.for.
const TAG = Symbol.for("@consolidados/results.tag");

// Utility types for mixed primitive + object unions
type PrimitiveMembers<T> = Extract<T, PropertyKey>;
type ObjectKeys<T> = T extends object ? keyof T : never;
type ObjectPropertyType<T, K extends PropertyKey> = T extends object
  ? K extends keyof T
    ? T[K]
    : never
  : never;

// Helper to determine if a key K is a primitive member or object key
type HandlerFor<T, K extends PropertyKey, R> = K extends PrimitiveMembers<T>
  ? () => R
  : K extends ObjectKeys<T>
    ? (value: ObjectPropertyType<T, K>) => R
    : never;

// Build cases type with a single mapped type
type MatchCases<T, R, HasDefault extends boolean = false> = (HasDefault extends true
  ? Partial<{
      [K in PrimitiveMembers<T> | ObjectKeys<T>]: HandlerFor<T, K, R>;
    }>
  : {
      [K in PrimitiveMembers<T> | ObjectKeys<T>]: HandlerFor<T, K, R>;
    }) &
  (HasDefault extends true ? { default: () => R } : {});

// Overload for Result type
export function match<T, E, ROk, RErr>(
  matcher: Result<T, E>,
  cases: {
    Ok: (value: T) => ROk;
    Err: (error: E) => RErr;
  },
): ROk | RErr;

// Overload for Option type
export function match<T, RSome, RNone>(
  matcher: Option<T>,
  cases: {
    Some: (value: T) => RSome;
    None: () => RNone;
  },
): RSome | RNone;

// Overload for mixed primitive + object unions WITH default (cases optional)
export function match<T extends PropertyKey | object, R>(
  matcher: T,
  cases: MatchCases<T, R, true>,
): R;

// Overload for mixed primitive + object unions WITHOUT default (exhaustive)
export function match<T extends PropertyKey | object, R>(
  matcher: T,
  cases: MatchCases<T, R, false>,
): R;

// Overload for discriminated unions with default case
export function match<
  T extends { [K in D]: string | number | symbol },
  D extends keyof T,
  R,
>(
  matcher: T,
  cases: { [K in T[D]]?: (value: Extract<T, { [P in D]: K }>) => R } & {
    default: (value: T) => R;
  },
  discriminant: D,
): R;

// Overload for discriminated unions without default case (exhaustive)
export function match<
  T extends { [K in D]: string | number | symbol },
  D extends keyof T,
  R,
>(
  matcher: T,
  cases: { [K in T[D]]: (value: Extract<T, { [P in D]: K }>) => R },
  discriminant: D,
): R;

// Overload for primitives with default case
export function match<T extends PropertyKey, R>(
  matcher: T,
  cases: Partial<Record<T, () => R>> & { default: () => R },
): R;

// Overload for primitives without default case (exhaustive)
export function match<T extends PropertyKey, R>(
  matcher: T,
  cases: Record<T, () => R>,
): R;

// Implementation
export function match<T, E, R>(
  matcher: Result<T, E> | Option<T> | any,
  cases: any,
  discriminant?: keyof any,
): R {
  // 1) Primitives (string/number/symbol) — direct key lookup, O(1).
  const t = typeof matcher;
  if (t === "string" || t === "number" || t === "symbol") {
    const handler = cases[matcher];
    if (handler) return handler();
    if (cases.default) return cases.default();
    throw new Error(`No case found for value: ${String(matcher)}`);
  }

  if (matcher !== null && t === "object") {
    // 2) Tagged variant (Ok/Err/Some/None) — single Symbol read + single lookup.
    //    The Symbol property is invisible to `for...in`, `Object.keys`, and
    //    `JSON.stringify`, so mixed unions with plain-object variants are
    //    unaffected.
    const tag = matcher[TAG];
    if (tag !== undefined) {
      const handler = cases[tag];
      if (!handler) throw new Error(`Missing case for ${tag}`);
      if (tag === "Ok" || tag === "Some") return handler(matcher.unwrap());
      if (tag === "Err") return handler(matcher.unwrapErr() as E);
      // tag === "None"
      return handler();
    }

    // 3) Discriminated union via explicit `discriminant` arg — O(1).
    if (discriminant) {
      const dv = matcher[discriminant];
      const handler = cases[dv];
      if (handler) return handler(matcher);
      if (cases.default) return cases.default(matcher);
      throw new Error(`No case found for discriminant value: ${String(dv)}`);
    }

    // 4) Mixed primitive + object union — iterate matcher's own enumerable
    //    keys (usually 1 for tagged variant objects like `{ Other: [...] }`)
    //    and look up by key in cases. This flips the loop from O(cases)
    //    to O(matcher-keys), which is effectively O(1) for tagged variants.
    for (const key in matcher) {
      if (key === "default") continue;
      if (key in cases) {
        const handler = cases[key];
        if (handler) {
          return typeof handler === "function"
            ? handler(matcher[key])
            : handler();
        }
      }
    }
    if (cases.default) return cases.default();
  }

  throw new Error("Invalid matcher or missing case");
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
(globalThis as any).match = match;
