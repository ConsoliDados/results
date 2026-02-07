/** biome-ignore-all lint/suspicious/noExplicitAny: It's fine, doesn't effect the tests */
import type { Result as ResultType } from "@/result";

type Result<T> = ResultType<T, string>;

describe("Custom Result test suite", () => {
  it("should create an Ok result using a custom result type with only success type definition and access its value", () => {
    const result: Result<number> = Ok(42);

    expect(result.isOk()).toBe(true);
    expect(result.isErr()).toBe(false);
    expect(result.unwrap()).toBe(42);
  });

  it("should create an Err result using a custom result type with any type", () => {
    const result: Result<unknown> = Err("Error occurred");
    // The line below will lead to a compilation error:
    // const result: Result<never> = "Error occurred";

    expect(result.isErr()).toBe(true);
    expect(result.isOk()).toBe(false);
    expect(typeof result.unwrapErr()).toBe("string");
    expect(result.unwrapErr()).toBe("Error occurred");
  });

  it("should create an Error type Err result using a custom result type with any type", () => {
    // const result: Result<unknown> = Err(new Error("Error occurred"));
    const result: Result<unknown> = Err("Error occurred");
    // The line below will lead to a compilation error:
    // const result: Result<never> = "Error occurred";

    expect(result.isErr()).toBe(true);
    expect(result.isOk()).toBe(false);
    expect(typeof result.unwrapErr()).toBe("string");
    expect(result.unwrapErr()).toBe("Error occurred");
  });
  // TODO: create a test for custom errors
});

describe("Result with string error type", () => {
  it("should create Ok with string error type", () => {
    const result: ResultType<number, string> = Ok(42);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(42);
  });

  it("should create Err with string error type", () => {
    const result: ResultType<number, string> = Err("Something went wrong");
    expect(result.isErr()).toBe(true);
    const err = result.unwrapErr();
    expect(typeof err).toBe("string");
    expect(err).toBe("Something went wrong");
  });

  it("should work with value() method and type narrowing", () => {
    const result: ResultType<number, string> = Ok(100);

    if (result.isOk()) {
      const value = result.value();
      expect(value).toBe(100);
    }
  });

  it("should work with unwrapOr for string errors", () => {
    const okResult: ResultType<number, string> = Ok(42);
    const errResult: ResultType<number, string> = Err("error");

    expect(okResult.unwrapOr(0)).toBe(42);
    expect(errResult.unwrapOr(0)).toBe(0);
  });

  it("should work with map and mapErr for string errors", () => {
    const result: ResultType<number, string> = Ok(10);
    const mapped = result.map((x) => x * 2);

    expect(mapped.isOk()).toBe(true);
    expect(mapped.unwrap()).toBe(20);

    const errResult: ResultType<number, string> = Err("original error");
    const mappedErr = errResult.mapErr(
      (e) => `wrapped: ${(e as any).message || e}`,
    );

    expect(mappedErr.isErr()).toBe(true);
  });
});

describe("Result with enum error type", () => {
  enum APIError {
    NotFound = "NOT_FOUND",
    Unauthorized = "UNAUTHORIZED",
    ServerError = "SERVER_ERROR",
    BadRequest = "BAD_REQUEST",
  }

  it("should create Ok with enum error type", () => {
    const result: ResultType<string, APIError> = Ok("success");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("success");
  });

  it("should create Err with enum error type", () => {
    const result: ResultType<string, APIError> = Err(APIError.NotFound);
    expect(result.isErr()).toBe(true);
    const err = result.unwrapErr();
    expect(typeof err).toBe("string");
    expect(err).toBe("NOT_FOUND");
  });

  it("should work with value() and type narrowing for enums", () => {
    const result: ResultType<{ id: number }, APIError> = Err(
      APIError.Unauthorized,
    );

    if (result.isErr()) {
      const error = result.value();
      expect(typeof error).toBe("string");
      expect(error).toBe("UNAUTHORIZED");
    }
  });

  it("should work with unwrapOr for enum errors", () => {
    const okResult: ResultType<number, APIError> = Ok(42);
    const errResult: ResultType<number, APIError> = Err(APIError.ServerError);

    expect(okResult.unwrapOr(0)).toBe(42);
    expect(errResult.unwrapOr(0)).toBe(0);
  });

  it("should work with orElse for enum errors", () => {
    const result: ResultType<string, APIError> = Err(APIError.NotFound);
    const alternative = result.orElse((err) => {
      // Type-safe error handling with enum
      if (
        (err as any).message?.includes("NOT_FOUND") ||
        err === APIError.NotFound
      ) {
        return Ok("default value");
      }
      return Err(APIError.ServerError);
    });

    expect(alternative.isOk()).toBe(true);
  });

  it("should work with match for enum errors", () => {
    const result: ResultType<string, APIError> = Err(APIError.NotFound);

    const message = match(result, {
      Ok: (value) => `Success: ${value}`,
      Err: (_error) => {
        // Can handle enum errors
        return "Error occurred";
      },
    });

    expect(message).toBe("Error occurred");
  });

  it("should work with flatMap for enum errors", () => {
    const fetchUser = (id: number): ResultType<{ name: string }, APIError> => {
      if (id === 1) {
        return Ok({ name: "John" });
      }
      return Err(APIError.NotFound);
    };

    const result = Ok(1).flatMap(fetchUser);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual({ name: "John" });

    const notFoundResult = Ok(999).flatMap(fetchUser);
    expect(notFoundResult.isErr()).toBe(true);
  });
});

