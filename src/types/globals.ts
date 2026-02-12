import type { Option } from "../option";
import type {
  None as NoneType,
  Some as SomeType,
} from "../option/__internal__/return-types";
import type { Result } from "../result";
import type {
  Err as ErrType,
  Ok as OkType,
} from "../result/__internal__/return-types";

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

declare global {
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

  /**
   * Creates a new `Ok` instance, representing a successful result.
   * @template T The type of the value contained in the `Ok`.
   * @param value The value to wrap in the `Ok` instance.
   * @returns An `Ok` instance containing the given value.
   * @example
   * const result = Ok(42);
   * console.log(result.isOk()); // true
   * console.log(result.unwrap()); // 42
   */
  function Ok<T>(value: T): OkType<T>;

  /**
   * Creates a new `Err` instance, representing a failed result.
   * @template E The type of the error contained in the `Err`.
   * @param error The error to wrap in the `Err` instance.
   * @returns An `Err` instance containing the given error.
   * @example
   * const result = Err("Something went wrong");
   * console.log(result.isErr()); // true
   * console.log(result.unwrapErr()); // "Something went wrong"
   */
  function Err<E>(error: E): ErrType<E>;

  /**
   * creates a new `Some` instance, representing some value.
   * @template T the type of the value contained in the `Some`.
   * @param value the value to wrap in the `some` instance.
   * @returns an `Some` instance containing the given value.
   * @example
   * const option = Some("some value");
   * console.log(option.isSome()); // true
   * console.log(option.unwrap()); // "some value"
   */
  function Some<T>(value: T): SomeType<T>;
  /**
   * creates a new `None` instance, representing no value.
   * @param  `` There are no paramaters in the `None` instance.
   * @returns an `None` instance containing no value.
   * @example
   * const option = None();
   * console.log(option.isNone()); // true
   * console.log(option.unwrap()); // throws
   */
  function None(): NoneType;
}

// export { Some, None, Ok, Err, match, type Result, type Option };
// biome-ignore lint/complexity/noUselessEmptyExport: <explanation>
export {};
