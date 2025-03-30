import type { None } from "./none";
import type { Some } from "./some";

/**
 * Represents an optional value that can either be `Some` (with a value) or `None` (no value).
 */
export type Option<T> = Some<T> | None;