describe("Result with custom class error type", () => {
  class ValidationError {
    constructor(
      public field: string,
      public message: string,
    ) {}
  }

  it("should create Ok with custom class error type", () => {
    const result: ResultType<string, ValidationError> = Ok("valid data");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("valid data");
  });

  it("should create Err with custom class error type", () => {
    const validationError = new ValidationError(
      "email",
      "Invalid email format",
    );
    const result: ResultType<string, ValidationError> = Err(validationError);

    expect(result.isErr()).toBe(true);
    const err = result.unwrapErr();
    // When passing an object, Err stores it as-is
    expect(err).toBeInstanceOf(ValidationError);
    expect((err as ValidationError).field).toBe("email");
    expect((err as ValidationError).message).toBe("Invalid email format");
  });

  it("should work with unwrapOrElse for custom errors", () => {
    const validationError = new ValidationError("age", "Must be 18+");
    const result: ResultType<number, ValidationError> = Err(validationError);

    const value = result.unwrapOrElse((_err) => {
      // Type-safe access to custom error properties
      return 18; // default age
    });

    expect(value).toBe(18);
  });
});

describe("Result with number error type", () => {
  it("should create Ok with number error type", () => {
    const result: ResultType<string, number> = Ok("success");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("success");
  });

  it("should create Err with number error type (HTTP status codes)", () => {
    const result: ResultType<string, number> = Err(404);
    expect(result.isErr()).toBe(true);
    const err = result.unwrapErr();
    // When passing a number, Err stores it as-is
    expect(typeof err).toBe("number");
    expect(err).toBe(404);
  });

  it("should work with match for number errors", () => {
    const result: ResultType<string, number> = Err(500);

    const message = match(result, {
      Ok: (value) => `Success: ${value}`,
      Err: (error) => {
        // Number is stored as-is, not wrapped in Error
        if (error === 500) return "Server Error";
        if (error === 404) return "Not Found";
        return "Unknown Error";
      },
    });

    expect(message).toBe("Server Error");
  });
});

