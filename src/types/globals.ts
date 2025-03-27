import { Option } from "../option";
import { Result } from "../result";
import {
	Ok as OkType,
	Err as ErrType,
} from "../result/__internal__/return-types";
import {
	Some as SomeType,
	None as NoneType,
} from "../option/__internal__/return-types";

declare global {
	function match<T, E extends Error, R>(
		matcher: Result<T, E>,
		cases: {
			Ok: (value: T) => R;
			Err: (error: E) => R;
		},
	): R;

	// Overload para Option<T>
	function match<T, R>(
		matcher: Option<T>,
		cases: {
			Some: (value: T) => R;
			None: () => R;
		},
	): R;

	function match<T, E extends Error>(
		matcher: Result<T, E>,
		cases: {
			Ok: (value: T) => Option<T>;
			Err: (error: E) => Option<T>;
		},
	): Option<T>;

	function match<T, E extends Error = Error>(
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
	function Err<E extends Error>(error: E | string): ErrType<E>;

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

export {};
