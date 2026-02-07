import {
  Err as ErrType,
  Ok as OkType,
  type Result,
} from "./__internal__/return-types";

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
function Ok<T>(value: T): OkType<T> {
  return new OkType(value);
}

/**
 * Creates an Err - strings are converted to Error, everything else preserved
 */
function Err<E>(error: E): ErrType<E> {
  return new ErrType(error);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
(global as any).Ok = Ok;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
(global as any).Err = Err;

export { Err, Ok, Result, ErrType, OkType };
