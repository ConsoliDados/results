import "../src";
import { Ok as OkFn, Err as ErrFn } from "../src/result/result";
import { Some as SomeFn, None as NoneFn } from "../src/option/option";
import { match as matchFn } from "../src/helpers/match";

// Ensure globals are properly registered
(globalThis as any).Ok = OkFn;
(globalThis as any).Err = ErrFn;
(globalThis as any).Some = SomeFn;
(globalThis as any).None = NoneFn;
(globalThis as any).match = matchFn;
