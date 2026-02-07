import type { ResultDefinition } from "./result";
import type { Err } from "./err";

/**
 * Represents a successful result (`Ok`) that contains a value.
 * @template T The type of the value contained in this `Ok`.
 */
export class Ok<T> implements ResultDefinition<T, never> {
  /**
   * Creates a new `Ok` instance with the given value.
   * @param _value The value to wrap in the `Ok` instance.
   */
  constructor(private _value: T) {}
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
    return this._value;
  }

  /**
   * Returns the inner value. After an `isOk()` type guard, TypeScript narrows the return type to `T`.
   * Without a type guard, returns `T | E` (use `isOk()` or `isErr()` for type narrowing).
   * @returns The value contained in this `Ok`.
   */
  value(): T {
    return this._value;
  }

  /**
   * Applies a transformation function to the value contained in this `Ok` and returns a new `Result` with the transformed value.
   * @template U The type of the transformed value.
   * @param fn The transformation function to apply to the value.
   * @returns A new `Ok` containing the transformed value.
   */
  map<U>(fn: (value: T) => U): ResultDefinition<U, never> {
    return new Ok(fn(this._value)) as unknown as ResultDefinition<U, never>;
  }

  /**
   * Applies a transformation function that returns a `Result` to the value contained in this `Ok`.
   * @template U The type of the value in the resulting `Result`.
   * @template E The type of the error in the resulting `Result`.
   * @param fn The transformation function to apply to the value.
   * @returns The result of applying the transformation function.
   */
  flatMap<U, E = never>(
    fn: (value: T) => ResultDefinition<U, E>,
  ): ResultDefinition<U, E> {
    return fn(this._value);
  }

  /**
   * Maps the error value (if any). Since this is an `Ok`, the error mapping function is ignored, and the original `Ok` is returned.
   * @template U The type of the error (ignored for `Ok`). Can be any type.
   * @param _fn The mapping function for errors (not used).
   * @returns The original `Ok` instance.
   */
  mapErr<U>(_fn: (err: never) => U): ResultDefinition<T, U> {
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
   * Returns the contained value if `Ok`, otherwise returns the provided default value.
   * @template U The type of the default value.
   * @param defaultValue The value to return if this is an `Err`.
   * @returns The value contained in this `Ok`.
   */
  unwrapOr<U>(defaultValue: U): T {
    return this._value;
  }

  /**
   * Returns the contained value if `Ok`, otherwise computes and returns the result of the provided function.
   * @template U The type of the default value.
   * @param fn The function to compute the default value.
   * @returns The value contained in this `Ok`.
   */
  unwrapOrElse<U>(fn: (error: never) => U): T {
    return this._value;
  }

  /**
   * Returns this `Ok` if it is `Ok`, otherwise returns the result of the provided function.
   * @template F The type of the alternative error.
   * @param fn The function to compute the alternative result.
   * @returns The original `Ok` instance.
   */
  orElse<F>(fn: (error: never) => ResultDefinition<T, F>): ResultDefinition<T, F> {
    return this as unknown as ResultDefinition<T, F>;
  }

  /**
   * Converts `Result` type to `Option` type.
   * @returns `Some` if the result is `Ok`, `None` if the result is `Err`.
   */
  ok() {
    return Some(this._value);
  }
}
