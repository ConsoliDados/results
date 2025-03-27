import { Some } from "./some";
import { Option } from "./option";

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
	 * Applies a transformation function to the value (which does not exist) of this `None` option.
	 * @template U The type of the value that would have been returned.
	 * @param _fn The transformation function (ignored in this implementation).
	 * @returns A new `None` option.
	 */
	map<U>(_fn: (value: never) => U): Option<U> {
		return new None();
	}

	/**
	 * Applies a transformation function that returns an `Option` to the value (which does not exist) of this `None` option.
	 * @template U The type of the value in the resulting `Option`.
	 * @param _fn The transformation function (ignored in this implementation).
	 * @returns A new `None` option.
	 */
	flatMap<U>(_fn: (value: never) => Option<U>): Option<U> {
		return new None();
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
}
