import type { Option } from "../option";
import type { Result } from "../result";

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
export function match<T, E, R>(
  matcher: Result<T, E>,
  cases: {
    Ok: (value: T) => R;
    Err: (error: E) => R;
  },
): R;

// Overload for Option type
export function match<T, R>(
  matcher: Option<T>,
  cases: {
    Some: (value: T) => R;
    None: () => R;
  },
): R;

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

// Result -> Option conversion
export function match<T, E>(
  matcher: Result<T, E>,
  cases: {
    Ok: (value: T) => Option<T>;
    Err: (error: E) => Option<T>;
  },
): Option<T>;

// Option -> Result conversion
export function match<T, E>(
  matcher: Option<T>,
  cases: {
    Some: (value: T) => Result<T, E>;
    None: () => Result<T, E>;
  },
): Result<T, E>;

// Implementation
export function match<T, E, R>(
  matcher: Result<T, E> | Option<T> | any,
  cases: any,
  discriminant?: keyof any,
): R {
  // Handle primitives (string, number, symbol) FIRST
  if (
    typeof matcher === "string" ||
    typeof matcher === "number" ||
    typeof matcher === "symbol"
  ) {
    const handler = cases[matcher];

    if (handler) {
      return handler();
    }

    if (cases.default) {
      return cases.default();
    }

    throw new Error(`No case found for value: ${String(matcher)}`);
  }

  // NEW: Handle objects with specific property keys (like { Other: [...] })
  // This must come BEFORE discriminated union check to handle mixed unions
  if (typeof matcher === "object" && matcher !== null && !discriminant) {
    // Check if any case key matches a property in the matcher object
    for (const key in cases) {
      if (key === "default") continue;

      if (key in matcher) {
        const handler = cases[key];
        if (handler) {
          return typeof handler === "function"
            ? handler(matcher[key])
            : handler();
        }
      }
    }

    // If no match found and there's a default, use it
    if (cases.default) {
      return cases.default();
    }
  }

  // Handle discriminated unions
  if (discriminant && typeof matcher === "object" && matcher !== null) {
    const discriminantValue = matcher[discriminant];
    const handler = cases[discriminantValue];

    if (handler) {
      return handler(matcher);
    }

    if (cases.default) {
      return cases.default(matcher);
    }

    throw new Error(
      `No case found for discriminant value: ${String(discriminantValue)}`,
    );
  }

  // Early return for Result.Ok
  if (
    typeof matcher === "object" &&
    matcher !== null &&
    "isOk" in matcher &&
    matcher.isOk()
  ) {
    if (!cases.Ok) throw new Error("Missing case for Ok");
    return cases.Ok(matcher.unwrap());
  }

  // Early return for Result.Err
  if (
    typeof matcher === "object" &&
    matcher !== null &&
    "isErr" in matcher &&
    matcher.isErr()
  ) {
    if (!cases.Err) throw new Error("Missing case for Err");
    return cases.Err(matcher.unwrapErr() as E);
  }

  // Early return for Option.Some
  if (
    typeof matcher === "object" &&
    matcher !== null &&
    "isSome" in matcher &&
    matcher.isSome()
  ) {
    if (!cases.Some) throw new Error("Missing case for Some");
    return cases.Some(matcher.unwrap());
  }

  // Early return for Option.None
  if (
    typeof matcher === "object" &&
    matcher !== null &&
    "isNone" in matcher &&
    matcher.isNone()
  ) {
    if (!cases.None) throw new Error("Missing case for None");
    return cases.None();
  }

  throw new Error("Invalid matcher or missing case");
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
(global as any).match = match;
