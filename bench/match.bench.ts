/**
 * Bench harness for the `match` dispatch.
 *
 * Hypotheses (see /home/johnny/.claude/plans/cara-tem-algo-que-staged-moler.md):
 *   H0 — baseline (inline copy of current src/helpers/match.ts impl)
 *   H1 — reorder: detect Result/Option BEFORE the mixed-union loop
 *   H2 — flip the mixed-union loop (iterate matcher own keys, not cases keys)
 *   H3 — H1 + H2
 *   H4 — Symbol tag on variant instances: O(1) tag-based dispatch
 *
 * Also benches the *real* exported `match` for sanity (H0 inline must be ≈ real).
 *
 * Run with:  pnpm bench   (or: npx vitest bench --run)
 */

import { bench, describe } from "vitest";
import { Ok, Err } from "@/result";
import { Some, None } from "@/option";
import { match } from "@/helpers/match";

// ---------------------------------------------------------------------------
// sink prevents DCE from eliding the dispatch result
// ---------------------------------------------------------------------------
let sink: unknown;

// ---------------------------------------------------------------------------
// H0 — exact paste of current implementation (src/helpers/match.ts:97-207)
// ---------------------------------------------------------------------------
// biome-ignore lint/suspicious/noExplicitAny: bench code mirrors the production any signatures
function matchH0(matcher: any, cases: any, discriminant?: PropertyKey): any {
  if (
    typeof matcher === "string" ||
    typeof matcher === "number" ||
    typeof matcher === "symbol"
  ) {
    const handler = cases[matcher];
    if (handler) return handler();
    if (cases.default) return cases.default();
    throw new Error(`No case found for value: ${String(matcher)}`);
  }

  if (typeof matcher === "object" && matcher !== null && !discriminant) {
    for (const key in cases) {
      if (key === "default") continue;
      if (key in matcher) {
        const handler = cases[key];
        if (handler) {
          return typeof handler === "function"
            ? handler(matcher[key])
            : handler();
        }
      }
    }
    if (cases.default) return cases.default();
  }

  if (discriminant && typeof matcher === "object" && matcher !== null) {
    const dv = matcher[discriminant];
    const handler = cases[dv];
    if (handler) return handler(matcher);
    if (cases.default) return cases.default(matcher);
    throw new Error(`No case found for discriminant value: ${String(dv)}`);
  }

  if (
    typeof matcher === "object" &&
    matcher !== null &&
    "isOk" in matcher &&
    matcher.isOk()
  ) {
    if (!cases.Ok) throw new Error("Missing case for Ok");
    return cases.Ok(matcher.unwrap());
  }
  if (
    typeof matcher === "object" &&
    matcher !== null &&
    "isErr" in matcher &&
    matcher.isErr()
  ) {
    if (!cases.Err) throw new Error("Missing case for Err");
    return cases.Err(matcher.unwrapErr());
  }
  if (
    typeof matcher === "object" &&
    matcher !== null &&
    "isSome" in matcher &&
    matcher.isSome()
  ) {
    if (!cases.Some) throw new Error("Missing case for Some");
    return cases.Some(matcher.unwrap());
  }
  if (
    typeof matcher === "object" &&
    matcher !== null &&
    "isNone" in matcher &&
    matcher.isNone()
  ) {
    if (!cases.None) throw new Error("Missing case for None");
    return cases.None();
  }

  throw new Error("Invalid matcher or missing case");
}

