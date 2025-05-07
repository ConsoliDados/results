import type { ResultDefinition } from "./result";
import type { Err } from "./err";

/**
 * Represents a successful result (`Ok`) that contains a value.
 * @template T The type of the value contained in this `Ok`.
 */
export class Ok<T> implements ResultDefinition<T, never> {
  /**
   * Creates a new `Ok` instance with the given value.
   * @param value The value to wrap in the `Ok` instance.
   */
  constructor(private value: T) {}
  /**
   * Checks if this result is an `Ok`.
   * @returns `true` because this is an `Ok`.
   */
  isOk(): this is Ok<T> {
    return true;
  }

  /**
   * Checks if this result is an `Err`.
   * @returns `false` because this is an `Ok`.
   */
  isErr(): this is Err<never> {
    return false;
  }

  /**
   * Retrieves the value contained in this `Ok`.
   * @returns The value contained in this `Ok`.
   */
  unwrap(): T {
    return this.value;
  }

  /**
   * Applies a transformation function to the value contained in this `Ok` and returns a new `Result` with the transformed value.
   * @template U The type of the transformed value.
   * @param fn The transformation function to apply to the value.
   * @returns A new `Ok` containing the transformed value.
   */
  map<U>(fn: (value: T) => U): ResultDefinition<U, never> {
    return new Ok(fn(this.value)) as ResultDefinition<U, never>;
  }

  /**
   * Applies a transformation function that returns a `Result` to the value contained in this `Ok`.
   * @template U The type of the value in the resulting `Result`.
   * @param fn The transformation function to apply to the value.
   * @returns The result of applying the transformation function.
   */
  flatMap<U>(
    fn: (value: T) => ResultDefinition<U, never>,
  ): ResultDefinition<U, never> {
    return fn(this.value);
  }

  /**
   * Maps the error value (if any). Since this is an `Ok`, the error mapping function is ignored, and the original `Ok` is returned.
   * @template U The type of the error (ignored for `Ok`).
   * @param _fn The mapping function for errors (not used).
   * @returns The original `Ok` instance.
   */
  // mapErr<U extends Error | string>(fn: (err: U) => U): Result<T, never> {
  // 	return this;
  mapErr<U extends Error>(_fn: (err: never) => U): ResultDefinition<T, U> {
    return this as unknown as ResultDefinition<T, U>;
  }

  /**
   * Retrieves the error contained in this result. Since this is an `Ok`, an error is thrown.
   * @throws An error because `unwrapErr` is called on an `Ok`.
   */
  unwrapErr(): never {
    throw new Error("Called unwrapErr on an Ok value");
  }

  /**
   * Converts `Result` type to `Option` type.
   * @returns `Some` if the result is `Ok`, `None` if the result is `Err`.
   */
  ok() {
    return match(this, {
      Ok: (v) => Some(v),
      Err: (_) => None(),
    });
  }
}
