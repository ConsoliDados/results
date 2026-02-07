import type { Some } from "./some";
import type { Option } from "./option";
import { None as NoneFactory } from "../../option";
import { Err } from "@/result";

/**
 * Represents a `None` option, which holds no value.
 */
export class None {
  /**
   * Checks if this option is a `Some`.
   * @returns `false` because this is a `None`.
   */
  isSome(): this is Some<never> {
    return false;
  }

  /**
   * Checks if this option is a `None`.
   * @returns `true` because this is a `None`.
   */
  isNone(): this is None {
    return true;
  }

  /**
   * Attempts to unwrap the value from this `None` option.
   * @throws An error because `None` has no value.
   */
  unwrap(): never {
    throw new Error("Called unwrap on a None value");
  }

  /**
   * Returns `undefined` for a `None` option. After an `isNone()` type guard, TypeScript narrows the return type to `undefined`.
   * Without a type guard, returns `T | undefined` (use `isSome()` or `isNone()` for type narrowing).
   * Unlike `unwrap()`, this method does not throw an error.
   * @returns `undefined` because this is a `None`.
   */
  value(): undefined {
    return undefined;
  }

  /**
   * Applies a transformation function to the value (which does not exist) of this `None` option.
   * @template U The type of the value that would have been returned.
   * @param _fn The transformation function (ignored in this implementation).
   * @returns The singleton `None` instance.
   */
  map<U>(_fn: (value: never) => U): Option<U> {
    return NoneFactory();
  }

  /**
   * Applies a transformation function that returns an `Option` to the value (which does not exist) of this `None` option.
   * @template U The type of the value in the resulting `Option`.
   * @param _fn The transformation function (ignored in this implementation).
   * @returns The singleton `None` instance.
   */
  flatMap<U>(_fn: (value: never) => Option<U>): Option<U> {
    return NoneFactory();
  }

  /**
   * Returns the default value provided, since `None` has no value.
   * @template T The type of the default value.
   * @param defaultValue The value to return.
   * @returns The default value provided.
   */
  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }

  /**
   * Computes and returns the default value using the provided function, since `None` has no value.
   * @template T The type of the default value.
   * @param fn The function to compute the default value.
   * @returns The result of calling the provided function.
   */
  unwrapOrElse<T>(fn: () => T): T {
    return fn();
  }

  /**
   * Converts this `Option` to a `Result`, using the provided error value since this is `None`.
   * @template E The type of the error.
   * @param error The error value to use.
   * @returns An `Err` result containing the provided error.
   */
  okOr<E>(error: E) {
    return Err(error);
  }

  /**
   * Filters this `Option` based on a predicate function.
   * @param _predicate The function to test the value (ignored since this is `None`).
   * @returns `None` since there is no value to filter.
   */
  filter<T>(_predicate: (value: never) => boolean): Option<T> {
    return NoneFactory();
  }
}