// ---------------------------------------------------------------------------
// H1 — reorder: Result/Option fast path BEFORE the mixed-union loop
// ---------------------------------------------------------------------------
// biome-ignore lint/suspicious/noExplicitAny: see H0
function matchH1(matcher: any, cases: any, discriminant?: PropertyKey): any {
  const t = typeof matcher;
  if (t === "string" || t === "number" || t === "symbol") {
    const h = cases[matcher];
    if (h) return h();
    if (cases.default) return cases.default();
    throw new Error(`No case found for value: ${String(matcher)}`);
  }
  if (matcher !== null && t === "object") {
    // Result/Option detection FIRST — skips wasted for...in for the hot path
    if ("isOk" in matcher) {
      if (matcher.isOk()) {
        if (!cases.Ok) throw new Error("Missing case for Ok");
        return cases.Ok(matcher.unwrap());
      }
      if (!cases.Err) throw new Error("Missing case for Err");
      return cases.Err(matcher.unwrapErr());
    }
    if ("isSome" in matcher) {
      if (matcher.isSome()) {
        if (!cases.Some) throw new Error("Missing case for Some");
        return cases.Some(matcher.unwrap());
      }
      if (!cases.None) throw new Error("Missing case for None");
      return cases.None();
    }
    if (discriminant) {
      const dv = matcher[discriminant];
      const h = cases[dv];
      if (h) return h(matcher);
      if (cases.default) return cases.default(matcher);
      throw new Error(`No case found for discriminant value: ${String(dv)}`);
    }
    // mixed-union (original loop, unchanged)
    for (const key in cases) {
      if (key === "default") continue;
      if (key in matcher) {
        const h = cases[key];
        if (h) {
          return typeof h === "function" ? h(matcher[key]) : h();
        }
      }
    }
    if (cases.default) return cases.default();
  }
  throw new Error("Invalid matcher or missing case");
}

// ---------------------------------------------------------------------------
// H2 — flip the mixed-union loop: iterate matcher own keys instead of cases
// (Result/Option detection order unchanged from baseline — falls through loop)
// ---------------------------------------------------------------------------
// biome-ignore lint/suspicious/noExplicitAny: see H0
function matchH2(matcher: any, cases: any, discriminant?: PropertyKey): any {
  const t = typeof matcher;
  if (t === "string" || t === "number" || t === "symbol") {
    const h = cases[matcher];
    if (h) return h();
    if (cases.default) return cases.default();
    throw new Error(`No case found for value: ${String(matcher)}`);
  }
  if (matcher !== null && t === "object" && !discriminant) {
    // Flipped loop: iterate matcher's own enumerable keys (usually 1 for tagged variants)
    for (const k in matcher) {
      if (k === "default") continue;
      if (k in cases) {
        const h = cases[k];
        if (h) {
          return typeof h === "function" ? h(matcher[k]) : h();
        }
      }
    }
    if (cases.default) return cases.default();
  }
  if (discriminant && matcher !== null && t === "object") {
    const dv = matcher[discriminant];
    const h = cases[dv];
    if (h) return h(matcher);
    if (cases.default) return cases.default(matcher);
    throw new Error(`No case found for discriminant value: ${String(dv)}`);
  }
  // Result/Option fall-through (same order as H0)
  if (matcher !== null && t === "object") {
    if ("isOk" in matcher && matcher.isOk()) {
      if (!cases.Ok) throw new Error("Missing case for Ok");
      return cases.Ok(matcher.unwrap());
    }
    if ("isErr" in matcher && matcher.isErr()) {
      if (!cases.Err) throw new Error("Missing case for Err");
      return cases.Err(matcher.unwrapErr());
    }
    if ("isSome" in matcher && matcher.isSome()) {
      if (!cases.Some) throw new Error("Missing case for Some");
      return cases.Some(matcher.unwrap());
    }
    if ("isNone" in matcher && matcher.isNone()) {
      if (!cases.None) throw new Error("Missing case for None");
      return cases.None();
    }
  }
  throw new Error("Invalid matcher or missing case");
}

