import { Ok } from "./ok";
import { Err } from "./err";

type OkType<T> = [T] extends [never] ? never : T;
type ErrType<E> = [E] extends [never] ? never : E;

/**
 * Represents the result of an operation that can either succeed (`Ok`) or fail (`Err`).
 */
// type Result<T, E extends Error | string = Error> = OkType<T> | ErrType<E>;
export type Result<T, E extends Error> = Ok<OkType<T>> | Err<ErrType<E>>;

/**
 * Represents the result methods that must be implemented for success (`Ok`) or failure (`Err`).
 */
export interface ResultDefinition<T = never, E = never> {
	isOk(): this is Ok<T>;
	isErr(): this is Err<E extends Error ? E : Error>;
	unwrap(): T;
	unwrapErr(): E;
	map<U>(fn: (value: T) => U): ResultDefinition<U, E>;
	flatMap<U>(fn: (value: T) => ResultDefinition<U, E>): ResultDefinition<U, E>;
	mapErr<U extends Error>(fn: (err: E) => U): ResultDefinition<T, U>;
}
