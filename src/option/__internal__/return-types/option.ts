import { None } from "./none";
import { Some } from "./some";

/**
 * Represents an optional value that can either be `Some` (with a value) or `None` (no value).
 */
export type Option<T> = Some<T> | None;