// ---------------------------------------------------------------------------
// H3 — H1 + H2: reorder Result/Option first AND flip the mixed-union loop
// ---------------------------------------------------------------------------
// biome-ignore lint/suspicious/noExplicitAny: see H0
function matchH3(matcher: any, cases: any, discriminant?: PropertyKey): any {
  const t = typeof matcher;
  if (t === "string" || t === "number" || t === "symbol") {
    const h = cases[matcher];
    if (h) return h();
    if (cases.default) return cases.default();
    throw new Error(`No case found for value: ${String(matcher)}`);
  }
  if (matcher !== null && t === "object") {
    if ("isOk" in matcher) {
      if (matcher.isOk()) {
        if (!cases.Ok) throw new Error("Missing case for Ok");
        return cases.Ok(matcher.unwrap());
      }
      if (!cases.Err) throw new Error("Missing case for Err");
      return cases.Err(matcher.unwrapErr());
    }
    if ("isSome" in matcher) {
      if (matcher.isSome()) {
        if (!cases.Some) throw new Error("Missing case for Some");
        return cases.Some(matcher.unwrap());
      }
      if (!cases.None) throw new Error("Missing case for None");
      return cases.None();
    }
    if (discriminant) {
      const dv = matcher[discriminant];
      const h = cases[dv];
      if (h) return h(matcher);
      if (cases.default) return cases.default(matcher);
      throw new Error(`No case found for discriminant value: ${String(dv)}`);
    }
    for (const k in matcher) {
      if (k === "default") continue;
      if (k in cases) {
        const h = cases[k];
        if (h) {
          return typeof h === "function" ? h(matcher[k]) : h();
        }
      }
    }
    if (cases.default) return cases.default();
  }
  throw new Error("Invalid matcher or missing case");
}

// ---------------------------------------------------------------------------
// H4 — Symbol tag on variant instances. Single property read + single lookup.
// Tagged classes mirror the real Ok/Err/Some/None shape (same field names).
// ---------------------------------------------------------------------------
const TAG = Symbol.for("@consolidados/results.tag");

class TaggedOk<T> {
  [TAG] = "Ok" as const;
  constructor(private _value: T) {}
  isOk() { return true; }
  isErr() { return false; }
  unwrap() { return this._value; }
  unwrapErr(): never { throw new Error("Called unwrapErr on an Ok value"); }
}
class TaggedErr<E> {
  [TAG] = "Err" as const;
  // mirror Err's "error" field name (not _error)
  // biome-ignore lint/style/useReadonlyClassProperties: bench parity with src
  error: E;
  constructor(error: E) { this.error = error; }
  isOk() { return false; }
  isErr() { return true; }
  unwrap(): never { throw new Error("Called unwrap on an Err value"); }
  unwrapErr() { return this.error; }
}
class TaggedSome<T> {
  [TAG] = "Some" as const;
  constructor(private _value: T) {}
  isSome() { return true; }
  isNone() { return false; }
  unwrap() { return this._value; }
}
class TaggedNone {
  [TAG] = "None" as const;
  isSome() { return false; }
  isNone() { return true; }
  unwrap(): never { throw new Error("Called unwrap on a None value"); }
}
const OkT = <T>(v: T) => new TaggedOk(v);
const ErrT = <E>(e: E) => new TaggedErr(e);
const SomeT = <T>(v: T) => new TaggedSome(v);
const NONE_T = new TaggedNone();
const NoneT = () => NONE_T;

