import type { Option } from "@/option";
import type { Result } from "@/result";

describe("Result Test Suite", () => {
  it("should handle Ok case", () => {
    const sut: Result<string, Error> = Ok("Success");

    const result = match(sut, {
      Ok: (value) => `Value: ${value}`,
      Err: (error) => {
        throw new Error(`Error: ${(error as Error).message}`);
      },
    });

    expect(result).toBe("Value: Success");
  });

  it("should handle Err case", () => {
    const sut: Result<string, Error> = Err(new Error("Success"));

    const result = match(sut, {
      Ok: (value) => `Value: ${value}`,
      Err: (_) => "Value: Error",
    });

    expect(result).toBe("Value: Error");
  });
});

describe("Option Test Suite", () => {
  it("should handle Some and None cases", () => {
    const sut: Option<number> = Some(42);

    const result = match(sut, {
      Some: (value) => `Value: ${value}`,
      None: () => "No value",
    });

    expect(result).toBe("Value: 42");
  });

  it("should handle None case", () => {
    const sut: Option<number> = None();

    const result = match(sut, {
      Some: (value) => `Value: ${value}`,
      None: () => "No value",
    });

    match(sut, {
      Some: (_) => 1,
      None: () => 0,
    });

    expect(result).toBe("No value");
  });

  it("should convert Result to Option", () => {
    const sut: Result<string, Error> = Ok("Success");
    const result = match(sut, {
      Ok: (value) => Some(value),
      Err: (_) => None(),
    });

    expect(result.unwrap()).toBe("Success");
  });

  it("should convert Option to Result", () => {
    const sut: Option<string> = Some("Success");
    const result = match(sut, {
      Some: (value) => Ok(value),
      None: () => Err("Some Error"),
    });

    expect(result.unwrap()).toBe("Success");
  });
});

describe("match - mixed primitive + object unions", () => {
  type ServiceError =
    | "ConnectionFailed"
    | "InvalidConfiguration"
    | { Other: [string, string] };

  it("should match primitive string in mixed union", () => {
    const err: ServiceError = "ConnectionFailed" as ServiceError;

    const result = match(err, {
      ConnectionFailed: () => "connection",
      InvalidConfiguration: () => "config",
      Other: (data: [string, string]) => `other: ${data[0]}`,
      default: () => "unknown",
    });

    expect(result).toBe("connection");
  });

  it("should match object variant in mixed union", () => {
    const err: ServiceError = { Other: ["reason", "error"] } as ServiceError;

    const result = match(err, {
      ConnectionFailed: () => "connection",
      InvalidConfiguration: () => "config",
      Other: (data: [string, string]) => `other: ${data[0]}`,
      default: () => "unknown",
    });

    expect(result).toBe("other: reason");
  });

  it("should use default for unmatched value", () => {
    const err: ServiceError = "InvalidConfiguration" as ServiceError;

    const result = match(err, {
      ConnectionFailed: () => "connection",
      Other: (data: [string, string]) => `other: ${data[0]}`,
      default: () => "unknown",
    });

    expect(result).toBe("unknown");
  });

  it("should work without default (exhaustive)", () => {
    const err: ServiceError = "ConnectionFailed" as ServiceError;

    const result = match(err, {
      ConnectionFailed: () => "connection",
      InvalidConfiguration: () => "config",
      Other: (data: [string, string]) => `other: ${data[0]}`,
    });

    expect(result).toBe("connection");
  });

  it("should require all cases when no default (exhaustive) - runtime test", () => {
    const err: ServiceError = { Other: ["reason", "error"] } as ServiceError;

    // All cases covered - should work
    const result = match(err, {
      ConnectionFailed: () => "connection",
      InvalidConfiguration: () => "config",
      Other: (data: [string, string]) => `other: ${data[0]}`,
    });

    expect(result).toBe("other: reason");
  });

  it("should work with partial cases when default is provided", () => {
    const err: ServiceError = "InvalidConfiguration" as ServiceError;

    // Only some cases provided, but has default
    const result = match(err, {
      ConnectionFailed: () => "connection",
      // InvalidConfiguration missing - should use default
      default: () => "fallback",
    });

    expect(result).toBe("fallback");
  });

  // TypeScript compile-time exhaustiveness test examples:
  // The following should NOT compile due to missing cases without default:
  //
  // const err1: ServiceError = "ConnectionFailed";
  // match(err1, {
  //   ConnectionFailed: () => "connection",
  //   // Missing InvalidConfiguration and Other - TypeScript should error
  // });
  //
  // This SHOULD compile (has default):
  // match(err1, {
  //   ConnectionFailed: () => "connection",
  //   // Missing cases OK because of default
  //   default: () => "fallback",
  // });
});

describe("match - type inference for mixed unions", () => {
  type ServiceError =
    | "ConnectionFailed"
    | "InvalidConfiguration"
    | { Other: [string, string] };

  it("should infer correct types WITHOUT default (exhaustive)", () => {
    const err: ServiceError = { Other: ["reason", "detail"] } as ServiceError;

    // All cases required - should compile
    const result = match(err, {
      ConnectionFailed: () => "connection",
      InvalidConfiguration: () => "config",
      Other: (data) => {
        // data should be inferred as [string, string]
        expect(data).toEqual(["reason", "detail"]);
        return `other: ${data[0]}`;
      },
    });

    expect(result).toBe("other: reason");
  });

  it("should allow partial cases WITH default", () => {
    const err: ServiceError = "InvalidConfiguration" as ServiceError;

    // Some cases missing, but has default
    const result = match(err, {
      ConnectionFailed: () => "connection",
      // InvalidConfiguration and Other missing
      default: () => "fallback",
    });

    expect(result).toBe("fallback");
  });

  it("should properly type object property values", () => {
    type ComplexError =
      | "Simple"
      | { Details: { code: number; message: string } }
      | { Metadata: string[] };

    const err: ComplexError = {
      Details: { code: 404, message: "Not found" },
    } as ComplexError;

    const result = match(err, {
      Simple: () => "simple",
      Details: (details) => {
        // details should be inferred as { code: number; message: string }
        expect(details.code).toBe(404);
        return `Error ${details.code}`;
      },
      Metadata: (meta) => {
        // meta should be inferred as string[]
        return meta.join(", ");
      },
    });

    expect(result).toBe("Error 404");
  });

  it("should handle metadata array case", () => {
    type ComplexError =
      | "Simple"
      | { Details: { code: number; message: string } }
      | { Metadata: string[] };

    const err: ComplexError = {
      Metadata: ["tag1", "tag2", "tag3"],
    } as ComplexError;

    const result = match(err, {
      Simple: () => "simple",
      Details: (details) => `Error ${details.code}`,
      Metadata: (meta) => {
        // meta should be inferred as string[]
        expect(Array.isArray(meta)).toBe(true);
        expect(meta.length).toBe(3);
        return meta.join(", ");
      },
    });

    expect(result).toBe("tag1, tag2, tag3");
  });
});

// TypeScript compile-time tests (should be commented out):
//
// type TestError = "A" | "B" | { Other: string };
//
// // ❌ Should NOT compile - missing cases without default
// const test1: TestError = "A";
// match(test1, {
//   A: () => "a",
//   // Missing B and Other - should be TypeScript error
// });
//
// // ✅ Should compile - all cases covered
// match(test1, {
//   A: () => "a",
//   B: () => "b",
//   Other: (val) => val,  // val should be string
// });
//
// // ✅ Should compile - has default
// match(test1, {
//   A: () => "a",
//   default: () => "fallback",
// });
