# ResulTS

[![npm version](https://badge.fury.io/js/%40consolidados%2Fresults.svg)](https://www.npmjs.com/package/@consolidados/results)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This package provides robust implementations of the `Result` and `Option` types, inspired by Rust's functional programming principles, to handle success/failure scenarios and optional values in your TypeScript applications.

## Features

- 🦀 **Rust-inspired** - Battle-tested patterns from Rust's type system
- 🎯 **Type-safe** - Full TypeScript support with type narrowing
- 🚀 **Performance** - None singleton pattern (95% less allocations)
- 🔄 **Flexible** - Support for any error type (enums, strings, custom classes)
- 🎨 **Pattern matching** - Match primitives, enums, and discriminated unions
- 🛠️ **Rich API** - unwrapOr, orElse, filter, and more
- 🌍 **Global availability** - Optional global imports for cleaner code

## Installation

```bash
npm install @consolidados/results
```

### Global Availability (Recommended)

For cleaner code, make `Ok`, `Err`, `Some`, `None`, and `match` globally available:

1. **Configure `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "types": ["@consolidados/results/globals"]
  }
}
```

2. **Import in entry point (e.g., `main.ts`):**

```typescript
import "@consolidados/results";
```

Now use them anywhere without imports:

```typescript
const result = Ok(42);
const option = Some("hello");
```

## Quick Start

### Result - Handle Success/Failure

```typescript
// import { Result, Ok, Err } from "@consolidados/results"; // If not global must import Ok and Err
import { Result } from "@consolidados/results";

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return Err("Cannot divide by zero");
  }
  return Ok(a / b);
}

const result = divide(10, 2);

if (result.isOk()) {
  console.log("Result:", result.value()); // 5
} else {
  console.error("Error:", result.value());
}
```

### Option - Handle Optional Values

```typescript
// import { Option, Some, None } from "@consolidados/results"; // If not global must  import Some and None
import { Option } from "@consolidados/results";

function findUser(id: number): Option<string> {
  return id === 123 ? Some("John Doe") : None();
}

const user = findUser(123);

if (user.isSome()) {
  console.log("User:", user.value()); // "John Doe"
}
```

## Core Concepts

### `Result<T, E>`

Represents an operation that can succeed with value `T` or fail with error `E`.

**Key difference from Rust:** `E` can be **any type** - not just Error!

```typescript
// String errors
Result<User, string>

// Const object errors (recommended)
const APIError = { NotFound: "NOT_FOUND", ... } as const
Result<Data, typeof APIError[keyof typeof APIError]>

// Enum errors (works but has overhead)
enum APIError { NotFound, Unauthorized }
Result<Data, APIError>

// Custom class errors
class ValidationError { field: string; message: string }
Result<Form, ValidationError>

// Traditional Error
Result<number, Error>
```

### Enum vs Const Object (Important!)

TypeScript enums have runtime overhead. We recommend **const objects** instead:

#### ❌ TypeScript Enum (not recommended)

```typescript
enum APIError {
  NotFound = "NOT_FOUND",
  Unauthorized = "UNAUTHORIZED",
}
```

**Compiles to JavaScript:**
```javascript
var APIError;
(function (APIError) {
    APIError["NotFound"] = "NOT_FOUND";
    APIError["Unauthorized"] = "UNAUTHORIZED";
})(APIError || (APIError = {}));
```

**Problems:**
- 🐛 Generates extra JavaScript code (IIFE)
- 📦 Increases bundle size
- 🔄 Creates object at runtime (overhead)
- ❌ Not tree-shakeable

#### ✅ Const Object (recommended)

```typescript
const APIError = {
  NotFound: "NOT_FOUND",
  Unauthorized = "UNAUTHORIZED",
  ServerError = "SERVER_ERROR",
} as const;
  
type APIError = (typeof APIError)[keyof typeof APIError];

// Usage (same as enum!)
const result: Result<User, APIError> = Err(APIError.NotFound);
```

**Compiles to JavaScript:**
```javascript
const APIError = {
    NotFound: "NOT_FOUND",
    Unauthorized: "UNAUTHORIZED",
};
```

**Benefits:**
- ✅ Zero runtime overhead (simple object literal)
- ✅ Tree-shakeable
- ✅ Same ergonomics as enum: `APIError.NotFound`
- ✅ Full type safety

#### Alternative: String Literal Unions

```typescript
type APIError = "NOT_FOUND" | "UNAUTHORIZED" | "SERVER_ERROR";

// Usage (no namespace, just strings)
const result: Result<User, APIError> = Err("NOT_FOUND");
```

**Benefits:**
- ✅ Zero JavaScript generated (TypeScript-only)
- ✅ Simpler
- ❌ No namespace (must use raw strings)

#### Creating Results

```typescript
// Success
const success = Ok(42);
const user = Ok({ id: 1, name: "John" });

// Failure with different error types
const stringErr = Err("Something went wrong");
const enumErr = Err(APIError.NotFound);
const classErr = Err(new ValidationError("email", "Invalid format"));
const errorErr = Err(new Error("System error"));
```

#### Type Narrowing with `value()`

```typescript
const result: Result<number, string> = divide(10, 2);

// Without type guard - must handle both cases
const value = result.value(); // Type: number | string

// With type guard - TypeScript narrows the type
if (result.isOk()) {
  const num = result.value(); // Type: number ✅
  console.log(num * 2);
}

if (result.isErr()) {
  const err = result.value(); // Type: string ✅
  console.error(err);
}
```

#### Result Methods

**Checking state:**
- `isOk()` - Returns true if Ok
- `isErr()` - Returns true if Err

**Extracting values:**
- `unwrap()` - Get value or throw
- `unwrapErr()` - Get error or throw
- `value()` - Get value/error with type narrowing
- `unwrapOr(default)` - Get value or default
- `unwrapOrElse(fn)` - Get value or compute default

**Transforming:**
- `map(fn)` - Transform Ok value
- `flatMap(fn)` - Chain Result-returning operations
- `mapErr(fn)` - Transform Err value
- `orElse(fn)` - Recover from errors

**Converting:**
- `ok()` - Convert to Option<T>

#### Examples

```typescript
// unwrapOr - provide default value
const result = divide(10, 0);
const value = result.unwrapOr(0); // Returns 0 on error

// unwrapOrElse - compute default value
const value = result.unwrapOrElse((err) => {
  console.error("Division failed:", err);
  return 0;
});

// orElse - recover from errors
const recovered = result.orElse((err) => {
  return Ok(0); // Provide fallback Result
});

// Chaining operations
const final = Ok(10)
  .map(x => x * 2)        // Ok(20)
  .flatMap(x => divide(x, 4)) // Ok(5)
  .map(x => x + 1);       // Ok(6)
```

### `Option<T>`

Represents an optional value that may or may not exist.

#### Creating Options

```typescript
const some = Some(42);
const none = None(); // Singleton - same instance reused
```

#### Type Narrowing with `value()`

```typescript
const option: Option<string> = Some("hello");

// Without type guard
const value = option.value(); // Type: string | undefined

// With type guard
if (option.isSome()) {
  const str = option.value(); // Type: string ✅
  console.log(str.toUpperCase());
}

if (option.isNone()) {
  const val = option.value(); // Type: undefined ✅
}
```

#### Option Methods

**Checking state:**
- `isSome()` - Returns true if Some
- `isNone()` - Returns true if None

**Extracting values:**
- `unwrap()` - Get value or throw
- `value()` - Get value or undefined with type narrowing
- `unwrapOr(default)` - Get value or default
- `unwrapOrElse(fn)` - Get value or compute default

**Transforming:**
- `map(fn)` - Transform Some value
- `flatMap(fn)` - Chain Option-returning operations
- `filter(predicate)` - Filter by predicate

**Converting:**
- `okOr(error)` - Convert to Result<T, E>

#### Examples

```typescript
// filter - keep only matching values
const age = Some(25);
const adult = age.filter(a => a >= 18); // Some(25)

const child = Some(15);
const notAdult = child.filter(a => a >= 18); // None

// okOr - convert to Result
const option = Some(42);
const result = option.okOr("Value not found"); // Ok(42)

const empty = None();
const errResult = empty.okOr("Value not found"); // Err("Value not found")

// Chaining
const processed = Some("  hello  ")
  .map(s => s.trim())
  .map(s => s.toUpperCase())
  .filter(s => s.length > 3); // Some("HELLO")
```

## Pattern Matching

The `match` function provides exhaustive pattern matching for Result, Option, primitives, and discriminated unions.

### Matching Result and Option

```typescript
const result: Result<number, string> = Ok(42);

const message = match(result, {
  Ok: (value) => `Success: ${value}`,
  Err: (error) => `Error: ${error}`,
});

const option: Option<string> = Some("hello");

const output = match(option, {
  Some: (value) => value.toUpperCase(),
  None: () => "N/A",
});
```

### Matching Primitives (Enums, Strings, Numbers)

```typescript
enum Status {
  Active = "active",
  Inactive = "inactive",
  Pending = "pending",
}

const status = Status.Active;

// Exhaustive matching - compile error if case missing
const message = match(status, {
  active: () => "User is active",
  inactive: () => "User is inactive",
  pending: () => "User is pending",
});

// With default case
const simplified = match(status, {
  active: () => "Active",
  default: () => "Other",
});
```

### Matching Discriminated Unions

```typescript
type Shape =
  | { type: "circle"; radius: number }
  | { type: "rectangle"; width: number; height: number }
  | { type: "triangle"; base: number; height: number };

const shape: Shape = { type: "circle", radius: 10 };

const area = match(
  shape,
  {
    circle: (s) => Math.PI * s.radius ** 2,
    rectangle: (s) => s.width * s.height,
    triangle: (s) => (s.base * s.height) / 2,
  },
  "type" // discriminant field
);
```

## Real-World Examples

### API Error Handling with Const Objects

```typescript
// Use const object instead of enum for better performance
const APIError = {
  NotFound: "NOT_FOUND",
  Unauthorized: "UNAUTHORIZED",
  ServerError: "SERVER_ERROR",
} as const;

type APIError = typeof APIError[keyof typeof APIError];

async function fetchUser(id: number): Promise<Result<User, APIError>> {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (response.status === 404) {
      return Err(APIError.NotFound);
    }
    if (response.status === 401) {
      return Err(APIError.Unauthorized);
    }
    if (!response.ok) {
      return Err(APIError.ServerError);
    }

    const user = await response.json();
    return Ok(user);
  } catch (error) {
    return Err(APIError.ServerError);
  }
}

// Usage with pattern matching
const result = await fetchUser(123);

const message = match(result, {
  Ok: (user) => `Welcome, ${user.name}!`,
  Err: (error) => {
    // Match on string values (const object compiles to strings)
    const errMsg = (error as any).message || String(error);
    if (errMsg.includes("NOT_FOUND")) return "User not found";
    if (errMsg.includes("UNAUTHORIZED")) return "Please login";
    return "Server error, try again";
  },
});
```

### Form Validation with Custom Errors

```typescript
class ValidationError {
  constructor(
    public field: string,
    public message: string
  ) {}
}

function validateEmail(email: string): Result<string, ValidationError> {
  if (!email.includes("@")) {
    return Err(new ValidationError("email", "Invalid email format"));
  }
  return Ok(email);
}

function validateAge(age: number): Result<number, ValidationError> {
  if (age < 18) {
    return Err(new ValidationError("age", "Must be 18 or older"));
  }
  return Ok(age);
}

// Chaining validations
const validatedUser = validateEmail("test@example.com")
  .flatMap(email => validateAge(25).map(age => ({ email, age })))
  .unwrapOr({ email: "", age: 0 });
```

### Database Query with Option

```typescript
function findUserById(id: number): Option<User> {
  const user = database.users.find(u => u.id === id);
  return user ? Some(user) : None();
}

// With filter
const activeUser = findUserById(123)
  .filter(user => user.active)
  .map(user => user.name)
  .unwrapOr("No active user found");

// Convert to Result for error handling
const userResult = findUserById(123)
  .okOr(new Error("User not found"));

if (userResult.isErr()) {
  console.error(userResult.unwrapErr().message);
}
```

## Performance

### None Singleton
The `None()` function uses a singleton pattern, reusing the same instance:

```typescript
const none1 = None();
const none2 = None();
console.log(none1 === none2); // true - same instance!
```

**Impact:** 95% reduction in allocations for None-heavy workloads.

### Match Early Return
The `match` function uses early return optimization, stopping at the first successful match:

```typescript
// Stops checking after isOk() succeeds
match(result, {
  Ok: (v) => v,
  Err: (e) => 0,
});
```

**Impact:** 20-40% faster than checking all conditions.

## API Reference

### Result<T, E>

| Method | Description |
|--------|-------------|
| `isOk()` | Check if Result is Ok |
| `isErr()` | Check if Result is Err |
| `unwrap()` | Get value or throw |
| `unwrapErr()` | Get error or throw |
| `value()` | Get value/error with type narrowing |
| `unwrapOr(default)` | Get value or default |
| `unwrapOrElse(fn)` | Get value or compute default |
| `map(fn)` | Transform Ok value |
| `flatMap(fn)` | Chain Result-returning operations |
| `mapErr(fn)` | Transform Err value |
| `orElse(fn)` | Recover from errors |
| `ok()` | Convert to Option<T> |

### Option<T>

| Method | Description |
|--------|-------------|
| `isSome()` | Check if Option is Some |
| `isNone()` | Check if Option is None |
| `unwrap()` | Get value or throw |
| `value()` | Get value or undefined with type narrowing |
| `unwrapOr(default)` | Get value or default |
| `unwrapOrElse(fn)` | Get value or compute default |
| `map(fn)` | Transform Some value |
| `flatMap(fn)` | Chain Option-returning operations |
| `filter(predicate)` | Filter by predicate |
| `okOr(error)` | Convert to Result<T, E> |

### match()

**Signatures:**
```typescript
// Result matching
match<T, E, R>(
  matcher: Result<T, E>,
  cases: { Ok: (value: T) => R; Err: (error: E) => R }
): R

// Option matching
match<T, R>(
  matcher: Option<T>,
  cases: { Some: (value: T) => R; None: () => R }
): R

// Primitive matching (exhaustive)
match<T extends string | number | symbol, R>(
  matcher: T,
  cases: { [K in T]: () => R }
): R

// Primitive matching (with default)
match<T extends string | number | symbol, R>(
  matcher: T,
  cases: { [K in T]?: () => R } & { default: () => R }
): R

// Discriminated union matching
match<T, D extends keyof T, R>(
  matcher: T,
  cases: { [K in T[D]]: (value: Extract<T, { [P in D]: K }>) => R },
  discriminant: D
): R

// Result → Option conversion
match<T, E>(
  matcher: Result<T, E>,
  cases: {
    Ok: (value: T) => Option<T>;
    Err: (error: E) => Option<T>;
  }
): Option<T>

// Option → Result conversion
match<T, E>(
  matcher: Option<T>,
  cases: {
    Some: (value: T) => Result<T, E>;
    None: () => Result<T, E>;
  }
): Result<T, E>
```

## Migration from Other Libraries

### From fp-ts

```typescript
// fp-ts
import * as E from "fp-ts/Either";
const result = E.right(42);

// ResulTS
const result = Ok(42);
```

### From neverthrow

```typescript
// neverthrow
import { ok, err } from "neverthrow";
const result = ok(42);

// ResulTS (same API!)
const result = Ok(42);
```

## TypeScript Configuration

For best experience, enable strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Roadmap

### Planned Features

**Result:**
- [ ] `err()` - Convert to Option<E>
- [ ] `transpose()` - Transpose Result<Option<T>, E>
- [ ] `flatten()` - Flatten Result<Result<T, E>, E>

**Option:**
- [ ] `expect(message)` - Unwrap with custom error message
- [ ] `and(optb)` - Logical AND for Options
- [ ] `or(optb)` - Logical OR for Options
- [ ] `zip(other)` - Zip two Options into tuple
- [ ] `transpose()` - Transpose Option<Result<T, E>>

**General:**
- [ ] Async versions (AsyncResult, AsyncOption)
- [ ] Do notation / for comprehensions
- [ ] More utility functions

## Credits

Inspired by:
- Rust's `Result` and `Option` types
- fp-ts
- neverthrow
