import { None } from "./none";
import { Option } from "./option";

/**
 * Represents a `Some` option, which holds a value.
 * @template T The type of the value held by this `Some` instance.
 */
export class Some<T> {
	/**
	 * Creates a new `Some` option with the given value.
	 * @param value The value to be wrapped in the `Some` option.
	 */
	constructor(private value: T) {}

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
	isNone(): this is None {
		return false;
	}

	/**
	 * Unwraps the value held by this `Some` option.
	 * @returns The value held by this `Some` option.
	 */
	unwrap(): T {
		return this.value;
	}

	/**
	 * Applies a transformation function to the value held by this `Some` option and returns a new `Option` with the transformed value.
	 * @template U The type of the transformed value.
	 * @param fn The transformation function to apply to the value.
	 * @returns A new `Some` option containing the transformed value.
	 */
	map<U>(fn: (value: T) => U): Option<U> {
		return new Some(fn(this.value));
	}

	/**
	 * Applies a transformation function that returns an `Option` to the value held by this `Some` option.
	 * @template U The type of the value in the resulting `Option`.
	 * @param fn The transformation function to apply to the value.
	 * @returns The result of applying the transformation function.
	 */
	flatMap<U>(fn: (value: T) => Option<U>): Option<U> {
		return fn(this.value);
	}

	/**
	 * Returns the value held by this `Some` option, ignoring the default value provided.
	 * @param _ A default value (ignored in this implementation).
	 * @returns The value held by this `Some` option.
	 */
	unwrapOr(_: T): T {
		return this.value;
	}
}
