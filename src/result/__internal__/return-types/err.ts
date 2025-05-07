import type { ResultDefinition } from "./result";
import type { Ok } from "./ok";

/**
 * Represents a failed result (`Err`) that contains an error value.
 * @template E The type of the error contained in this `Err`.
 */
export class Err<E extends Error>
  extends Error
  implements ResultDefinition<never, E>
{
  private error: E;
  /**
   * Creates a new `Err` instance with the given error value.
   * @param error The error to wrap in the `Err` instance.
   */
  constructor(error: E | string) {
    super(typeof error === "string" ? error : error.message);
    this.error =
      typeof error === "string" ? (new Error(error) as E) : (error as E);
    Object.setPrototypeOf(this, Err.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Err);
    }
  }

  /**
   * Checks if this result is an `Ok`.
   * @returns `false` because this is an `Err`.
   */
  isOk(): this is Ok<never> {
    return false;
  }

  /**
   * Checks if this result is an `Err`.
   * @returns `true` because this is an `Err`.
   */
  isErr(): this is Err<E extends Error ? E : Error> {
    return true;
  }

  /**
   * Retrieves the value contained in this result. Since this is an `Err`, an error is thrown.
   * @throws An error because `unwrap` is called on an `Err`.
   */
  unwrap(): never {
    throw new Error("Called unwrap on an Err value");
  }

  /**
   * Maps the value (if any). Since this is an `Err`, the mapping function is ignored, and the original `Err` is returned.
   * @template U The type of the value (ignored for `Err`).
   * @param _fn The mapping function for values (not used).
   * @returns The original `Err` instance.
   */
  map<U>(_fn: (value: never) => U): ResultDefinition<never, E> {
    return this as unknown as ResultDefinition<never, E>;
  }

  /**
   * Maps the error value using a transformation function and returns a new `Result` with the transformed error.
   * @template U The type of the transformed error.
   * @param fn The transformation function to apply to the error value.
   * @returns A new `Err` containing the transformed error.
   */
  mapErr<U extends Error>(fn: (err: E) => U): ResultDefinition<never, U> {
    return new Err<U>(fn(this.error)) as unknown as ResultDefinition<never, U>;
  }

  /**
   * Applies a transformation function that returns a `Result` to the value (which does not exist) of this `Err`.
   * @template U The type of the value in the resulting `Result`.
   * @param _fn The transformation function (ignored in this implementation).
   * @returns The original `Err` instance.
   */
  flatMap<U>(
    _fn: (value: never) => ResultDefinition<U, never>,
  ): ResultDefinition<never, E> {
    return this as unknown as ResultDefinition<never, E>;
  }

  /**
   * Retrieves the error value contained in this `Err`.
   * @returns The error value contained in this `Err`.
   */
  unwrapErr(): E {
    return this.error;
  }

  /**
   * Converts `Result` type to `Option` type.
   * @returns `Some` if the result is `Ok`, `None` if the result is `Err`.
   */
  ok() {
    return None();
  }
}
