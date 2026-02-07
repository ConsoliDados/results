import type { Ok } from "./ok";
import type { ResultDefinition } from "./result";

/**
 * Represents a failed result (`Err`) that contains an error value.
 * @template E The type of the error contained in this `Err`. Can be any type (Error, string, enum, etc).
 */
export class Err<E> implements ResultDefinition<never, E> {
  private error: E;
  /**
   * Creates a new `Err` instance with the given error value.
   * @param error The error to wrap in the `Err` instance. Can be any type.
   */
  constructor(error: E) {
    // Store error as-is - conversion is handled by factory function
    this.error = error;
    // Object.setPrototypeOf(this, Err.prototype);
    //
    // if (Error.captureStackTrace) {
    //   Error.captureStackTrace(this, Err);
    // }
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
  isErr(): this is Err<E> {
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
   * @template U The type of the transformed error. Can be any type.
   * @param fn The transformation function to apply to the error value.
   * @returns A new `Err` containing the transformed error.
   */
  mapErr<U>(fn: (err: E) => U): ResultDefinition<never, U> {
    return new Err<U>(fn(this.error)) as unknown as ResultDefinition<never, U>;
  }

  /**
   * Applies a transformation function that returns a `Result` to the value (which does not exist) of this `Err`.
   * @template U The type of the value in the resulting `Result`.
   * @template F The type of the error in the resulting `Result`.
   * @param _fn The transformation function (ignored in this implementation).
   * @returns The original `Err` instance cast to the new error type.
   */
  flatMap<U, F = E>(
    _fn: (value: never) => ResultDefinition<U, F>,
  ): ResultDefinition<U, E> {
    return this as unknown as ResultDefinition<U, E>;
  }

  /**
   * Retrieves the error value contained in this `Err`.
   * @returns The error value contained in this `Err`.
   */
  unwrapErr(): E {
    return this.error;
  }

  /**
   * Returns the inner error. After an `isErr()` type guard, TypeScript narrows the return type to `E`.
   * Without a type guard, returns `T | E` (use `isOk()` or `isErr()` for type narrowing).
   * @returns The error value contained in this `Err`.
   */
  value(): E {
    return this.error;
  }

  /**
   * Returns the contained value if `Ok`, otherwise returns the provided default value.
   * @template U The type of the default value.
   * @param defaultValue The value to return since this is an `Err`.
   * @returns The provided default value.
   */
  unwrapOr<U>(defaultValue: U): U {
    return defaultValue;
  }

  /**
   * Returns the contained value if `Ok`, otherwise computes and returns the result of the provided function.
   * @template U The type of the default value.
   * @param fn The function to compute the default value.
   * @returns The result of calling the provided function with the error.
   */
  unwrapOrElse<U>(fn: (error: E) => U): U {
    return fn(this.error);
  }

  /**
   * Returns this `Err` if it is `Err`, otherwise returns the result of the provided function.
   * @template T The type of the alternative success value.
   * @template F The type of the alternative error.
   * @param fn The function to compute the alternative result.
   * @returns The result of calling the provided function with the error.
   */
  orElse<T, F>(
    fn: (error: E) => ResultDefinition<T, F>,
  ): ResultDefinition<T, F> {
    return fn(this.error);
  }

  /**
   * Converts `Result` type to `Option` type.
   * @returns `Some` if the result is `Ok`, `None` if the result is `Err`.
   */
  ok() {
    return None();
  }
}
