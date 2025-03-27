import { Result } from "../result";
import { Option } from "../option";

export function match<T, E extends Error, R>(
	matcher: Result<T, E>,
	cases: {
		Ok: (value: T) => R;
		Err: (error: E) => R;
	},
): R;
export function match<T, R>(
	matcher: Option<T>,
	cases: {
		Some: (value: T) => R;
		None: () => R;
	},
): R;
export function match<T, E extends Error, R>(
	matcher: Result<T, E> | Option<T>,
	cases: {
		Ok?: (value: T) => R;
		Err?: (error: E) => R;
		Some?: (value: T) => R;
		None?: () => R;
	},
): R {
	if ("isOk" in matcher && matcher.isOk()) {
		if (!cases.Ok) throw new Error("Missing case for Ok");
		return cases.Ok(matcher.unwrap());
	}

	if ("isErr" in matcher && matcher.isErr()) {
		if (!cases.Err) throw new Error("Missing case for Err");
		return cases.Err(matcher.unwrapErr() as E);
	}

	if ("isSome" in matcher && matcher.isSome()) {
		if (!cases.Some) throw new Error("Missing case for Some");
		return cases.Some(matcher.unwrap());
	}

	if ("isNone" in matcher && matcher.isNone()) {
		if (!cases.None) throw new Error("Missing case for None");
		return cases.None();
	}

	throw new Error("Invalid matcher or missing case");
}

(global as any).match = match;