describe("Result with const object error type (recommended over enum)", () => {
  // Const object - zero runtime overhead, tree-shakeable
  const APIError = {
    NotFound: "NOT_FOUND",
    Unauthorized: "UNAUTHORIZED",
    ServerError: "SERVER_ERROR",
    BadRequest: "BAD_REQUEST",
  } as const;

  type APIError = (typeof APIError)[keyof typeof APIError];

  it("should create Ok with const object error type", () => {
    const result: ResultType<string, APIError> = Ok("success");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("success");
  });

  it("should create Err with const object error type", () => {
    const result: ResultType<string, APIError> = Err(APIError.NotFound);
    expect(result.isErr()).toBe(true);
    const err = result.unwrapErr();
    // Const object values are stored as-is (strings)
    expect(typeof err).toBe("string");
    expect(err).toBe("NOT_FOUND");
  });

  it("should have same ergonomics as enum but without overhead", () => {
    // Same usage pattern as enum
    const notFound = APIError.NotFound; // "NOT_FOUND"
    const unauthorized = APIError.Unauthorized; // "UNAUTHORIZED"

    expect(typeof notFound).toBe("string");
    expect(typeof unauthorized).toBe("string");

    // Can use in Result
    const result: ResultType<string, APIError> = Err(APIError.ServerError);
    expect(result.isErr()).toBe(true);
  });

  it("should work with value() and type narrowing", () => {
    const result: ResultType<{ id: number }, APIError> = Err(
      APIError.Unauthorized,
    );

    if (result.isErr()) {
      const error = result.value();
      expect(typeof error).toBe("string");
      expect(error).toBe("UNAUTHORIZED");
    }
  });

  it("should work with unwrapOr", () => {
    const okResult: ResultType<number, APIError> = Ok(42);
    const errResult: ResultType<number, APIError> = Err(APIError.ServerError);

    expect(okResult.unwrapOr(0)).toBe(42);
    expect(errResult.unwrapOr(0)).toBe(0);
  });

  it("should work with orElse for error recovery", () => {
    const result: ResultType<string, APIError> = Err(APIError.NotFound);
    const alternative = result.orElse((err) => {
      // Type-safe error handling
      const errStr = (err as any).message || String(err);
      if (errStr.includes("NOT_FOUND")) {
        return Ok("default value");
      }
      return Err(APIError.ServerError);
    });

    expect(alternative.isOk()).toBe(true);
  });

  it("should work with match", () => {
    const result: ResultType<string, APIError> = Err(APIError.NotFound);

    const message = match(result, {
      Ok: (value) => `Success: ${value}`,
      Err: (_error) => "Error occurred",
    });

    expect(message).toBe("Error occurred");
  });

  it("should work with flatMap for chaining", () => {
    const fetchUser = (id: number): ResultType<{ name: string }, APIError> => {
      if (id === 1) {
        return Ok({ name: "John" });
      }
      return Err(APIError.NotFound);
    };

    const result = Ok(1).flatMap(fetchUser);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual({ name: "John" });

    const notFoundResult = Ok(999).flatMap(fetchUser);
    expect(notFoundResult.isErr()).toBe(true);
  });

  it("should demonstrate bundle size advantage over enum", () => {
    // TypeScript enum compiles to:
    // var APIError;
    // (function (APIError) {
    //     APIError["NotFound"] = "NOT_FOUND";
    //     ...
    // })(APIError || (APIError = {}));
    //
    // Const object compiles to:
    // const APIError = { NotFound: "NOT_FOUND", ... };
    //
    // Result: Smaller bundle, better tree-shaking

    expect(APIError.NotFound).toBe("NOT_FOUND");
    expect(typeof APIError).toBe("object");
  });
});

describe("Result with string literal union error type", () => {
  // String literal union - zero JavaScript, type-only
  type APIError = "NOT_FOUND" | "UNAUTHORIZED" | "SERVER_ERROR";

  it("should create Ok with string literal union", () => {
    const result: ResultType<string, APIError> = Ok("success");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("success");
  });

  it("should create Err with string literal union", () => {
    const result: ResultType<string, APIError> = Err("NOT_FOUND");
    expect(result.isErr()).toBe(true);
    const err = result.unwrapErr();
    expect(typeof err).toBe("string");
    expect(err).toBe("NOT_FOUND");
  });

  it("should work with value() and type narrowing", () => {
    const result: ResultType<number, APIError> = Ok(100);

    if (result.isErr()) {
      const value = result.value();
      expect(value).toBeUndefined();
    }
    const value = result.value();
    expect(value).toBe(100);
  });

  it("should work with unwrapOr", () => {
    const okResult: ResultType<number, APIError> = Ok(42);
    const errResult: ResultType<number, APIError> = Err("SERVER_ERROR");

    expect(okResult.unwrapOr(0)).toBe(42);
    expect(errResult.unwrapOr(0)).toBe(0);
  });

  it("should work with match", () => {
    const result: ResultType<string, APIError> = Err("NOT_FOUND");

    const message = match(result, {
      Ok: (value) => `Success: ${value}`,
      Err: (error) => {
        const errMsg = (error as any).message || String(error);
        if (errMsg === "NOT_FOUND") return "User not found";
        if (errMsg === "UNAUTHORIZED") return "Please login";
        return "Error occurred";
      },
    });

    expect(message).toBe("User not found");
  });

  it("should demonstrate zero runtime overhead", () => {
    // String literal unions are TypeScript-only
    // They compile to nothing in JavaScript
    // Perfect for type safety without any cost

    const error: APIError = "NOT_FOUND";
    expect(typeof error).toBe("string");
    expect(error).toBe("NOT_FOUND");
  });

  it("should work with flatMap", () => {
    const validateStatus = (status: string): ResultType<string, APIError> => {
      if (status === "active") {
        return Ok(status);
      }
      return Err("UNAUTHORIZED");
    };

    const result = Ok("active").flatMap(validateStatus);
    expect(result.isOk()).toBe(true);
  });
});
