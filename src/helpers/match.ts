import type { Option } from "../option";
import type { Result } from "../result";

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
