import type { None as NoneType } from "./none";
import type { Option } from "./option";
import { None } from "../../option";
import { Ok } from "@/result";

/**
 * Represents a `Some` option, which holds a value.
 * @template T The type of the value held by this `Some` instance.
 */
export class Some<T> {
  /**
   * Creates a new `Some` option with the given value.
   * @param _value The value to be wrapped in the `Some` option.
   */
  constructor(private _value: T) { }

  /**
   * Checks if this option is a `Some`.
   * @returns `true` if this option is a `Some`, otherwise `false`.
   */
  isSome(): this is Some<T> {
    return true;
  }

  /**
   * Checks if this option is a `None`.
   * @returns `false` because this is a `Some`.
   */
  isNone(): this is NoneType {
    return false;
  }

  /**
   * Unwraps the value held by this `Some` option.
   * @returns The value held by this `Some` option.
   */
  unwrap(): T {
    return this._value;
  }

  /**
   * Returns the inner value. After an `isSome()` type guard, TypeScript narrows the return type to `T`.
   * Without a type guard, returns `T | undefined` (use `isSome()` or `isNone()` for type narrowing).
   * @returns The value held by this `Some` option.
   */
  value(): T {
    return this._value;
  }

  /**
   * Applies a transformation function to the value held by this `Some` option and returns a new `Option` with the transformed value.
   * @template U The type of the transformed value.
   * @param fn The transformation function to apply to the value.
   * @returns A new `Some` option containing the transformed value.
   */
  map<U>(fn: (value: T) => U): Option<U> {
    return new Some(fn(this._value));
  }

  /**
   * Applies a transformation function that returns an `Option` to the value held by this `Some` option.
   * @template U The type of the value in the resulting `Option`.
   * @param fn The transformation function to apply to the value.
   * @returns The result of applying the transformation function.
   */
  flatMap<U>(fn: (value: T) => Option<U>): Option<U> {
    return fn(this._value);
  }

  /**
   * Returns the value held by this `Some` option, ignoring the default value provided.
   * @param _ A default value (ignored in this implementation).
   * @returns The value held by this `Some` option.
   */
  unwrapOr(_: T): T {
    return this._value;
  }

  /**
   * Returns the value held by this `Some` option, ignoring the function provided.
   * @template U The type of the default value.
   * @param _fn A function to compute the default value (ignored in this implementation).
   * @returns The value held by this `Some` option.
   */
  unwrapOrElse<U>(_fn: () => U): T {
    return this._value;
  }

  /**
   * Converts this `Option` to a `Result`, using the provided error value if this is `None`.
   * @template E The type of the error.
   * @param _error The error value to use if this is `None` (ignored since this is `Some`).
   * @returns An `Ok` result containing the value from this `Some`.
   */
  okOr<E>(_error: E) {
    return Ok(this._value);
  }

  /**
   * Filters this `Option` based on a predicate function.
   * @param predicate The function to test the value.
   * @returns This `Some` if the predicate returns true, otherwise `None`.
   */
  filter(predicate: (value: T) => boolean): Option<T> {
    return predicate(this._value) ? this : None();
  }
}
