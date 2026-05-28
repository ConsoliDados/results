# `match` dispatch — benchmark notes

Performance of the `match()` helper before/after switching from a chained
`if`/`for...in` dispatch to a Symbol-keyed tag (H4 in the design doc).

Run with:

```sh
pnpm bench    # or: npx vitest bench --run
```

Harness: [`bench/match.bench.ts`](./bench/match.bench.ts).
Design rationale: `/home/johnny/.claude/plans/cara-tem-algo-que-staged-moler.md`.

## What changed

`Ok`, `Err`, `Some`, `None` now carry a `Symbol.for("@consolidados/results.tag")`
property whose value is the variant name (`"Ok"`, `"Err"`, `"Some"`, `"None"`).
`match()` reads that tag with a single property access and one `cases[tag]`
lookup — O(1) for the hot path with no `for...in` loop and no method-guard
calls.

The Symbol is invisible to `for...in`, `Object.keys`, and `JSON.stringify`,
so mixed primitive+object union matching is unaffected. The mixed-union loop
itself was also flipped: it now iterates the **matcher's** own keys (usually 1)
and looks each one up in `cases` — turning the O(C)-in-cases scan into
effectively O(1).

## Numbers

Measured on the author's machine (Linux 6.19 zen, Node 22, vitest 3.0.9).
"Real `match()`" = the exported function imported from `@/helpers/match`.

| Scenario | Before (ops/s) | After (ops/s) | Speedup |
| --- | --- | --- | --- |
| Result.Ok hot path | 12.4 M | 25.4 M | **2.0 ×** |
| Result.Err hot path | 11.7 M | 25.5 M | **2.2 ×** |
| Option.Some hot path | 11.5 M | 25.4 M | **2.2 ×** |
| Option.None hot path | 11.9 M | 25.4 M | **2.1 ×** |
| Primitive union — small (3) | 23.7 M | 25.3 M | 1.07 × |
| Primitive union — large (50) | 20.3 M | 21.0 M | 1.03 × |
| Mixed union — n=3 (object variant) | 11.7 M | 21.8 M | **1.86 ×** |
| Mixed union — n=10 (object variant) | 5.0 M | 16.8 M | **3.35 ×** |
| Mixed union — n=50 (object variant) | **0.5 M** | 17.4 M | **🚀 34 ×** |
| Discriminated union (3rd arg) | 21.7 M | 23.6 M | 1.09 × |

The bench file also compares five candidate strategies head-to-head
(H0 baseline, H1 reorder, H2 flip loop, H3 reorder+flip, H4 tag).
H4 was the universal winner — never regressed in any scenario — which is why
it shipped. See the design doc for the full hypothesis analysis.

## Why the worst case collapses

Before: `match({tail: 7}, cases-with-50-keys)` iterated all 50 case keys and
did a prototype-walking `key in matcher` check on each one.

After: `match()` reads `matcher[TAG]` (undefined for plain objects → cheap),
then iterates the matcher's own keys — just `["tail"]` — and looks `"tail"`
up in `cases`. One iteration, one lookup. The asymptotic linearity in
cases-size disappears.

## Correctness gate

All 103 tests in `test/` pass before and after the change. The Symbol tag
does not appear in `for...in`, `Object.keys`, or `JSON.stringify` output,
so it does not affect mixed-union matching, serialization, or any public
behavior.
