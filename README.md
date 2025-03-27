# ResulTS

[![npm version](https://badge.fury.io/js/%40consolidados%2Fresults.svg)](https://www.npmjs.com/package/@consolidados/results)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This package provides robust implementations of the `Result` and `Option` types, inspired by functional programming principles, to handle success/failure scenarios and optional values in your TypeScript backend applications. It also includes helper functions and a `match` function for convenient usage.

The `Result<T, E>` type is heavily inspired by Rust's `Result` and aims to provide a
robust way to handle success and failure scenarios in TypeScript.

The `Option<T>` type is heavily inspired by Rust's `Option` and aims to provide a robust way to handle optional values in TypeScript,
avoiding `null` and `undefined` issues.

## Installation (Global Availability Recommended)

For ease of use, the `Ok`, `Err`, `Some`, `None`, and `match` functions can be made globally available in your TypeScript project.

1. **Configure `tsconfig.json`:**

    Within the `compilerOptions`, add the following to the `types` array:

    ```json
    "types": ["vitest/globals", "@consolidados/results/globals"]
    ```

2. **Import in Entry Point (e.g., `main.ts` or `index.ts`):**

    Import the entire package in your main application file:

    ```typescript
    // main.ts
    import "@consolidados/results";
    ```

    After this setup, you can use `Ok`, `Err`, `Some`, `None`, and `match` directly in your code without explicit imports.

## Core Concepts

### `Result<T, E>`

The `Result<T, E>` type represents the outcome of an operation that can either succeed with a value of type `T` or fail with an error of type `E` (typically extending `Error`).

**Generic Types:**

- `T`: The type of the successful value.
- `E`: The type of the error value (should extend `Error`).

**Usage Example:**

```typescript
function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return Err(new Error("Cannot divide by zero"));
  }
  return Ok(a / b);
}

const result1 = divide(10, 2);
const result2 = divide(10, 0);

if (result1.isOk()) {
  console.log("Result:", result1.unwrap()); // Output: Result: 5
}

if (result2.isErr()) {
  console.error("Error:", result2.unwrapErr().message); // Output: Error: Cannot divide by zero
}
```

#### `Ok<T>`

Represents a successful result containing a value of type `T`.

**Constructor:**

```TypeScript

new Ok<T>(value: T)
```

**Example:**

```TypeScript

const successResult: Result<string, Error> = Ok("Operation successful");
```

#### `Err<E extends Error>`

Represents a failed result containing an error of type `E`.

**Constructor:**

```TypeScript

new Err<E>(error: E | string)
```

**Example:**

```TypeScript

const failureResult: Result<number, Error> = Err(new Error("Operation failed"));
const failureResultWithMessage: Result<number, Error> = Err("Something went wrong");
```

#### Result Methods

- **`isOk(): this is Ok<T>`**: Checks if the result is a successful `Ok` value.
- **`isErr(): this is Err<E>`**: Checks if the result is a failed `Err` value.
- **`unwrap(): T`**: Extracts the successful value or throws an error if it's an `Err`.
- **`unwrapErr(): E`**: Extracts the error value or throws an error if it's an `Ok`.
- **`map<U>(fn: (value: T) => U): Result<U, E>`**: Applies a transformation function to the value of an `Ok`.
- **`flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>`**: Applies a function that returns a `Result` to the value of an `Ok`.
- **`mapErr<U extends Error>(fn: (err: E) => U): Result<T, U>`**: Applies a transformation function to the error value of an `Err`.

### `Option<T>`

The `Option<T>` type represents an optional value that may or may not exist.

**Generic Type:**

- `T`: The type of the optional value.

**Usage Example:**

```TypeScript

function findUser(id: number): Option<string> {
  if (id === 123) {
    return Some("John Doe");
  }
  return None();
}

const user1 = findUser(123);
const user2 = findUser(456);

if (user1.isSome()) {
  console.log("User:", user1.unwrap()); // Output: User: John Doe
}

if (user2.isNone()) {
  console.log("User not found"); // Output: User not found
}```

#### `Some<T>`

Represents an `Option` that contains a value of type `T`.

**Constructor:**

```TypeScript

new Some<T>(value: T)
```

**Example:**

```TypeScript

const presentValue: Option<number> = Some(42);
```

#### `None`

Represents an `Option` that does not contain a value.

**Example:**

```TypeScript

const absentValue: Option<string> = None();
```

#### Option Methods

- **`isSome(): this is Some<T>`**: Checks if the option contains a value (`Some`).
- **`isNone(): this is None`**: Checks if the option does not contain a value (`None`).
- **`unwrap(): T`**: Extracts the value from a `Some` or throws an error if it's `None`.
- **`map<U>(fn: (value: T) => U): Option<U>`**: Applies a transformation function to the value of a `Some`.
- **`flatMap<U>(fn: (value: T) => Option<U>): Option<U>`**: Applies a function that returns an `Option` to the value of a `Some`.
- **`unwrapOr(defaultValue: T): T`**: Extracts the value from a `Some` or returns a default value if it's `None`.

### `match` Function

The `match` function provides a concise way to handle different cases for both `Result` and `Option` types.

**Usage with `Result`:**

```TypeScript

const result: Result<string, Error> = Ok("Success");

const optionResult: Option<string> = match(result, {
  Ok: (value) => Some(value),
  Err: (error) => None(),
});

match(result, {
  Ok: (value) => console.log("Success Value: " + value),
  Err: (err) => console.log("Err Value: " + err),
});
```

**Usage with `Option`:**

```TypeScript

`const someValue: Option<number> = Some(10);

match(someValue, {
  Some: (value) => console.log("Option has value: " + value),
  None: () => console.log("Option is None"),
});

match(someValue, {
  Some: (value) => Ok(value),
  None: () => Err("Option is None"),
});
```

## API Reference

### `Result<T, E>`

#### Methods

- **`isOk(): this is Ok<T>`**
  - Checks if the result is an `Ok` instance.
  - Returns: `true` if it's an `Ok`, `false` otherwise.
- **`isErr(): this is Err<E>`**
  - Checks if the result is an `Err` instance.
  - Returns: `true` if it's an `Err`, `false` otherwise.
- **`unwrap(): T`**
  - Retrieves the value contained in an `Ok` instance.
  - Throws an `Error` if called on an `Err` instance.
- **`unwrapErr(): E`**
  - Retrieves the error contained in an `Err` instance.
  - Throws an `Error` if called on an `Ok` instance.
- **`map<U>(fn: (value: T) => U): Result<U, E>`**
  - Applies a function `fn` to the value of an `Ok` instance and returns a new `Result` with the transformed value.
  - If the `Result` is an `Err`, it returns the original `Err` without applying the function.
  - Parameters:
    - `fn: (value: T) => U`: The function to apply to the value.
  - Returns: A new `Result` with the transformed value or the original `Err`.
- **`flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>`**
  - Applies a function `fn` that returns a `Result` to the value of an `Ok` instance.
  - If the `Result` is an `Err`, it returns the original `Err`.
  - Parameters:
    - `fn: (value: T) => Result<U, E>`: The function to apply to the value.
  - Returns: The result of applying the function or the original `Err`.
- **`mapErr<U extends Error>(fn: (err: E) => U): Result<T, U>`**
  - Applies a function `fn` to the error of an `Err` instance and returns a new `Result` with the transformed error.
  - If the `Result` is an `Ok`, it returns the original `Ok` without applying the function.
  - Parameters:
    - `fn: (err: E) => U`: The function to apply to the error.
  - Returns: A new `Result` with the transformed error or the original `Ok`.

### `Option<T>`

#### Methods

- **`isSome(): this is Some<T>`**
  - Checks if the option is a `Some` instance.
  - Returns: `true` if it's a `Some`, `false` otherwise.
- **`isNone(): this is None`**
  - Checks if the option is a `None` instance.
  - Returns: `true` if it's a `None`, `false` otherwise.
- **`unwrap(): T`**
  - Retrieves the value contained in a `Some` instance.
  - Throws an `Error` if called on a `None` instance.
- **`map<U>(fn: (value: T) => U): Option<U>`**
  - Applies a function `fn` to the value of a `Some` instance and returns a new `Option` with the transformed value.
  - If the `Option` is `None`, it returns `None`.
  - Parameters:
    - `fn: (value: T) => U`: The function to apply to the value.
  - Returns: A new `Option` with the transformed value or `None`.
- **`flatMap<U>(fn: (value: T) => Option<U>): Option<U>`**
  - Applies a function `fn` that returns an `Option` to the value of a `Some` instance.
  - If the `Option` is `None`, it returns `None`.
  - Parameters:
    - `fn: (value: T) => Option<U>`: The function to apply to the value.
  - Returns: The result of applying the function or `None`.
- **`unwrapOr(defaultValue: T): T`**
  - Retrieves the value contained in a `Some` instance.
  - If the `Option` is `None`, it returns the provided `defaultValue`.
  - Parameters:
    - `defaultValue: T`: The value to return if the `Option` is `None`.
  - Returns: The value of the `Some` instance or the `defaultValue`.

### `match` Function

- Provides pattern matching for `Result` and `Option` types.
- Requires handlers for all possible cases (`Ok`, `Err` for `Result`; `Some`, `None` for `Option`).

## Work in Progress (WIP)

### `Result`

#### Current Implementation

The `Result` type currently implements the following methods:

- [x] `isOk()`: Checks if the result is `Ok`.
- [x] `isErr()`: Checks if the result is `Err`.
- [x] `unwrap()`: Extracts the successful value or throws an error.
- [x] `unwrapErr()`: Extracts the error value.
- [x] `map(fn)`: Maps a successful value using a function.
- [x] `flatMap(fn)`: Applies a function that returns a `Result`.
- [x] `mapErr(fn)`: Maps an error value using a function.

#### Methods to be Developed

The following methods are planned for future development:

- [ ] `expect(message)`: Extracts the successful value or throws an error with a custom message.
- [ ] `ok()`: Converts `Result<T, E>` into `Option<T>`.
- [ ] `err()`: Converts `Result<T, E>` into `Option<E>`.
- [ ] `and(res)`: Returns `Err` if `self` is `Err`, otherwise returns `res`.
- [ ] `andThen(fn)`: Calls `fn` if the result is `Ok`, otherwise returns `Err`.
- [ ] `or(res)`: Returns `Ok` if `self` is `Ok`, otherwise returns `res`.
- [ ] `orElse(fn)`: Calls `fn` if the result is `Err`, otherwise returns `Ok`.
- [ ] `unwrapOr(defaultValue)`: Extracts the successful value or returns a default value.
- [ ] `unwrapOrElse(fn)`: Extracts the successful value or calls a function to get a default value.
- [ ] `transpose()`: Transposes a `Result<Option<T>, E>` into an `Option<Result<T, E>>`.
- [ ] `flatten()`: Flattens a nested `Result<Result<T, E>, E>` into a `Result<T, E>`.

### `Option`

#### Current Implementation

The `Option` type currently implements the following methods:

- [x] `isSome()`: Checks if the option is `Some`.
- [x] `isNone()`: Checks if the option is `None`.
- [x] `unwrap()`: Extracts the value or throws an error if `None`.
- [x] `map(fn)`: Maps a `Some` value using a function.
- [x] `flatMap(fn)`: Applies a function that returns an `Option`.
- [x] `unwrapOr(defaultValue)`: Extracts the value or returns a default value.

#### Methods to be Developed

The following methods are planned for future development:

- [ ] `expect(message)`: Extracts the value or throws an error with a custom message if `None`.
- [ ] `okOr(err)`: Converts `Option<T>` into `Result<T, E>`.
- [ ] `okOrElse(errFn)`: Converts `Option<T>` into `Result<T, E>` using a function to create the error.
- [ ] `and(optb)`: Returns `None` if `self` is `None`, otherwise returns `optb`.
- [ ] `andThen(fn)`: Calls `fn` if the option is `Some`, otherwise returns `None`.
- [ ] `or(optb)`: Returns `self` if `Some`, otherwise returns `optb`.
- [ ] `orElse(fn)`: Returns `self` if `Some`, otherwise calls `fn` to get an `Option`.
- [ ] `unwrapOrElse(fn)`: Extracts the value or calls a function to get a default value.
- [ ] `filter(predicate)`: Returns `Some` if the value matches the predicate, otherwise `None`.
- [ ] `zip(other)`: Zips two `Option` values into a tuple if both are `Some`.
- [ ] `zipWith(other, fn)`: Zips two `Option` values using a function if both are `Some`.
- [ ] `transpose()`: Transposes an `Option<Result<T, E>>` into a `Result<Option<T>, E>`.

## Contributing

Contributions to this package are welcome. Feel free to open issues and submit pull requests.
