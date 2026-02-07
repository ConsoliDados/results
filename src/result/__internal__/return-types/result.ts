import type { Ok } from "./ok";
import type { Err } from "./err";
import type { Option } from "@/option";

type OkType<T> = [T] extends [never] ? never : T;
type ErrType<E> = [E] extends [never] ? never : E;

/**
 * Helper type that converts string errors to Error type,
 * but preserves all other types as-is.
 */
// type InferredErrorType<E> = E extends string ? Error : E;

/**
 * Represents the result of an operation that can either succeed (`Ok`) or fail (`Err`).
 */
// export type Result<T, E> = Ok<OkType<T>> | Err<InferredErrorType<ErrType<E>>>;
export type Result<T, E> = Ok<OkType<T>> | Err<ErrType<E>>;

/**
 * Represents the result methods that must be implemented for success (`Ok`) or failure (`Err`).
 */
export interface ResultDefinition<T = never, E = never> {
  isOk(): this is Ok<T>;
  isErr(): this is Err<E>;
  unwrap(): T;
  unwrapErr(): E;
  value(): T | E;
  map<U>(fn: (value: T) => U): ResultDefinition<U, E>;
  flatMap<U>(fn: (value: T) => ResultDefinition<U, E>): ResultDefinition<U, E>;
  mapErr<U>(fn: (err: E) => U): ResultDefinition<T, U>;
  unwrapOr<U>(defaultValue: U): T | U;
  unwrapOrElse<U>(fn: (error: E) => U): T | U;
  orElse<F>(
    fn: (error: E) => ResultDefinition<T, F>,
  ): ResultDefinition<T, E | F>;
  ok(): Option<T>;
}