// biome-ignore lint/suspicious/noExplicitAny: see H0
function matchH4(matcher: any, cases: any, discriminant?: PropertyKey): any {
  const t = typeof matcher;
  if (t === "string" || t === "number" || t === "symbol") {
    const h = cases[matcher];
    if (h) return h();
    if (cases.default) return cases.default();
    throw new Error(`No case found for value: ${String(matcher)}`);
  }
  if (matcher !== null && t === "object") {
    // O(1) tagged dispatch
    const tag = matcher[TAG];
    if (tag !== undefined) {
      const h = cases[tag];
      if (!h) throw new Error(`Missing case for ${tag}`);
      // unwrap via method (parity with H0..H3 — same call cost)
      if (tag === "Ok" || tag === "Some") return h(matcher.unwrap());
      if (tag === "Err") return h(matcher.unwrapErr());
      // None
      return h();
    }
    if (discriminant) {
      const dv = matcher[discriminant];
      const h = cases[dv];
      if (h) return h(matcher);
      if (cases.default) return cases.default(matcher);
      throw new Error(`No case found for discriminant value: ${String(dv)}`);
    }
    // mixed-union (flipped, same as H3)
    for (const k in matcher) {
      if (k === "default") continue;
      if (k in cases) {
        const h = cases[k];
        if (h) {
          return typeof h === "function" ? h(matcher[k]) : h();
        }
      }
    }
    if (cases.default) return cases.default();
  }
  throw new Error("Invalid matcher or missing case");
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const okR = Ok(42);
const errR = Err("boom");
const someR = Some(42);
const noneR = None();

const okT = OkT(42);
const errT = ErrT("boom");
const someT = SomeT(42);
const noneT = NoneT();

const resultCases = {
  Ok: (v: number) => v,
  Err: (_: string) => -1,
};
const optionCases = {
  Some: (v: number) => v,
  None: () => -1,
};

// primitives — small union (3) and large union (50)
const primSmallVal = "B" as "A" | "B" | "C";
const primSmallCases: Record<string, () => number> = {
  A: () => 1,
  B: () => 2,
  C: () => 3,
};

const primLargeVal = "k25";
const primLargeCases: Record<string, () => number> = {};
for (let i = 0; i < 50; i++) primLargeCases[`k${i}`] = () => i;

// mixed unions — matcher is the object variant (worst-case for current O(C) loop)
type MixedSmall = "A" | "B" | { Other: [string, string] };
const mixedSmallVal: MixedSmall = { Other: ["reason", "detail"] };
const mixedSmallCases = {
  A: () => "a",
  B: () => "b",
  Other: (d: [string, string]) => d[0],
};

type MixedMedium =
  | "S0" | "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7"
  | { ObjA: number } | { ObjB: string };
const mixedMediumVal: MixedMedium = { ObjB: "hit" };
const mixedMediumCases = {
  S0: () => 0, S1: () => 0, S2: () => 0, S3: () => 0,
  S4: () => 0, S5: () => 0, S6: () => 0, S7: () => 0,
  ObjA: (_: number) => 1,
  ObjB: (s: string) => s.length,
};

// 50-case union with the matcher variant LAST in cases order (worst-case for H0)
const mixedLargeVal: Record<string, number> = { tail: 7 };
const mixedLargeCases: Record<string, (...args: unknown[]) => unknown> = {};
for (let i = 0; i < 49; i++) {
  mixedLargeCases[`k${i}`] = () => 0;
}
mixedLargeCases.tail = (v: unknown) => v;

// discriminated union
type Disc = { kind: "A"; a: number } | { kind: "B"; b: string };
const discVal: Disc = { kind: "B", b: "hello" };
const discCases = {
  A: (x: Disc) => (x.kind === "A" ? x.a : 0),
  B: (x: Disc) => (x.kind === "B" ? x.b.length : 0),
};

// ===========================================================================
// Scenarios
// ===========================================================================

describe("Result hot path — Ok", () => {
  bench("real match()", () => { sink = match(okR, resultCases); });
  bench("H0 baseline", () => { sink = matchH0(okR, resultCases); });
  bench("H1 reorder", () => { sink = matchH1(okR, resultCases); });
  bench("H2 flip loop", () => { sink = matchH2(okR, resultCases); });
  bench("H3 reorder+flip", () => { sink = matchH3(okR, resultCases); });
  bench("H4 tag (TaggedOk)", () => { sink = matchH4(okT, resultCases); });
});

describe("Result hot path — Err", () => {
  bench("real match()", () => { sink = match(errR, resultCases); });
  bench("H0 baseline", () => { sink = matchH0(errR, resultCases); });
  bench("H1 reorder", () => { sink = matchH1(errR, resultCases); });
  bench("H2 flip loop", () => { sink = matchH2(errR, resultCases); });
  bench("H3 reorder+flip", () => { sink = matchH3(errR, resultCases); });
  bench("H4 tag (TaggedErr)", () => { sink = matchH4(errT, resultCases); });
});

describe("Option hot path — Some", () => {
  bench("real match()", () => { sink = match(someR, optionCases); });
  bench("H0 baseline", () => { sink = matchH0(someR, optionCases); });
  bench("H1 reorder", () => { sink = matchH1(someR, optionCases); });
  bench("H2 flip loop", () => { sink = matchH2(someR, optionCases); });
  bench("H3 reorder+flip", () => { sink = matchH3(someR, optionCases); });
  bench("H4 tag (TaggedSome)", () => { sink = matchH4(someT, optionCases); });
});

describe("Option hot path — None", () => {
  bench("real match()", () => { sink = match(noneR, optionCases); });
  bench("H0 baseline", () => { sink = matchH0(noneR, optionCases); });
  bench("H1 reorder", () => { sink = matchH1(noneR, optionCases); });
  bench("H2 flip loop", () => { sink = matchH2(noneR, optionCases); });
  bench("H3 reorder+flip", () => { sink = matchH3(noneR, optionCases); });
  bench("H4 tag (TaggedNone)", () => { sink = matchH4(noneT, optionCases); });
});

describe("Primitive union — small (3)", () => {
  bench("real match()", () => { sink = match(primSmallVal, primSmallCases); });
  bench("H0 baseline", () => { sink = matchH0(primSmallVal, primSmallCases); });
  bench("H3 reorder+flip", () => { sink = matchH3(primSmallVal, primSmallCases); });
  bench("H4 tag", () => { sink = matchH4(primSmallVal, primSmallCases); });
});

describe("Primitive union — large (50)", () => {
  bench("real match()", () => { sink = match(primLargeVal, primLargeCases); });
  bench("H0 baseline", () => { sink = matchH0(primLargeVal, primLargeCases); });
  bench("H3 reorder+flip", () => { sink = matchH3(primLargeVal, primLargeCases); });
  bench("H4 tag", () => { sink = matchH4(primLargeVal, primLargeCases); });
});

describe("Mixed union — n=3 (object variant)", () => {
  bench("real match()", () => { sink = match(mixedSmallVal, mixedSmallCases); });
  bench("H0 baseline", () => { sink = matchH0(mixedSmallVal, mixedSmallCases); });
  bench("H2 flip loop", () => { sink = matchH2(mixedSmallVal, mixedSmallCases); });
  bench("H3 reorder+flip", () => { sink = matchH3(mixedSmallVal, mixedSmallCases); });
  bench("H4 tag", () => { sink = matchH4(mixedSmallVal, mixedSmallCases); });
});

describe("Mixed union — n=10 (object variant)", () => {
  bench("real match()", () => { sink = match(mixedMediumVal as never, mixedMediumCases as never); });
  bench("H0 baseline", () => { sink = matchH0(mixedMediumVal, mixedMediumCases); });
  bench("H2 flip loop", () => { sink = matchH2(mixedMediumVal, mixedMediumCases); });
  bench("H3 reorder+flip", () => { sink = matchH3(mixedMediumVal, mixedMediumCases); });
  bench("H4 tag", () => { sink = matchH4(mixedMediumVal, mixedMediumCases); });
});

describe("Mixed union — n=50 (object variant, worst case for H0)", () => {
  bench("real match()", () => { sink = match(mixedLargeVal as never, mixedLargeCases as never); });
  bench("H0 baseline", () => { sink = matchH0(mixedLargeVal, mixedLargeCases); });
  bench("H2 flip loop", () => { sink = matchH2(mixedLargeVal, mixedLargeCases); });
  bench("H3 reorder+flip", () => { sink = matchH3(mixedLargeVal, mixedLargeCases); });
  bench("H4 tag", () => { sink = matchH4(mixedLargeVal, mixedLargeCases); });
});

describe("Discriminated union (3rd arg)", () => {
  bench("real match()", () => { sink = match(discVal, discCases, "kind"); });
  bench("H0 baseline", () => { sink = matchH0(discVal, discCases, "kind"); });
  bench("H3 reorder+flip", () => { sink = matchH3(discVal, discCases, "kind"); });
  bench("H4 tag", () => { sink = matchH4(discVal, discCases, "kind"); });
});
