/** biome-ignore-all lint/complexity/noBannedTypes: It's Ok */
import "./src/types/globals";

export type { Option } from "./src/option";
export type { Result } from "./src/result";

import { match } from "./src/helpers/match";
import { Err, Ok } from "./src/result";

function guardFn<T extends Function>(fn: T, name: string) {
  if (typeof fn !== "function") {
    throw new Error(`[results] "${name}" is not initialized properly`);
  }
  return fn;
}

const _Ok = guardFn(Ok, "Ok");
const _Err = guardFn(Err, "Err");
const _Some = guardFn(Some, "Some");
const _None = guardFn(None, "None");
const _match = guardFn(match, "match");

globalThis.Ok = _Ok;
globalThis.Err = _Err;
globalThis.match = _match;

export {
  _Ok as Ok,
  _Err as Err,
  _Some as Some,
  _None as None,
  _match as match,
};

globalThis.Ok = Ok;
globalThis.Err = Err;
globalThis.Some = Some;
globalThis.None = None;
globalThis.match = match;
